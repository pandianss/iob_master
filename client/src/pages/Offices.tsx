import { useEffect, useState } from 'react';
import { Shield, Plus, Edit2, Trash2, Building2 } from 'lucide-react';

interface Office {
    id: string;
    code: string;
    name: string;
    tier: string;
    departmentId?: string;
    department?: { name: string };
    vetoPower: boolean;
}

interface Unit {
    id: string;
    name: string;
    code: string;
}

export function Offices() {
    const [offices, setOffices] = useState<Office[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingOfficeId, setEditingOfficeId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        code: '',
        name: '',
        tier: 'TIER_3_EXECUTION',
        departmentId: '',
        vetoPower: false
    });

    useEffect(() => {
        Promise.all([
            fetch('/api/governance/offices').then(res => res.json()),
            fetch('/api/admin/departments').then(res => res.json())
        ]).then(([officesData, unitsData]) => {
            setOffices(officesData);
            setUnits(unitsData);
            setLoading(false);
        }).catch(err => console.error(err));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = { ...formData };
        if (!payload.departmentId) delete (payload as any).departmentId;

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
            setFormData({ code: '', name: '', tier: 'TIER_3_EXECUTION', departmentId: '', vetoPower: false });
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
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center px-4 py-2 bg-[var(--color-brand-primary)] text-white rounded-lg hover:bg-[var(--color-brand-secondary)]"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Office
                </button>
            </div>

            {showForm && (
                <div className="bg-white border rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">{editingOfficeId ? 'Edit Office' : 'New Office'}</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Code</label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2"
                                    placeholder="e.g. BM-ADYAR"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
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
                                    <option value="TIER_1_GOVERNANCE">Tier 1: Governance (Board)</option>
                                    <option value="TIER_2_EXECUTIVE">Tier 2: Executive (CO)</option>
                                    <option value="TIER_3_EXECUTION">Tier 3: Execution (ZO/RO/Branch)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Linked Unit</label>
                                <select
                                    value={formData.departmentId}
                                    onChange={e => setFormData({ ...formData, departmentId: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2"
                                >
                                    <option value="">None (Standalone)</option>
                                    {units.map(u => (
                                        <option key={u.id} value={u.id}>{u.name} ({u.code})</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                checked={formData.vetoPower}
                                onChange={e => setFormData({ ...formData, vetoPower: e.target.checked })}
                                className="mr-2"
                            />
                            <label className="text-sm font-medium">Has Veto Power</label>
                        </div>
                        <div className="flex space-x-3">
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Save</button>
                            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Office Code</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tier</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Linked Unit</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {offices.map(office => (
                            <tr key={office.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{office.code}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{office.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 py-1 rounded text-xs ${office.tier === 'TIER_1_GOVERNANCE' ? 'bg-indigo-100 text-indigo-800' :
                                            office.tier === 'TIER_2_EXECUTIVE' ? 'bg-blue-100 text-blue-800' :
                                                office.tier === 'TIER_0_SYSTEM' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                        }`}>
                                        {office.tier.replace('TIER_', '')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {office.department ? (
                                        <div className="flex items-center text-xs">
                                            <Building2 className="w-3 h-3 mr-1" />
                                            {office.department.name}
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
                                                departmentId: office.departmentId || '',
                                                vetoPower: office.vetoPower
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
        </div>
    );
}
