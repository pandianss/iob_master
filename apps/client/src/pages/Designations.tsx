import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Plus,
    Edit2,
    Save,
    X,
    AlertCircle,
    CheckCircle2,
    Shield,
    Activity,
    Trash2
} from 'lucide-react';

const API_BASE = '/api';

const Designations = () => {
    const [designations, setDesignations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        titleHindi: '',
        titleTamil: '',
        rank: 1
    });

    useEffect(() => {
        fetchDesignations();
    }, []);

    const fetchDesignations = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE}/admin/designations`);
            setDesignations(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch designations');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`${API_BASE}/admin/designations/${editingId}`, formData);
                setSuccess('Designation updated successfully.');
            } else {
                await axios.post(`${API_BASE}/admin/designations`, formData);
                setSuccess('Designation created successfully.');
            }
            setShowForm(false);
            setEditingId(null);
            setFormData({ title: '', titleHindi: '', titleTamil: '', rank: 1 });
            fetchDesignations();
            setTimeout(() => setSuccess(null), 5000);
        } catch (err) {
            setError('Failed to save designation');
            console.error(err);
        }
    };

    const handleEdit = (desg: any) => {
        setFormData({
            title: desg.title,
            titleHindi: desg.titleHindi || '',
            titleTamil: desg.titleTamil || '',
            rank: desg.rank
        });
        setEditingId(desg.id);
        setShowForm(true);
    };

    const handleDelete = async (id: string, title: string) => {
        if (!window.confirm(`Are you sure you want to delete designation "${title}"?`)) return;

        try {
            await axios.delete(`${API_BASE}/admin/designations/${id}`);
            setSuccess('Designation removed successfully.');
            fetchDesignations();
            setTimeout(() => setSuccess(null), 5000);
        } catch (err) {
            setError('Failed to delete designation. It might be in use.');
            console.error(err);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Designations...</div>;

    return (
        <div className="max-w-6xl mx-auto p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <Shield className="w-8 h-8 mr-3 text-iob-blue" />
                        Designation Master
                    </h1>
                    <p className="text-gray-500 mt-1">Manage institutional designations and hierarchy ranks.</p>
                </div>
                <button
                    onClick={() => {
                        setShowForm(!showForm);
                        setEditingId(null);
                        setFormData({ title: '', titleHindi: '', titleTamil: '', rank: 1 });
                    }}
                    className="flex items-center px-4 py-2 bg-iob-blue text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                >
                    {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                    {showForm ? 'Cancel' : 'New Designation'}
                </button>
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
                <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-xl mb-10">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        {editingId ? <Edit2 className="w-5 h-5 mr-2 text-iob-blue" /> : <Plus className="w-5 h-5 mr-2 text-iob-blue" />}
                        {editingId ? 'Edit Designation' : 'Create Designation'}
                    </h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-8">
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1">Designation Title</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-iob-blue focus:border-transparent transition-all outline-none"
                                placeholder="e.g. Chief Manager"
                            />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1">Work Class</label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={formData.rank}
                                onChange={(e) => setFormData({ ...formData, rank: parseInt(e.target.value) })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-iob-blue focus:border-transparent transition-all outline-none"
                            />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1">Title (Hindi)</label>
                            <input
                                type="text"
                                value={formData.titleHindi}
                                onChange={(e) => setFormData({ ...formData, titleHindi: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-iob-blue focus:border-transparent transition-all outline-none font-hindi"
                                placeholder="e.g. मुख्य प्रबंधक"
                            />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1">Title (Tamil)</label>
                            <input
                                type="text"
                                value={formData.titleTamil}
                                onChange={(e) => setFormData({ ...formData, titleTamil: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-iob-blue focus:border-transparent transition-all outline-none font-tamil"
                                placeholder="e.g. முதன்மை மேலாளர்"
                            />
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
                                {editingId ? 'Update Designation' : 'Save Designation'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">Work Class</th>
                            <th className="px-6 py-4 text-left text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">Title</th>
                            <th className="px-6 py-4 text-left text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">Regional Titles</th>
                            <th className="px-6 py-4 text-right text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {designations
                            .sort((a, b) => {
                                if (a.rank !== b.rank) return a.rank - b.rank;
                                return a.title.localeCompare(b.title);
                            })
                            .map((desg) => (
                                <tr key={desg.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <span className="text-sm font-bold text-iob-blue bg-blue-50 w-8 h-8 rounded-full flex items-center justify-center">
                                                {desg.rank}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-gray-900">{desg.title}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col space-y-1">
                                            {desg.titleHindi && <span className="text-xs text-gray-600 font-hindi bg-orange-50 px-2 py-0.5 rounded w-fit">{desg.titleHindi}</span>}
                                            {desg.titleTamil && <span className="text-xs text-gray-600 font-tamil bg-green-50 px-2 py-0.5 rounded w-fit">{desg.titleTamil}</span>}
                                            {!desg.titleHindi && !desg.titleTamil && <span className="text-xs text-gray-400 italic">No regional titles</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEdit(desg)}
                                                className="p-1.5 text-iob-blue hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(desg.id, desg.title)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
                {designations.length === 0 && (
                    <div className="text-center py-12">
                        <Activity className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">No designations defined yet.</p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="mt-4 text-iob-blue hover:underline font-bold text-sm"
                        >
                            + Create the first designation
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Designations;
