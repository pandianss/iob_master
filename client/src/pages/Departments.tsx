import { useEffect, useState } from 'react';
import { Building2, Plus, Edit2 } from 'lucide-react';

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

    // Form State
    const [formData, setFormData] = useState<{
        code: string;
        name: string;
        type: string;
        subType: string;
        parentId: string;
    }>({
        code: '',
        name: '',
        type: 'FUNCTIONAL',
        subType: 'DEPT',
        parentId: ''
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

    const handleEdit = (dept: Department) => {
        setFormData({
            code: dept.code,
            name: dept.name,
            type: dept.type,
            subType: dept.subType || '',
            parentId: dept.parentId || ''
        });
        setEditingDeptId(dept.id);
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData({ code: '', name: '', type: 'FUNCTIONAL', subType: 'DEPT', parentId: '' });
        setEditingDeptId(null);
        setShowForm(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = { ...formData };
        if (!payload.parentId) delete (payload as any).parentId; // Don't send empty string

        try {
            if (editingDeptId) {
                await fetch(`/api/admin/departments/${editingDeptId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
            } else {
                await fetch('/api/admin/departments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
            }
            resetForm();
            fetchDepartments();
        } catch (error) {
            console.error('Failed to save department:', error);
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
                    <p className="text-sm text-gray-500 mt-1">Manage Units, Branches, and Departments</p>
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

            {showForm && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">{editingDeptId ? 'Edit Unit' : 'New Unit'}</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]"
                                    required
                                    disabled={!!editingDeptId}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => {
                                        const newType = e.target.value;
                                        let newParentId = formData.parentId;

                                        // Auto-select Central Office if switching to Functional Dept
                                        if (newType === 'FUNCTIONAL') {
                                            const co = departments.find(d => d.subType === 'CO');
                                            if (co) newParentId = co.id;
                                        }

                                        setFormData({ ...formData, type: newType, parentId: newParentId });
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]"
                                >
                                    <option value="FUNCTIONAL">Functional Dept</option>
                                    <option value="ADMINISTRATIVE">Administrative Unit</option>
                                    <option value="EXECUTIVE">Executive Unit (Branch/CPC)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Type</label>
                                <select
                                    value={formData.subType}
                                    onChange={(e) => setFormData({ ...formData, subType: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]"
                                >
                                    <option value="CO">Central Office</option>
                                    <option value="ZO">Zonal Office</option>
                                    <option value="RO">Regional Office</option>
                                    <option value="BRANCH">Branch</option>
                                    <option value="DEPT">Department</option>
                                    <option value="LPC">LPC / CPC</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Parent Unit</label>
                            <select
                                value={formData.parentId}
                                onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]"
                            >
                                <option value="">(None - Root Unit)</option>
                                {potentialParents.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-[var(--color-brand-primary)] text-white rounded-lg hover:bg-[var(--color-brand-secondary)]"
                            >
                                {editingDeptId ? 'Update' : 'Create'}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

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
                                    <button
                                        onClick={() => handleEdit(dept)}
                                        className="text-[var(--color-brand-primary)] hover:text-[var(--color-brand-secondary)] flex items-center justify-end w-full"
                                    >
                                        <Edit2 className="w-4 h-4 mr-1" /> Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
