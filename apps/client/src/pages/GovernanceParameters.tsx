
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';

interface GovernanceParameter {
    id: string;
    code: string;
    name: string;
    category: string;
    segment?: string;
    unitLevel: string;
}

export function GovernanceParameters() {
    const [parameters, setParameters] = useState<GovernanceParameter[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        code: '',
        name: '',
        category: 'CLASS_A',
        segment: '',
        unitLevel: 'ALL'
    });

    useEffect(() => {
        fetchParameters();
    }, []);

    const fetchParameters = async () => {
        try {
            const res = await fetch('/api/governance/parameters');
            const data = await res.json();
            if (Array.isArray(data)) {
                setParameters(data);
            }
        } catch (error) {
            console.error('Failed to fetch parameters:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (param: GovernanceParameter) => {
        setFormData({
            code: param.code,
            name: param.name,
            category: param.category,
            segment: param.segment || '',
            unitLevel: param.unitLevel
        });
        setEditingId(param.id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this parameter?')) return;
        try {
            await fetch(`/api/governance/parameters/${id}`, { method: 'DELETE' });
            fetchParameters();
        } catch (error) {
            console.error('Failed to delete parameter:', error);
        }
    };

    const resetForm = () => {
        setFormData({ code: '', name: '', category: 'CLASS_A', segment: '', unitLevel: 'ALL' });
        setEditingId(null);
        setShowForm(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await fetch(`/api/governance/parameters/${editingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });
            } else {
                await fetch('/api/governance/parameters', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });
            }
            resetForm();
            fetchParameters();
        } catch (error) {
            console.error('Failed to save parameter:', error);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    const categories = ['CLASS_A', 'CLASS_B', 'CLASS_C', 'CLASS_D'];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Governance Parameters</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage MIS Parameters, KPIs, and Control Metrics</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="flex items-center px-4 py-2 bg-[var(--color-brand-primary)] text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Parameter
                </button>
            </div>

            {showForm && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit Parameter' : 'New Parameter'}</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Code (Unique)</label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    disabled={!!editingId}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {categories.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Level</label>
                                <select
                                    value={formData.unitLevel}
                                    onChange={(e) => setFormData({ ...formData, unitLevel: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="ALL">All Levels</option>
                                    <option value="CO">Central Office</option>
                                    <option value="RO">Regional Office</option>
                                    <option value="BRANCH">Branch</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Segment (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.segment}
                                    onChange={(e) => setFormData({ ...formData, segment: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g. Agriculture"
                                />
                            </div>
                        </div>

                        <div className="flex space-x-3 pt-2">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                {editingId ? 'Update' : 'Create'}
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

            <div className="grid grid-cols-1 gap-6">
                {categories.map(category => {
                    const params = parameters.filter(p => p.category === category);
                    if (params.length === 0) return null;

                    return (
                        <div key={category} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">{category.replace('_', ' ')}</h3>
                            </div>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-white">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Segment</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {params.map((param) => (
                                        <tr key={param.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{param.code}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{param.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs">
                                                <span className="px-2 py-1 bg-gray-100 rounded text-gray-600 font-medium">{param.unitLevel}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{param.segment || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                <button
                                                    onClick={() => handleEdit(param)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(param.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    );
                })}

            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Context Masters</h2>
                        <p className="text-sm text-gray-500">Define new Decision Types and Functional Scopes</p>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <form onSubmit={async (e) => {
                        e.preventDefault();
                        const form = e.target as HTMLFormElement;
                        const data = new FormData(form);
                        try {
                            const res = await fetch('/api/governance/contexts', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    decisionTypeName: data.get('decisionTypeName'),
                                    functionalScopeName: data.get('functionalScopeName')
                                })
                            });
                            if (res.ok) {
                                alert('Context created successfully! It will now appear in the creation wizard.');
                                form.reset();
                            }
                        } catch (err) {
                            console.error(err);
                            alert('Failed to create context');
                        }
                    }} className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">New Decision Type</label>
                            <input name="decisionTypeName" placeholder="e.g. Ratification" className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">New Functional Scope</label>
                            <input name="functionalScopeName" placeholder="e.g. IT Assets Purchase" className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
                        </div>
                        <button type="submit" className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors flex items-center">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Context
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
