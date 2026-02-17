import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Plus,
    Edit2,
    Save,
    X,
    AlertCircle,
    CheckCircle2,
    Building2,
    Globe
} from 'lucide-react';

const API_BASE = '/api';

const Regions = () => {
    const [regions, setRegions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingRegionId, setEditingRegionId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        code: '',
        name: '',
        nameHindi: '',
        nameTamil: '',
        status: 'ACTIVE'
    });

    useEffect(() => {
        fetchRegions();
    }, []);

    const fetchRegions = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE}/admin/regions`);
            setRegions(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch regions');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingRegionId) {
                await axios.put(`${API_BASE}/admin/regions/${editingRegionId}`, formData);
                setSuccess('Region updated successfully and synchronized with Organizational Root.');
            } else {
                await axios.post(`${API_BASE}/admin/regions`, formData);
                setSuccess('Region registered successfully.');
            }
            setShowForm(false);
            setEditingRegionId(null);
            setFormData({ code: '', name: '', nameHindi: '', nameTamil: '', status: 'ACTIVE' });
            fetchRegions();
            setTimeout(() => setSuccess(null), 5000);
        } catch (err) {
            setError('Failed to save region');
            console.error(err);
        }
    };

    const handleEdit = (region: any) => {
        setFormData({
            code: region.code,
            name: region.name,
            nameHindi: region.nameHindi || '',
            nameTamil: region.nameTamil || '',
            status: region.status
        });
        setEditingRegionId(region.id);
        setShowForm(true);
    };


    if (loading) return <div className="p-8 text-center text-gray-500">Loading Regional Masters...</div>;

    return (
        <div className="max-w-6xl mx-auto p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <Globe className="w-8 h-8 mr-3 text-iob-blue" />
                        Region Master
                    </h1>
                    <p className="text-gray-500 mt-1">Configure primary regional identity with trilingual support (English, Hindi, Tamil). Organization structure will derive identity from these settings.</p>
                </div>
                {showForm && (
                    <button
                        onClick={() => {
                            setShowForm(false);
                            setEditingRegionId(null);
                        }}
                        className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors shadow-md"
                    >
                        <X className="w-4 h-4 mr-2" />
                        Cancel Edit
                    </button>
                )}
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center shadow-sm">
                    <AlertCircle className="w-5 h-5 mr-3" />
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 flex items-center shadow-sm">
                    <CheckCircle2 className="w-5 h-5 mr-3" />
                    {success}
                </div>
            )}

            {showForm && (
                <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-xl mb-10 animate-in fade-in slide-in-from-top-4 duration-300">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        {editingRegionId ? <Edit2 className="w-5 h-5 mr-2 text-iob-blue" /> : <Plus className="w-5 h-5 mr-2 text-iob-blue" />}
                        {editingRegionId ? 'Refine Regional Configuration' : 'Register Primary Region'}
                    </h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-8">
                        <div>
                            <label className="block text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1">Region Code (Master ID)</label>
                            <input
                                type="text"
                                required
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-iob-blue focus:border-transparent transition-all outline-none"
                                placeholder="e.g. RO-CHENNAI"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1">Region Name (English)</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-iob-blue focus:border-transparent transition-all outline-none"
                                placeholder="e.g. Chennai Regional Office"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1">Region Name (Hindi)</label>
                            <input
                                type="text"
                                value={formData.nameHindi}
                                onChange={(e) => setFormData({ ...formData, nameHindi: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-iob-blue focus:border-transparent transition-all outline-none font-hindi"
                                placeholder="जैसे: चेन्नई क्षेत्रीय कार्यालय"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1">Region Name (Tamil)</label>
                            <input
                                type="text"
                                value={formData.nameTamil}
                                onChange={(e) => setFormData({ ...formData, nameTamil: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-iob-blue focus:border-transparent transition-all outline-none font-tamil"
                                placeholder="எ.கா: சென்னை மண்டல அலுவலகம்"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-iob-blue focus:border-transparent outline-none shadow-sm"
                            >
                                <option value="ACTIVE">ACTIVE (Active Master)</option>
                                <option value="INACTIVE">INACTIVE</option>
                            </select>
                        </div>
                        <div className="col-span-2 pt-4 flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-6 py-2 text-gray-500 hover:text-gray-700 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex items-center px-8 py-2 bg-iob-blue text-white rounded-lg hover:bg-blue-700 transition-all shadow-lg font-bold"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {editingRegionId ? 'Update Master' : 'Finalize Registration'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {regions
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((region) => (
                        <div key={region.id} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleEdit(region)}
                                    className="p-2 text-iob-blue hover:bg-blue-50 rounded-full transition-colors"
                                    title="Edit Region Configuration"
                                >
                                    <Edit2 className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="p-3 bg-blue-50 text-iob-blue rounded-xl">
                                    <Building2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-iob-blue transition-colors">
                                        {region.name}
                                    </h3>
                                    <div className="space-y-1 mt-1">
                                        {region.nameHindi && <p className="text-sm text-gray-600 font-hindi">{region.nameHindi}</p>}
                                        {region.nameTamil && <p className="text-sm text-gray-600 font-tamil">{region.nameTamil}</p>}
                                    </div>
                                    <div className="flex items-center mt-2 space-x-3">
                                        <span className="text-[10px] font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-bold uppercase tracking-tight">
                                            ID: {region.code}
                                        </span>
                                        <span className={`text - [10px] font - bold px - 2 py - 0.5 rounded uppercase tracking - widest ${region.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            } `}>
                                            {region.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-50 grid grid-cols-2 gap-4">
                                <div className="text-center p-2 bg-gray-50 rounded-lg">
                                    <div className="text-[10px] font-mono text-gray-400 font-bold uppercase tracking-tighter">Derived Entities</div>
                                    <div className="text-lg font-bold text-gray-700">Root Active</div>
                                </div>
                                <div className="flex items-center justify-center text-[10px] font-bold text-iob-blue uppercase tracking-widest">
                                    Master Configured
                                </div>
                            </div>
                        </div>
                    ))}
            </div>

            {regions.length === 0 && (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <Globe className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-bold text-gray-600">No Regional Masters Found</h3>
                    <p className="text-gray-400 mt-2">Initialize the organizational hierarchy through the seeding protocol.</p>
                </div>
            )}
        </div>
    );
};

export default Regions;
