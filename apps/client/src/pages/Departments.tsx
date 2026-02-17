import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Plus, Edit2, Trash2, LayoutList, Network } from 'lucide-react';
import React, { Suspense } from 'react';

const OrgChart = React.lazy(() => import('../components/visualizations/OrgChart').then(m => ({ default: m.OrgChart })));

interface Department {
    id: string;
    code: string;
    name: string;
    nameHindi?: string;
    nameTamil?: string;
    type: string;
    subType?: string;
    status: string;
    populationGroup?: string;
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
    const [unitFilter, setUnitFilter] = useState<'functional' | 'branches'>('functional');

    // Form State
    const [formData, setFormData] = useState<any>({
        code: '',
        name: '',
        nameHindi: '',
        nameTamil: '',
        type: 'FUNCTIONAL',
        subType: 'DEPT',
        parentId: '',
        status: 'ACTIVE',
        populationGroup: '',
        dateOfEstablishment: '',
        licenseDetails: { fileName: '', uploadDate: '', status: 'NOT_UPLOADED' },
        headsHistory: [] as { name: string, designation: string, fromDate: string, toDate: string }[]
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
    };

    const resetForm = () => {
        const ro = departments.find(d => d.subType === 'RO');
        setFormData({
            code: '', name: '', nameHindi: '', nameTamil: '', type: 'FUNCTIONAL', subType: 'DEPT',
            parentId: ro ? ro.id : '',
            status: 'ACTIVE',
            populationGroup: '',
            dateOfEstablishment: '',
            licenseDetails: { fileName: '', uploadDate: '', status: 'NOT_UPLOADED' },
            headsHistory: [] as any[]
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

    if (loading) return <div className="p-4">Loading Institutional Objects...</div>;

    // Filter out potential legacy residues from previous deployments
    const visibleDepts = departments
        .filter(d => d.code !== 'CO' && d.subType !== 'ZO')
        .sort((a, b) => a.code.localeCompare(b.code));

    // Separate functional vs branches
    const functionalDepts = visibleDepts.filter(d => d.subType === 'DEPT' || d.subType === 'RO');
    const branchDepts = visibleDepts.filter(d => d.subType === 'BRANCH');

    const filteredList = unitFilter === 'functional' ? functionalDepts : branchDepts;


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
                        onClick={() => setUnitFilter('functional')}
                        className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all ${unitFilter === 'functional'
                            ? 'bg-white text-[var(--color-brand-primary)] shadow-sm'
                            : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        RO Functional
                    </button>
                    <button
                        onClick={() => setUnitFilter('branches')}
                        className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all ${unitFilter === 'branches'
                            ? 'bg-white text-[var(--color-brand-primary)] shadow-sm'
                            : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        Branch Network
                    </button>
                </div>

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
                        <h3 className="text-xl font-bold text-gray-900">{editingDeptId ? 'Refine Regional Object' : 'Register New Regional Object'}</h3>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1 font-mono uppercase text-[10px]">Unit Code</label>
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 font-mono"
                                        required
                                    />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1 font-mono uppercase text-[10px]">Official Name (English)</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1 font-mono uppercase text-[10px]">Official Name (Hindi)</label>
                                    <input
                                        type="text"
                                        value={formData.nameHindi}
                                        onChange={(e) => setFormData({ ...formData, nameHindi: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 font-hindi"
                                        placeholder="जैसे: क्षेत्रीय कार्यालय"
                                    />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1 font-mono uppercase text-[10px]">Official Name (Tamil)</label>
                                    <input
                                        type="text"
                                        value={formData.nameTamil}
                                        onChange={(e) => setFormData({ ...formData, nameTamil: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 font-tamil"
                                        placeholder="எ.கா: மண்டல அலுவலகம்"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1 font-mono uppercase text-[10px]">Unit Categorization</label>
                                    <select
                                        value={`${formData.type}:${formData.subType}`}
                                        onChange={(e) => {
                                            const [type, subType] = e.target.value.split(':');
                                            setFormData({ ...formData, type, subType });
                                        }}
                                        className="w-full px-3 py-2 border border-gray-200 rounded"
                                    >
                                        <option value="FUNCTIONAL:DEPT">Regional Department</option>
                                        <option value="EXECUTIVE:BRANCH">Branch Office</option>
                                    </select>
                                </div>
                                {formData.subType === 'BRANCH' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 font-mono uppercase text-[10px]">Population Category</label>
                                        <select
                                            value={formData.populationGroup}
                                            onChange={(e) => setFormData({ ...formData, populationGroup: e.target.value })}
                                            className="w-full px-3 py-2 border border-blue-200 bg-blue-50/30 rounded focus:ring-1 focus:ring-blue-500 shadow-sm transition-all"
                                            required={formData.subType === 'BRANCH'}
                                        >
                                            <option value="">-- Select Category --</option>
                                            <option value="METRO">Metro</option>
                                            <option value="URBAN">Urban</option>
                                            <option value="SEMI_URBAN">Semi Urban</option>
                                            <option value="RURAL">Rural</option>
                                        </select>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 font-mono uppercase text-[10px]">Establishment Date</label>
                                    <input
                                        type="date"
                                        value={formData.dateOfEstablishment}
                                        onChange={(e) => setFormData({ ...formData, dateOfEstablishment: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 font-mono uppercase text-[10px]">Parent Institutional Object</label>
                                    <div className="px-3 py-2 border border-gray-100 bg-gray-50/50 rounded text-sm text-gray-600 flex items-center">
                                        <span className="w-2 h-2 rounded-full bg-blue-400 mr-2"></span>
                                        {departments.find(d => d.subType === 'RO')?.name || 'Regional Office'} (Locked)
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-bold text-blue-900">License Details</h4>
                                        <p className="text-xs text-blue-700 mt-1">Upload banking license or establishment authority documents</p>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        {formData.licenseDetails?.status === 'UPLOADED' ? (
                                            <div className="flex items-center text-xs text-green-700 font-medium">
                                                <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                                                {formData.licenseDetails.fileName}
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, licenseDetails: { fileName: 'LICENSE_2024.pdf', uploadDate: new Date().toISOString(), status: 'UPLOADED' } })}
                                                className="px-3 py-1.5 bg-white border border-blue-200 text-blue-600 text-xs font-bold rounded hover:bg-blue-50 transition-colors shadow-sm"
                                            >
                                                Upload License
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">History of Heads</h4>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({
                                            ...formData,
                                            headsHistory: [...(formData.headsHistory || []), { name: '', designation: '', fromDate: '', toDate: '' }]
                                        })}
                                        className="text-[var(--color-brand-primary)] hover:text-[var(--color-brand-secondary)] text-xs font-bold flex items-center"
                                    >
                                        <Plus className="w-3 h-3 mr-1" /> Add Entry
                                    </button>
                                </div>

                                {formData.headsHistory?.length > 0 ? (
                                    <div className="space-y-3">
                                        {formData.headsHistory.map((head: any, index: number) => (
                                            <div key={index} className="grid grid-cols-4 gap-3 p-3 bg-gray-50/50 border border-gray-100 rounded-lg relative group">
                                                <div>
                                                    <label className="block text-[8px] font-bold text-gray-500 uppercase mb-1">Name</label>
                                                    <input
                                                        type="text"
                                                        value={head.name}
                                                        onChange={(e) => {
                                                            const newHistory = [...formData.headsHistory];
                                                            newHistory[index].name = e.target.value;
                                                            setFormData({ ...formData, headsHistory: newHistory });
                                                        }}
                                                        className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
                                                        placeholder="Full Name"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[8px] font-bold text-gray-500 uppercase mb-1">Designation</label>
                                                    <input
                                                        type="text"
                                                        value={head.designation}
                                                        onChange={(e) => {
                                                            const newHistory = [...formData.headsHistory];
                                                            newHistory[index].designation = e.target.value;
                                                            setFormData({ ...formData, headsHistory: newHistory });
                                                        }}
                                                        className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
                                                        placeholder="e.g. Chief Manager"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[8px] font-bold text-gray-500 uppercase mb-1">From Date</label>
                                                    <input
                                                        type="date"
                                                        value={head.fromDate}
                                                        onChange={(e) => {
                                                            const newHistory = [...formData.headsHistory];
                                                            newHistory[index].fromDate = e.target.value;
                                                            setFormData({ ...formData, headsHistory: newHistory });
                                                        }}
                                                        className="w-full px-2 py-1 text-xs border border-gray-200 rounded"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[8px] font-bold text-gray-500 uppercase mb-1">To Date</label>
                                                    <input
                                                        type="date"
                                                        value={head.toDate}
                                                        onChange={(e) => {
                                                            const newHistory = [...formData.headsHistory];
                                                            newHistory[index].toDate = e.target.value;
                                                            setFormData({ ...formData, headsHistory: newHistory });
                                                        }}
                                                        className="w-full px-2 py-1 text-xs border border-gray-200 rounded"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newHistory = formData.headsHistory.filter((_: any, i: number) => i !== index);
                                                        setFormData({ ...formData, headsHistory: newHistory });
                                                    }}
                                                    className="absolute -right-2 -top-2 bg-red-100 text-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-lg">
                                        <p className="text-xs text-gray-400 italic">No head tenure history recorded yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>

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
                <Suspense fallback={<div className="p-12 text-center text-gray-400 italic">Rendering Organizational Architecture...</div>}>
                    <OrgChart data={departments} filter={unitFilter} />
                </Suspense>
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
                            {filteredList.map((dept) => (
                                <tr key={dept.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                                            <span className="text-sm font-medium text-gray-900">{dept.code}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{dept.name}</div>
                                        <div className="flex gap-2 mt-1">
                                            {dept.nameHindi && <span className="text-[10px] font-medium text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded font-hindi">{dept.nameHindi}</span>}
                                            {dept.nameTamil && <span className="text-[10px] font-medium text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded font-tamil">{dept.nameTamil}</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-medium rounded 
                                            ${dept.type === 'ADMINISTRATIVE' ? 'bg-purple-100 text-purple-800' :
                                                dept.type === 'EXECUTIVE' ? 'bg-green-100 text-green-800' :
                                                    'bg-blue-100 text-blue-800'}`}>
                                            {dept.subType || dept.type}
                                        </span>
                                        {dept.subType === 'BRANCH' && dept.populationGroup && (
                                            <div className="mt-1">
                                                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                                                    {dept.populationGroup.replace('_', ' ')}
                                                </span>
                                            </div>
                                        )}
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
                                                className={`flex items-center ${dept.subType === 'RO' ? 'text-gray-400 cursor-not-allowed' : 'text-[var(--color-brand-primary)] hover:text-[var(--color-brand-secondary)]'}`}
                                                disabled={dept.subType === 'RO'}
                                                title={dept.subType === 'RO' ? 'Edit via Region Master' : 'Edit Unit'}
                                            >
                                                <Edit2 className="w-4 h-4 mr-1" /> Edit
                                            </button>
                                            {dept.subType !== 'RO' && (
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
