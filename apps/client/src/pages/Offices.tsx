import { useEffect, useState } from 'react';
import { Edit2, Trash2, Building2 } from 'lucide-react';

interface Office {
    id: string;
    code: string;
    name: string;
    tier: string;
    departments: { id: string, name: string }[];
    vetoPower: boolean;
    authorityLine: string;
}

interface Unit {
    id: string;
    name: string;
    code: string;
}

interface Designation {
    id: string;
    title: string;
    rank: number;
}

export function Offices() {
    const [offices, setOffices] = useState<Office[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [designations, setDesignations] = useState<Designation[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingOfficeId, setEditingOfficeId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        code: '',
        name: '',
        tier: 'TIER_3_EXECUTION',
        deptIds: [] as string[],
        designationId: '',
        type: 'REGIONAL_HEAD',
        vetoPower: false,
        authorityLine: '1st'
    });

    useEffect(() => {
        Promise.all([
            fetch('/api/governance/offices').then(res => res.json()),
            fetch('/api/admin/departments').then(res => res.json()),
            fetch('/api/admin/designations').then(res => res.json())
        ]).then(([officesData, unitsData, designationsData]) => {
            setOffices(officesData);
            setUnits(unitsData);
            setDesignations(designationsData);
            setLoading(false);
        }).catch(err => console.error(err));
    }, []);

    // Logic for auto-naming based on designation and type
    useEffect(() => {
        if (editingOfficeId) return; // Don't auto-fill when editing

        const designation = designations.find(d => d.id === formData.designationId);
        const unit = units.find(u => formData.deptIds.includes(u.id)); // Use first selected unit for naming

        let suggestedName = formData.name;

        if (formData.type === 'REGIONAL_HEAD' && designation) {
            if (designation.title.includes('AGM')) suggestedName = 'Senior Regional Manager';
            else if (designation.title.includes('DGM')) suggestedName = 'Chief Regional Manager';
            else suggestedName = designation.title;
        } else if (formData.type === 'DEPT_HEAD' && unit) {
            suggestedName = `Head of ${unit.name}`;
        } else if (formData.type === 'DESK_OFFICER' && unit) {
            suggestedName = `Desk Officer - ${unit.name}`;
        } else if (formData.type === 'BRANCH_HEAD' && designation) {
            suggestedName = `${designation.title} - ${formData.authorityLine} Line`;
        }

        // Apply authority line suffix if not already present for heads
        if ((formData.type === 'REGIONAL_HEAD' || formData.type === 'BRANCH_HEAD') && !suggestedName.includes(formData.authorityLine)) {
            // If it's a specific title like 'Senior Regional Manager', we might not want to append '1st Line' if it's already clear,
            // but for consistency let's append if it's 2nd line.
            if (formData.authorityLine === '2nd' && !suggestedName.endsWith('2nd Line')) {
                suggestedName += ' - 2nd Line';
            }
        }

        if (suggestedName !== formData.name) {
            setFormData(prev => ({ ...prev, name: suggestedName }));
        }
    }, [formData.type, formData.designationId, formData.deptIds, formData.authorityLine, designations, units, editingOfficeId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Singularity Validation (Only for 1st Line)
        if (formData.authorityLine === '1st' && formData.deptIds.length > 0) {
            const duplicate = offices.find(o =>
                o.authorityLine === '1st' &&
                o.id !== editingOfficeId &&
                o.departments.some(d => formData.deptIds.includes(d.id))
            );
            if (duplicate) {
                alert(`A 1st Line Head already exists for this unit: ${duplicate.name}`);
                return;
            }
        }

        const payload = { ...formData };

        try {
            if (editingOfficeId) {
                await fetch(`/api/governance/offices/${editingOfficeId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else {
                await fetch('/api/governance/offices', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }
            setShowForm(false);
            setEditingOfficeId(null);
            setFormData({ code: '', name: '', tier: 'TIER_3_EXECUTION', deptIds: [], designationId: '', type: 'REGULAR', vetoPower: false, authorityLine: '1st' });
            // Refresh
            const res = await fetch('/api/governance/offices');
            setOffices(await res.json());
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`Delete office "${name}"?`)) return;
        try {
            const res = await fetch(`/api/governance/offices/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const data = await res.json();
                alert(data.message || 'Failed to delete office');
                return;
            }
            setOffices(offices.filter(o => o.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="p-4">Loading Offices...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Governance Offices</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage positions of authority and their unit links</p>
                </div>
            </div>
            {showForm && (
                <div className="bg-white border rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">{editingOfficeId ? 'Edit Office' : 'New Office'}</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Office Role / Type</label>
                                <select
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2"
                                >
                                    <option value="REGIONAL_HEAD">Regional Head</option>
                                    <option value="DEPT_HEAD">Department Head</option>
                                    <option value="DESK_OFFICER">Desk Officer</option>
                                    <option value="BRANCH_HEAD">Branch Head</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Designation Context (Optional)</label>
                                <select
                                    value={formData.designationId}
                                    onChange={e => setFormData({ ...formData, designationId: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2"
                                >
                                    <option value="">Select Designation</option>
                                    {designations.map(d => (
                                        <option key={d.id} value={d.id}>{d.title}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Office Code (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    className="w-full border rounded-lg px-3 py-2 uppercase"
                                    placeholder="Leave empty to auto-generate"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Office Name (Auto-suggested)</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2"
                                    placeholder="e.g. Branch Manager - Adyar"
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Tier</label>
                                <select
                                    value={formData.tier}
                                    onChange={e => setFormData({ ...formData, tier: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2"
                                >
                                    <option value="TIER_0_SYSTEM">System Administrator (Tier 0)</option>
                                    <option value="TIER_3_EXECUTION">Regional Office / Branch (Tier 3)</option>
                                </select>
                            </div>
                            <div>
                                <div className="border border-gray-100 rounded-lg bg-gray-50 p-2 h-32 overflow-y-auto space-y-1 mt-1">
                                    {units.map(u => (
                                        <label key={u.id} className="flex items-center space-x-2 p-1 hover:bg-white rounded cursor-pointer transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={formData.deptIds.includes(u.id)}
                                                onChange={e => {
                                                    const newIds = e.target.checked
                                                        ? [...formData.deptIds, u.id]
                                                        : formData.deptIds.filter((id: string) => id !== u.id);
                                                    setFormData({ ...formData, deptIds: newIds });
                                                }}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                                            />
                                            <span className="text-xs text-gray-700">{u.name} <span className="text-[9px] text-gray-400 font-mono">({u.code})</span></span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.vetoPower}
                                        onChange={e => setFormData({ ...formData, vetoPower: e.target.checked })}
                                        className="mr-2"
                                    />
                                    <label className="text-sm font-medium">Has Veto Power</label>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Authority Line</label>
                                <div className="flex bg-gray-100 p-1 rounded-lg w-fit">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, authorityLine: '1st' })}
                                        className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${formData.authorityLine === '1st' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                                    >
                                        1st Line (Primary)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, authorityLine: '2nd' })}
                                        className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${formData.authorityLine === '2nd' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                                    >
                                        2nd Line (Support)
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="flex space-x-3">
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Save</button>
                            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
                        </div>
                    </form>
                </div>
            )
            }

            <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Office Code</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name & Authority</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tier</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Linked Unit</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {offices
                            .filter(o => o.tier === 'TIER_3_EXECUTION' || o.tier === 'TIER_0_SYSTEM')
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map(office => (
                                <tr key={office.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{office.code}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{office.name}</div>
                                        {/* Only show line if NOT System Admin AND (2nd line OR not a generic functional head) */}
                                        {office.tier !== 'TIER_0_SYSTEM' && (office.authorityLine === '2nd' || !office.name.startsWith('Head ')) && (
                                            <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                                                LINE: {office.authorityLine}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 py-1 rounded text-xs ${office.tier === 'TIER_0_SYSTEM' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                            {office.tier === 'TIER_0_SYSTEM' ? 'System' : 'RO / Branch'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {office.departments && office.departments.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {office.departments.map(d => (
                                                    <div key={d.id} className="flex items-center bg-gray-100 px-1.5 py-0.5 rounded text-[10px] text-gray-600 border border-gray-200">
                                                        <Building2 className="w-2.5 h-2.5 mr-1 text-gray-400" />
                                                        {d.name}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : '–'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                        <div className="flex justify-end space-x-3">
                                            <button onClick={() => {
                                                setFormData({
                                                    code: office.code,
                                                    name: office.name,
                                                    tier: office.tier,
                                                    deptIds: office.departments.map(d => d.id),
                                                    designationId: (office as any).designationId || '',
                                                    type: (office as any).type || 'REGULAR',
                                                    vetoPower: office.vetoPower,
                                                    authorityLine: office.authorityLine || '1st'
                                                });
                                                setEditingOfficeId(office.id);
                                                setShowForm(true);
                                            }} className="text-blue-600 hover:text-blue-900"><Edit2 className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(office.id, office.name)} className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div >
    );
}
