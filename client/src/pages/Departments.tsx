import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Plus, Edit2, Trash2, LayoutList, Network } from 'lucide-react';
import { OrgChart } from '../components/visualizations/OrgChart';

interface Department {
    id: string;
    code: string;
    name: string;
    type: string;
    subType?: string;
    status: string;
    parentId?: string;
    parent?: { name: string };
}

export function Departments() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const [showForm, setShowForm] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'chart'>('list');

    // Meta categories for tabs
    const [activeTab, setActiveTab] = useState<'general' | 'authority' | 'functional' | 'control' | 'audit'>('general');

    // Form State
    const [formData, setFormData] = useState<any>({
        code: '',
        name: '',
        type: 'FUNCTIONAL',
        subType: 'DEPT',
        parentId: '',
        status: 'ACTIVE',
        statutoryBasis: '',
        establishmentOrderRef: '',
        dateOfEstablishment: '',
        geographicalScope: '',
        peerGroupCode: '',
        mandateStatement: '',
        delegationRef: '',
        powers: [] as string[],
        policiesOwned: [] as string[],
        processesOwned: [] as string[],
        metricsAccountableFor: [] as string[],
        misFrequency: '',
        misSla: '',
        riskCategory: '',
        vigilanceSensitivity: 'NORMAL',
        inspectionCycle: '',
        decisionLogRetentionYears: 10,
        auditTrailEnabled: true,
        inspectionReplayCapable: false
    });

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const res = await fetch('/api/admin/departments');
            const data = await res.json();
            if (Array.isArray(data)) {
                setDepartments(data);
            } else {
                console.error('API returned non-array:', data);
                setDepartments([]);
            }
        } catch (error) {
            console.error('Failed to fetch departments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (dept: any) => {
        // Sanitize null values to empty strings for controlled inputs
        const sanitized = { ...dept };
        Object.keys(sanitized).forEach(key => {
            if (sanitized[key] === null) sanitized[key] = '';
        });

        setFormData({
            ...sanitized,
            parentId: dept.parentId || '',
            subType: dept.subType || '',
            dateOfEstablishment: dept.dateOfEstablishment ? new Date(dept.dateOfEstablishment).toISOString().split('T')[0] : '',
        });
        setEditingDeptId(dept.id);
        setShowForm(true);
        setActiveTab('general');
    };

    const resetForm = () => {
        setFormData({
            code: '', name: '', type: 'FUNCTIONAL', subType: 'DEPT', parentId: '', status: 'ACTIVE',
            statutoryBasis: '', establishmentOrderRef: '', dateOfEstablishment: '', geographicalScope: '',
            peerGroupCode: '', mandateStatement: '', delegationRef: '', powers: [],
            policiesOwned: [], processesOwned: [], metricsAccountableFor: [],
            misFrequency: '', misSla: '', riskCategory: '', vigilanceSensitivity: 'NORMAL',
            inspectionCycle: '', decisionLogRetentionYears: 10, auditTrailEnabled: true,
            inspectionReplayCapable: false
        });
        setEditingDeptId(null);
        setShowForm(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = { ...formData };
        if (!payload.parentId) delete (payload as any).parentId; // Don't send empty string

        try {
            const url = editingDeptId ? `/api/admin/departments/${editingDeptId}` : '/api/admin/departments';
            const method = editingDeptId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const error = await res.json();
                alert(`Error: ${error.message || 'Operation failed'}`);
                return;
            }

            resetForm();
            fetchDepartments();
        } catch (error) {
            console.error('Failed to save department:', error);
            alert('An unexpected error occurred.');
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;

        try {
            const res = await fetch(`/api/admin/departments/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const error = await res.json();
                alert(error.message || 'Failed to delete unit');
                return;
            }
            fetchDepartments();
        } catch (error) {
            console.error('Failed to delete department:', error);
            alert('An unexpected error occurred while deleting.');
        }
    };

    if (loading) return <div className="p-4">Loading...</div>;

    // Filter potential parents (exclude self and children ideally, but just self for now)
    const potentialParents = departments.filter(d => d.type === 'ADMINISTRATIVE' && d.id !== editingDeptId);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Organization Structure</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage Organization Units</p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setShowForm(true);
                    }}
                    className="flex items-center px-4 py-2 bg-[var(--color-brand-primary)] text-white rounded-lg hover:bg-[var(--color-brand-secondary)] transition-colors"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Unit
                </button>
            </div>

            <div className="flex justify-between items-center mb-4">
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all ${viewMode === 'list'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        <LayoutList className="w-4 h-4 mr-2" />
                        List View
                    </button>
                    <button
                        onClick={() => setViewMode('chart')}
                        className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all ${viewMode === 'chart'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        <Network className="w-4 h-4 mr-2" />
                        Chart View
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900">{editingDeptId ? 'Expand Institutional Profile' : 'Register New Institutional Object'}</h3>
                        <div className="flex border-b border-gray-200">
                            {(['general', 'authority', 'functional', 'control', 'audit'] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 text-sm font-medium border-b-2 capitalize ${activeTab === tab
                                        ? 'border-[var(--color-brand-primary)] text-[var(--color-brand-primary)]'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {activeTab === 'general' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 font-mono uppercase text-[10px]">Unit Code (Immutable)</label>
                                        <input
                                            type="text"
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 bg-gray-50 font-mono"
                                            required
                                            disabled={!!editingDeptId}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 font-mono uppercase text-[10px]">Official Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 font-mono uppercase text-[10px]">Tier</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded"
                                        >
                                            <option value="FUNCTIONAL">Functional Dept</option>
                                            <option value="ADMINISTRATIVE">Administrative Unit</option>
                                            <option value="EXECUTIVE">Executive Unit</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 font-mono uppercase text-[10px]">Governance subType</label>
                                        <select
                                            value={formData.subType}
                                            onChange={(e) => setFormData({ ...formData, subType: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded"
                                        >
                                            <option value="CO">Central Office</option>
                                            <option value="ZO">Zonal Office</option>
                                            <option value="RO">Regional Office</option>
                                            <option value="BRANCH">Branch</option>
                                            <option value="DEPT">Department</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 font-mono uppercase text-[10px]">Statutory Basis</label>
                                        <input
                                            type="text"
                                            value={formData.statutoryBasis}
                                            onChange={(e) => setFormData({ ...formData, statutoryBasis: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded"
                                            placeholder="e.g. Banking Act 1949"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 font-mono uppercase text-[10px]">Parent Institutional Object</label>
                                        <select
                                            value={formData.parentId}
                                            onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded"
                                        >
                                            <option value="">(Root)</option>
                                            {potentialParents.map(p => (
                                                <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 font-mono uppercase text-[10px]">Establishment Date</label>
                                        <input
                                            type="date"
                                            value={formData.dateOfEstablishment}
                                            onChange={(e) => setFormData({ ...formData, dateOfEstablishment: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'authority' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 font-mono uppercase text-[10px]">Mandate Statement (Institutional Charter)</label>
                                    <textarea
                                        value={formData.mandateStatement}
                                        onChange={(e) => setFormData({ ...formData, mandateStatement: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded h-24"
                                        placeholder="Define the core reason for existence and accountability..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 font-mono uppercase text-[10px]">Decision Powers (Comma separated)</label>
                                    <input
                                        type="text"
                                        value={Array.isArray(formData.powers) ? formData.powers.join(', ') : ''}
                                        onChange={(e) => setFormData({ ...formData, powers: e.target.value.split(',').map(s => s.trim()) })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded"
                                        placeholder="SANCTION, APPROVE, VETO, RECOMMEND..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 font-mono uppercase text-[10px]">Delegation Reference Circular</label>
                                    <input
                                        type="text"
                                        value={formData.delegationRef}
                                        onChange={(e) => setFormData({ ...formData, delegationRef: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded"
                                        placeholder="e.g. CO/CREDIT/2024/45"
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'functional' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 font-mono uppercase text-[10px]">Policies Owned (Comma separated)</label>
                                    <input
                                        type="text"
                                        value={Array.isArray(formData.policiesOwned) ? formData.policiesOwned.join(', ') : ''}
                                        onChange={(e) => setFormData({ ...formData, policiesOwned: e.target.value.split(',').map(s => s.trim()) })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 font-mono uppercase text-[10px]">Processes Owned</label>
                                    <input
                                        type="text"
                                        value={Array.isArray(formData.processesOwned) ? formData.processesOwned.join(', ') : ''}
                                        onChange={(e) => setFormData({ ...formData, processesOwned: e.target.value.split(',').map(s => s.trim()) })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 font-mono uppercase text-[10px]">Geographical Scope</label>
                                        <select
                                            value={formData.geographicalScope}
                                            onChange={(e) => setFormData({ ...formData, geographicalScope: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded"
                                        >
                                            <option value="PAN_INDIA">Pan India</option>
                                            <option value="ZONAL">Zonal</option>
                                            <option value="REGIONAL">Regional</option>
                                            <option value="BRANCH_AREA">Branch Area</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 font-mono uppercase text-[10px]">Peer Group Code</label>
                                        <input
                                            type="text"
                                            value={formData.peerGroupCode}
                                            onChange={(e) => setFormData({ ...formData, peerGroupCode: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'control' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 font-mono uppercase text-[10px]">Risk Category</label>
                                        <select
                                            value={formData.riskCategory}
                                            onChange={(e) => setFormData({ ...formData, riskCategory: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded"
                                        >
                                            <option value="LOW">Low</option>
                                            <option value="MEDIUM">Medium</option>
                                            <option value="HIGH">High</option>
                                            <option value="SYSTEMIC">Systemic</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 font-mono uppercase text-[10px]">Vigilance Sensitivity</label>
                                        <select
                                            value={formData.vigilanceSensitivity}
                                            onChange={(e) => setFormData({ ...formData, vigilanceSensitivity: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded"
                                        >
                                            <option value="NORMAL">Normal</option>
                                            <option value="SENSITIVE">Sensitive</option>
                                            <option value="CRITICAL">Critical</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 font-mono uppercase text-[10px]">Inspection Cycle</label>
                                    <input
                                        type="text"
                                        value={formData.inspectionCycle}
                                        onChange={(e) => setFormData({ ...formData, inspectionCycle: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded"
                                        placeholder="e.g. Annual, Quarterly, Risk Based"
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'audit' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 font-mono uppercase text-[10px]">MIS Frequency</label>
                                        <input
                                            type="text"
                                            value={formData.misFrequency}
                                            onChange={(e) => setFormData({ ...formData, misFrequency: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 font-mono uppercase text-[10px]">Submission SLA</label>
                                        <input
                                            type="text"
                                            value={formData.misSla}
                                            onChange={(e) => setFormData({ ...formData, misSla: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center space-x-6 py-2">
                                    <label className="flex items-center text-sm font-medium text-gray-700 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.auditTrailEnabled}
                                            onChange={(e) => setFormData({ ...formData, auditTrailEnabled: e.target.checked })}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
                                        />
                                        Audit Trail Enabled
                                    </label>
                                    <label className="flex items-center text-sm font-medium text-gray-700 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.inspectionReplayCapable}
                                            onChange={(e) => setFormData({ ...formData, inspectionReplayCapable: e.target.checked })}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
                                        />
                                        Inspection Replay Capable
                                    </label>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-8 py-2 bg-[var(--color-brand-primary)] text-white rounded-lg hover:bg-[var(--color-brand-secondary)] font-bold shadow-md transform active:scale-95 transition-all"
                            >
                                {editingDeptId ? 'Commit Institutional Changes' : 'Initialize Institutional Object'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {viewMode === 'chart' ? (
                <OrgChart data={departments} />
            ) : (
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Code</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent Unit</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {departments.map((dept) => (
                                <tr key={dept.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                                            <span className="text-sm font-medium text-gray-900">{dept.code}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {dept.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-medium rounded 
                                            ${dept.type === 'ADMINISTRATIVE' ? 'bg-purple-100 text-purple-800' :
                                                dept.type === 'EXECUTIVE' ? 'bg-green-100 text-green-800' :
                                                    'bg-blue-100 text-blue-800'}`}>
                                            {dept.subType || dept.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {dept.parent ? (
                                            <span className="flex items-center">
                                                <span className="w-2 h-2 rounded-full bg-gray-300 mr-2"></span>
                                                {dept.parent.name}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 italic">Root</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-3">
                                            <Link
                                                to={`/departments/${dept.id}`}
                                                className="text-indigo-600 hover:text-indigo-900 flex items-center"
                                            >
                                                <LayoutList className="w-4 h-4 mr-1" /> Profile
                                            </Link>
                                            <button
                                                onClick={() => handleEdit(dept)}
                                                className="text-[var(--color-brand-primary)] hover:text-[var(--color-brand-secondary)] flex items-center"
                                            >
                                                <Edit2 className="w-4 h-4 mr-1" /> Edit
                                            </button>
                                            {dept.code !== 'CO' && dept.code !== 'ADMIN' && (
                                                <button
                                                    onClick={() => handleDelete(dept.id, dept.name)}
                                                    className="text-red-600 hover:text-red-900 flex items-center"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
