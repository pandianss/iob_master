import { useState, useEffect } from 'react';
import { User, Briefcase, Landmark, Shield, Plus, Search, UserPlus, Edit2, Trash2, X, Save, Phone, Calendar as CalendarIcon, History, RefreshCw } from 'lucide-react';

export function StaffRegistry() {
    const [users, setUsers] = useState<any[]>([]);
    const [offices, setOffices] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [designations, setDesignations] = useState<any[]>([]);
    const [regions, setRegions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        nameHindi: '',
        nameTamil: '',
        identityRef: '',
        email: '',
        mobile: '',
        dob: '',
        gender: 'UNDISCLOSED',
        postingLevel: 'ALL' as 'RO' | 'BRANCH' | 'ALL',
        officeIds: [] as string[],
        deptIds: [] as string[],
        designationId: '',
        regionId: '',
        assignmentDate: '',
        tenureStartDate: ''
    });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [selectedUserForHistory, setSelectedUserForHistory] = useState<any | null>(null);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showBackfillForm, setShowBackfillForm] = useState(false);
    const [backfillData, setBackfillData] = useState({
        type: 'POSTING', // POSTING or TENURE
        deptIds: [] as string[],
        designationId: '',
        regionId: '',
        officeId: '',
        startDate: '',
        endDate: '',
        status: 'PAST'
    });

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/users');
            setUsers(await res.json());
        } catch (err) {
            console.error('Fetch error', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchOffices = async () => {
        try {
            const res = await fetch('/api/governance/offices');
            setOffices(await res.json());
        } catch (err) {
            console.error('Fetch offices error', err);
        }
    };

    const fetchMasterData = async () => {
        try {
            const [deptsRes, desgsRes, regionsRes] = await Promise.all([
                fetch('/api/admin/departments'),
                fetch('/api/admin/designations'),
                fetch('/api/admin/regions')
            ]);
            setDepartments(await deptsRes.json());
            setDesignations(await desgsRes.json());
            setRegions(await regionsRes.json());
        } catch (err) {
            console.error('Master data fetch error', err);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchOffices();
        fetchMasterData();
    }, []);

    const filteredUsers = (Array.isArray(users) ? users : [])
        .filter(u =>
            u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.identityRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (u.nameHindi && u.nameHindi.includes(searchQuery)) ||
            (u.nameTamil && u.nameTamil.includes(searchQuery))
        )
        .sort((a, b) => a.name.localeCompare(b.name));

    // Filtered Units based on selected Region and Level
    const getFilteredUnits = () => {
        let list = departments;

        // 1. Filter by Level
        if (formData.postingLevel === 'RO') {
            list = list.filter(d => d.subType === 'RO' || d.subType === 'DEPT' || d.subType === 'CO');
        } else if (formData.postingLevel === 'BRANCH') {
            list = list.filter(d => d.subType === 'BRANCH');
        }

        // 2. Filter by Region
        if (formData.regionId) {
            const selectedRegion = regions.find(r => r.id === formData.regionId);
            if (selectedRegion) {
                const roDept = departments.find(d => d.code === selectedRegion.code && d.subType === 'RO');
                if (roDept) {
                    list = list.filter(d =>
                        d.parentId === roDept.id ||
                        d.geographicalScope === selectedRegion.name ||
                        d.code === selectedRegion.code
                    );
                }
            }
        }

        return list;
    };

    const filteredUnits = getFilteredUnits();

    const handleEdit = (user: any) => {
        setFormData({
            name: user.name,
            nameHindi: user.nameHindi || '',
            nameTamil: user.nameTamil || '',
            identityRef: user.identityRef,
            email: user.email,
            mobile: user.mobile || '',
            dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
            gender: user.gender || 'UNDISCLOSED',
            postingLevel: 'ALL',
            officeIds: user.tenures?.filter((t: any) => t.status === 'ACTIVE').map((t: any) => t.officeId) || [],
            deptIds: user.postings?.find((p: any) => p.status === 'ACTIVE')?.departments.map((d: any) => d.id) || [],
            designationId: user.postings?.find((p: any) => p.status === 'ACTIVE')?.designationId || '',
            regionId: user.postings?.find((p: any) => p.status === 'ACTIVE')?.regionId || '',
            assignmentDate: user.postings?.find((p: any) => p.status === 'ACTIVE')?.validFrom ? new Date(user.postings.find((p: any) => p.status === 'ACTIVE').validFrom).toISOString().split('T')[0] : '',
            tenureStartDate: user.tenures?.find((t: any) => t.status === 'ACTIVE')?.startDate ? new Date(user.tenures.find((t: any) => t.status === 'ACTIVE').startDate).toISOString().split('T')[0] : ''
        });
        setEditingUserId(user.id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to remove this staff identity? This will not affect historical audit logs but will remove them from the active registry.')) return;
        try {
            const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete user');
            setSuccess('Staff identity removed successfully.');
            fetchUsers();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError('Failed to delete staff record');
            console.error(err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingUserId ? `/api/admin/users/${editingUserId}` : '/api/admin/users';
            const method = editingUserId ? 'PUT' : 'POST';

            const formatDate = (dateStr: string) => {
                if (!dateStr) return null;
                const d = new Date(dateStr);
                return isNaN(d.getTime()) ? null : d.toISOString();
            };

            const payload = {
                ...formData,
                dob: formatDate(formData.dob),
                assignmentDate: formatDate(formData.assignmentDate),
                tenureStartDate: formatDate(formData.tenureStartDate)
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || 'Action failed. Ensure Employee ID and Email are unique.');
            }

            setSuccess(editingUserId ? 'Staff record updated.' : 'New staff onboarded.');
            setShowForm(false);
            setEditingUserId(null);
            setFormData({
                name: '', nameHindi: '', nameTamil: '', identityRef: '', email: '', mobile: '', dob: '', gender: 'UNDISCLOSED',
                postingLevel: 'ALL', officeIds: [], deptIds: [], designationId: '', regionId: '', assignmentDate: '', tenureStartDate: ''
            });
            fetchUsers();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
            console.error(err);
        }
    };

    const handleCleanup = async (userId: string) => {
        if (!window.confirm('This will deactivate all but the latest active HR postings and governance roles. Proceed?')) return;
        try {
            const res = await fetch(`/api/admin/users/${userId}/cleanup`, { method: 'POST' });
            if (!res.ok) throw new Error('Cleanup failed');
            setSuccess('Historical records reconciled.');
            fetchUsers();
            if (selectedUserForHistory && selectedUserForHistory.id === userId) {
                // Refresh modal data if it's open
                const freshUser = (await (await fetch('/api/admin/users')).json()).find((u: any) => u.id === userId);
                setSelectedUserForHistory(freshUser);
            }
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError('Cleanup utility failed.');
        }
    };

    const handleDeletePosting = async (id: string) => {
        if (!window.confirm('Delete this historical posting record? This can only be undone by re-adding the entry manually.')) return;
        try {
            const res = await fetch(`/api/admin/postings/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Delete failed');
            setSuccess('Historical posting removed.');
            fetchUsers();
            if (selectedUserForHistory) {
                const freshUser = (await (await fetch('/api/admin/users')).json()).find((u: any) => u.id === selectedUserForHistory.id);
                setSelectedUserForHistory(freshUser);
            }
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError('Delete failed.');
        }
    };

    const handleDeleteTenure = async (id: string) => {
        if (!window.confirm('Delete this historical tenure record?')) return;
        try {
            const res = await fetch(`/api/admin/tenures/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Delete failed');
            setSuccess('Historical tenure removed.');
            fetchUsers();
            if (selectedUserForHistory) {
                const freshUser = (await (await fetch('/api/admin/users')).json()).find((u: any) => u.id === selectedUserForHistory.id);
                setSelectedUserForHistory(freshUser);
            }
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError('Delete failed.');
        }
    };

    const handleBackfill = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = backfillData.type === 'POSTING' ? '/api/admin/postings' : '/api/admin/tenures';
            const payload = {
                userId: selectedUserForHistory.id,
                ...(backfillData.type === 'POSTING' ? {
                    deptIds: backfillData.deptIds,
                    designationId: backfillData.designationId,
                    regionId: backfillData.regionId,
                    validFrom: new Date(backfillData.startDate).toISOString(),
                    validTo: backfillData.endDate ? new Date(backfillData.endDate).toISOString() : null,
                    status: backfillData.status
                } : {
                    officeId: backfillData.officeId,
                    startDate: new Date(backfillData.startDate).toISOString(),
                    endDate: backfillData.endDate ? new Date(backfillData.endDate).toISOString() : null,
                    status: backfillData.status
                })
            };

            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Backfill failed');
            setSuccess('Historical record added.');
            setShowBackfillForm(false);
            setBackfillData({ ...backfillData, deptIds: [], designationId: '', regionId: '', officeId: '', startDate: '', endDate: '', status: 'PAST' });
            fetchUsers();
            if (selectedUserForHistory) {
                const freshUser = (await (await fetch('/api/admin/users')).json()).find((u: any) => u.id === selectedUserForHistory.id);
                setSelectedUserForHistory(freshUser);
            }
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError('Backfill failed.');
        }
    };

    if (loading && users.length === 0) return <div className="p-8 text-center animate-pulse text-iob-blue font-bold">Loading Staff Records...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-800 italic">
                        Staff Governance Registry
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">Managing Identity, Trilingual Details, and Posting History</p>
                </div>
                <button
                    onClick={() => {
                        setEditingUserId(null);
                        setFormData({
                            name: '', nameHindi: '', nameTamil: '', identityRef: '', email: '', mobile: '', dob: '', gender: 'UNDISCLOSED',
                            postingLevel: 'ALL', officeIds: [], deptIds: [], designationId: '', regionId: '', assignmentDate: '', tenureStartDate: ''
                        });
                        setShowForm(true);
                    }}
                    className="px-5 py-2.5 bg-iob-blue text-white rounded-xl shadow-lg hover:bg-blue-700 font-bold flex items-center transition-all"
                >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Onboard New Staff
                </button>
            </div>

            {success && <div className="p-4 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm font-bold animate-in fade-in duration-300">{success}</div>}
            {error && <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold animate-in fade-in duration-300">{error}</div>}

            {showForm && (
                <div className="iob-card border-2 border-iob-blue/20 bg-blue-50/10 animate-in slide-in-from-top-4 duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center">
                            <Plus className="w-5 h-5 mr-2 text-iob-blue" />
                            {editingUserId ? 'Refine Staff Identity' : 'Onboard New Staff'}
                        </h3>
                        <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-full">
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Primary HR Posting Section */}
                        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                            <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-widest mb-3 flex items-center">
                                <Briefcase className="w-3 h-3 mr-2" />
                                Primary HR Posting (Current)
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Functional Units / Departments</label>
                                    <div className="border border-gray-100 rounded-xl bg-white p-2 h-40 overflow-y-auto space-y-1">
                                        {filteredUnits.length === 0 ? (
                                            <div className="text-[10px] text-gray-400 p-4 text-center italic">No units configured for this region.</div>
                                        ) : filteredUnits.map(d => (
                                            <label key={d.id} className="flex items-center space-x-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.deptIds.includes(d.id)}
                                                    onChange={e => {
                                                        const newIds = e.target.checked
                                                            ? [...formData.deptIds, d.id]
                                                            : formData.deptIds.filter((id: string) => id !== d.id);
                                                        setFormData({ ...formData, deptIds: newIds });
                                                    }}
                                                    className="rounded border-gray-300 text-iob-blue focus:ring-iob-blue w-3.5 h-3.5"
                                                />
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-gray-700">{d.name} <span className="text-[9px] text-gray-400 font-mono">({d.code})</span></span>
                                                    <span className="text-[8px] text-blue-500 font-bold uppercase tracking-widest">{d.subType || d.type}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1 italic">Select one or more departments this staff member is attached to.</p>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">HR Designation</label>
                                    <select
                                        required
                                        value={formData.designationId}
                                        onChange={e => setFormData({ ...formData, designationId: e.target.value })}
                                        className="w-full px-4 py-2 bg-white border border-gray-100 rounded-xl outline-none text-sm"
                                    >
                                        <option value="">-- Select Rank --</option>
                                        {designations.map(d => (
                                            <option key={d.id} value={d.id}>{d.title}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Region</label>
                                    <select
                                        required
                                        value={formData.regionId}
                                        onChange={e => setFormData({ ...formData, regionId: e.target.value, deptIds: [] })}
                                        className="w-full px-4 py-2 bg-white border border-gray-100 rounded-xl outline-none text-sm"
                                    >
                                        <option value="">-- Select Region --</option>
                                        {regions.map(r => (
                                            <option key={r.id} value={r.id}>{r.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Actor Context</label>
                                    <div className="flex bg-white rounded-xl p-1 border border-gray-100 h-[38px]">
                                        {[
                                            { id: 'ALL', label: 'Global' },
                                            { id: 'RO', label: 'RO User' },
                                            { id: 'BRANCH', label: 'Branch User' }
                                        ].map(l => (
                                            <button
                                                key={l.id}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, postingLevel: l.id as any, deptIds: [] })}
                                                className={`flex-1 text-[10px] font-bold rounded-lg transition-all ${formData.postingLevel === l.id ? 'bg-iob-blue text-white shadow-sm' : 'text-gray-400 hover:bg-gray-50'}`}
                                            >
                                                {l.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-1 font-mono">Effective From</label>
                                    <input
                                        type="date"
                                        value={formData.assignmentDate}
                                        onChange={e => setFormData({ ...formData, assignmentDate: e.target.value })}
                                        className="w-full px-4 py-2 bg-white border border-emerald-100 rounded-xl outline-none text-sm focus:ring-2 focus:ring-emerald-500/20"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Governance Assignment Section */}
                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                            <h4 className="text-xs font-bold text-blue-800 uppercase tracking-widest mb-3 flex items-center">
                                <Landmark className="w-3 h-3 mr-2" />
                                Assign Governance Offices
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Select Offices (Multi-Select)</label>
                                    <div className="border border-gray-100 rounded-xl bg-white p-2 h-40 overflow-y-auto space-y-1">
                                        {offices
                                            .filter(o => o.tier !== 'TIER_0_SYSTEM')
                                            .map(office => (
                                                <label key={office.id} className="flex items-center space-x-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer transition-colors">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.officeIds.includes(office.id)}
                                                        onChange={e => {
                                                            const newIds = e.target.checked
                                                                ? [...formData.officeIds, office.id]
                                                                : formData.officeIds.filter((id: string) => id !== office.id);
                                                            setFormData({ ...formData, officeIds: newIds });
                                                        }}
                                                        className="rounded border-gray-300 text-iob-blue focus:ring-iob-blue w-3.5 h-3.5"
                                                    />
                                                    <span className="text-xs text-gray-700">{office.name} <span className="text-[9px] text-gray-400 font-mono">({office.code})</span></span>
                                                </label>
                                            ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-blue-800 uppercase tracking-widest mb-1 font-mono">Live From</label>
                                    <input
                                        type="date"
                                        value={formData.tenureStartDate}
                                        onChange={e => setFormData({ ...formData, tenureStartDate: e.target.value })}
                                        className="w-full px-4 py-2 bg-white border border-blue-100 rounded-xl outline-none text-sm focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </div>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1 italic">
                                Selecting offices will promote this staff member to those roles and start active tenures.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Full Internal Name (English)</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-iob-blue outline-none"
                                    placeholder="e.g. Anita Desai"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Name in Hindi</label>
                                <input
                                    type="text"
                                    value={formData.nameHindi}
                                    onChange={e => setFormData({ ...formData, nameHindi: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-iob-blue outline-none"
                                    placeholder="Hindi Unicode"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Name in Tamil</label>
                                <input
                                    type="text"
                                    value={formData.nameTamil}
                                    onChange={e => setFormData({ ...formData, nameTamil: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-iob-blue outline-none"
                                    placeholder="Tamil Unicode"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Employee ID / Identity Ref</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.identityRef}
                                    onChange={e => setFormData({ ...formData, identityRef: e.target.value.toUpperCase() })}
                                    className="w-full px-4 py-2 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-iob-blue outline-none"
                                    placeholder="EMP20005"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Institutional Email</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
                                    className="w-full px-4 py-2 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-iob-blue outline-none"
                                    placeholder="anita.desai@bank.com"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Mobile Number</label>
                                <input
                                    type="text"
                                    value={formData.mobile}
                                    onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-iob-blue outline-none"
                                    placeholder="+91 99999 00000"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Gender</label>
                                <select
                                    value={formData.gender}
                                    onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-iob-blue outline-none"
                                >
                                    <option value="UNDISCLOSED">Undisclosed</option>
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                    <option value="TRANSGENDER">Transgender</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Date of Birth</label>
                            <input
                                type="date"
                                value={formData.dob}
                                onChange={e => setFormData({ ...formData, dob: e.target.value })}
                                className="w-full px-4 py-2 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-iob-blue outline-none max-w-xs"
                            />
                        </div>

                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-50">
                            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-gray-600">Cancel</button>
                            <button type="submit" className="px-6 py-2 bg-iob-blue text-white rounded-xl font-bold flex items-center hover:bg-blue-700 transition-all">
                                <Save className="w-4 h-4 mr-2" />
                                {editingUserId ? 'Commit Changes' : 'Initialize Identity'}
                            </button>
                        </div>
                    </form>
                </div>
            )
            }

            <div className="iob-card">
                <div className="flex items-center space-x-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name (English/Hindi/Tamil) or Employee ID..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-iob-blue outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-hidden border border-gray-100 rounded-xl">
                    <table className="w-full border-collapse">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Identity & Personal</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Posting History (HR)</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Governance Profile</th>
                                <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-blue-50/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-start">
                                            <div className="w-10 h-10 rounded-xl bg-iob-blue/10 flex items-center justify-center mr-4 mt-1">
                                                <User className="w-5 h-5 text-iob-blue" />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-sm font-bold text-gray-900">{user.name}</div>
                                                {(user.nameHindi || user.nameTamil) && (
                                                    <div className="flex flex-wrap gap-2">
                                                        {user.nameHindi && <span className="text-[10px] font-medium text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded">{user.nameHindi}</span>}
                                                        {user.nameTamil && <span className="text-[10px] font-medium text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">{user.nameTamil}</span>}
                                                    </div>
                                                )}
                                                <div className="flex items-center space-x-3 text-[10px] text-gray-500 font-mono">
                                                    <span>{user.identityRef}</span>
                                                    {user.mobile && <span className="flex items-center"><Phone className="w-2.5 h-2.5 mr-1" /> {user.mobile}</span>}
                                                </div>
                                                <div className="flex items-center space-x-2 text-[10px] text-gray-400">
                                                    {user.gender && <span className="uppercase tracking-tighter">{user.gender}</span>}
                                                    {user.dob && <span className="flex items-center"><CalendarIcon className="w-2.5 h-2.5 mr-1" /> {new Date(user.dob).toLocaleDateString()}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.postings && user.postings.length > 0 ? (
                                            <div className="space-y-3">
                                                {user.postings
                                                    .sort((a: any, b: any) => (a.status === 'ACTIVE' ? -1 : (b.status === 'ACTIVE' ? 1 : 0)))
                                                    .slice(0, 2)
                                                    .map((posting: any) => (
                                                        <div key={posting.id} className={`space-y-0.5 border-l-2 pl-2 ${posting.status === 'ACTIVE' ? 'border-iob-blue' : 'border-gray-200'}`}>
                                                            <div className={`flex items-center text-xs font-bold ${posting.status === 'ACTIVE' ? 'text-gray-900' : 'text-gray-400'}`}>
                                                                <Shield className={`w-3 h-3 mr-1.5 ${posting.status === 'ACTIVE' ? 'text-iob-blue' : 'text-gray-300'}`} />
                                                                {posting.designation.title}
                                                                {posting.status === 'ACTIVE' && <span className="ml-2 text-[8px] bg-blue-50 text-blue-600 px-1 rounded uppercase">Active</span>}
                                                            </div>
                                                            <div className="flex items-center text-[10px] text-gray-400 uppercase tracking-wide">
                                                                <Briefcase className="w-3 h-3 mr-1.5" />
                                                                {posting.departments.map((d: any) => d.name).join(' | ')}
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        ) : (
                                            <span className="text-[10px] text-red-500 italic font-bold bg-red-50 px-2 py-1 rounded">No Historical Postings</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-3">
                                            {user.tenures && user.tenures.length > 0 ? (
                                                user.tenures
                                                    .sort((a: any, b: any) => (a.status === 'ACTIVE' ? -1 : (b.status === 'ACTIVE' ? 1 : 0)))
                                                    .slice(0, 4)
                                                    .map((tenure: any) => (
                                                        <div key={tenure.id} className={`p-2 rounded-lg border block mb-1 ${tenure.status === 'ACTIVE' ? 'bg-green-50 border-green-100' : 'bg-gray-50/50 border-gray-100'}`}>
                                                            <div className={`flex items-center text-[11px] font-bold ${tenure.status === 'ACTIVE' ? 'text-green-800' : 'text-gray-500'}`}>
                                                                <Landmark className={`w-3 h-3 mr-1.5 ${tenure.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-300'}`} />
                                                                {tenure.office.name}
                                                                {tenure.status === 'ACTIVE' && <span className="ml-2 text-[8px] bg-green-200 text-green-800 px-1 rounded uppercase">Live</span>}
                                                            </div>
                                                            <div className={`text-[9px] mt-0.5 font-medium ${tenure.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-400'}`}>
                                                                {tenure.startDate ? new Date(tenure.startDate).toLocaleDateString() : 'N/A'} {tenure.status === 'PAST' && ` - ${tenure.endDate ? new Date(tenure.endDate).toLocaleDateString() : 'Present'}`}
                                                            </div>
                                                        </div>
                                                    ))
                                            ) : (
                                                <span className="text-[10px] text-amber-600 italic font-bold bg-amber-50 px-2 py-1 rounded">No Governance Tenure</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end space-x-2 items-center">
                                            <button onClick={() => handleEdit(user)} className="p-1.5 text-iob-blue hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100" title="Edit Staff Details">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(user.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100" title="Remove Record">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedUserForHistory(user);
                                                    setShowHistoryModal(true);
                                                }}
                                                className="p-1.5 text-gray-400 hover:text-iob-blue hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                                title="Manage History & Cleanup"
                                            >
                                                <History className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {showHistoryModal && selectedUserForHistory && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                                    <History className="w-5 h-5 mr-3 text-iob-blue" />
                                    Personnel Lifecycle - {selectedUserForHistory.name}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">Full audit of HR Postings and Governance Tenures</p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => setShowBackfillForm(!showBackfillForm)}
                                    className="px-4 py-2 bg-blue-50 text-blue-700 text-xs font-bold rounded-xl border border-blue-100 hover:bg-blue-100 flex items-center transition-all"
                                >
                                    <Plus className="w-3.5 h-3.5 mr-2" />
                                    {showBackfillForm ? 'Hide Form' : 'Backfill History'}
                                </button>
                                <button
                                    onClick={() => handleCleanup(selectedUserForHistory.id)}
                                    className="px-4 py-2 bg-amber-50 text-amber-700 text-xs font-bold rounded-xl border border-amber-100 hover:bg-amber-100 flex items-center transition-all"
                                >
                                    <RefreshCw className="w-3.5 h-3.5 mr-2" />
                                    Cleanup Duplicates
                                </button>
                                <button onClick={() => setShowHistoryModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>
                        </div>

                        {showBackfillForm && (
                            <div className="p-6 bg-blue-50/30 border-b border-blue-100">
                                <form onSubmit={handleBackfill} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="md:col-span-4 flex items-center space-x-4 mb-2">
                                        <div className="flex bg-white rounded-lg p-1 border border-blue-200">
                                            <button
                                                type="button"
                                                onClick={() => setBackfillData({ ...backfillData, type: 'POSTING' })}
                                                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${backfillData.type === 'POSTING' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-blue-600'}`}
                                            >
                                                HR Posting
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setBackfillData({ ...backfillData, type: 'TENURE' })}
                                                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${backfillData.type === 'TENURE' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-blue-600'}`}
                                            >
                                                Governance Tenure
                                            </button>
                                        </div>
                                    </div>

                                    {backfillData.type === 'POSTING' ? (
                                        <>
                                            <div className="border border-blue-200 rounded-xl bg-white p-2 h-32 overflow-y-auto space-y-1">
                                                {departments.map(d => (
                                                    <label key={d.id} className="flex items-center space-x-2 p-1 hover:bg-blue-50 rounded cursor-pointer transition-colors">
                                                        <input
                                                            type="checkbox"
                                                            checked={backfillData.deptIds.includes(d.id)}
                                                            onChange={e => {
                                                                const newIds = e.target.checked
                                                                    ? [...backfillData.deptIds, d.id]
                                                                    : backfillData.deptIds.filter((id: string) => id !== d.id);
                                                                setBackfillData({ ...backfillData, deptIds: newIds });
                                                            }}
                                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3 h-3"
                                                        />
                                                        <span className="text-[10px] text-gray-700">{d.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                            <select
                                                required
                                                value={backfillData.designationId}
                                                onChange={e => setBackfillData({ ...backfillData, designationId: e.target.value })}
                                                className="px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20"
                                            >
                                                <option value="">Select Designation</option>
                                                {designations.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                                            </select>
                                            <select
                                                required
                                                value={backfillData.regionId}
                                                onChange={e => setBackfillData({ ...backfillData, regionId: e.target.value })}
                                                className="px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20"
                                            >
                                                <option value="">Select Region</option>
                                                {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                            </select>
                                        </>
                                    ) : (
                                        <select
                                            required
                                            value={backfillData.officeId}
                                            onChange={e => setBackfillData({ ...backfillData, officeId: e.target.value })}
                                            className="px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20 md:col-span-3"
                                        >
                                            <option value="">Select Governance Office</option>
                                            {offices.map(o => <option key={o.id} value={o.id}>{o.name} ({o.tier})</option>)}
                                        </select>
                                    )}

                                    <div className="flex space-x-2">
                                        <div className="flex-1">
                                            <label className="text-[9px] text-blue-900 font-bold block mb-1">Start Date</label>
                                            <input
                                                type="date"
                                                required
                                                value={backfillData.startDate}
                                                onChange={e => setBackfillData({ ...backfillData, startDate: e.target.value })}
                                                className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-[9px] text-blue-900 font-bold block mb-1">End Date (Opt)</label>
                                            <input
                                                type="date"
                                                value={backfillData.endDate}
                                                onChange={e => setBackfillData({ ...backfillData, endDate: e.target.value })}
                                                className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20"
                                            />
                                        </div>
                                    </div>

                                    <div className="md:col-span-3 flex items-center space-x-4">
                                        <label className="text-[10px] font-bold text-blue-900">Record Status:</label>
                                        <div className="flex space-x-3">
                                            {['ACTIVE', 'PAST'].map(s => (
                                                <label key={s} className="flex items-center space-x-1 cursor-pointer group">
                                                    <input
                                                        type="radio"
                                                        name="backfill_status"
                                                        value={s}
                                                        checked={backfillData.status === s}
                                                        onChange={() => setBackfillData({ ...backfillData, status: s })}
                                                        className="w-3 h-3 text-blue-600"
                                                    />
                                                    <span className={`text-[10px] font-bold ${backfillData.status === s ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-400'}`}>{s === 'ACTIVE' ? (backfillData.type === 'TENURE' ? 'LIVE' : 'ACTIVE') : 'PAST'}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-end">
                                        <button
                                            type="submit"
                                            className="w-full py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center"
                                        >
                                            <Save className="w-3.5 h-3.5 mr-2" />
                                            Save Record
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* HR Posting History */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center">
                                    <Briefcase className="w-4 h-4 mr-2" />
                                    HR Posting History
                                </h4>
                                <div className="space-y-3">
                                    {selectedUserForHistory.postings?.map((p: any) => (
                                        <div key={p.id} className={`p-4 rounded-2xl border transition-all ${p.status === 'ACTIVE' ? 'bg-blue-50/50 border-blue-100 ring-2 ring-blue-500/10' : 'bg-gray-50 border-gray-100'}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <div className={`text-sm font-bold ${p.status === 'ACTIVE' ? 'text-blue-900' : 'text-gray-600'}`}>
                                                    {p.designation.title}
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${p.status === 'ACTIVE' ? 'bg-blue-200 text-blue-700' : 'bg-gray-200 text-gray-500'}`}>
                                                        {p.status}
                                                    </span>
                                                    <button onClick={() => handleDeletePosting(p.id)} className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors">
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-500 flex items-center">
                                                < Landmark className="w-3 h-3 mr-1.5 opacity-50" />
                                                {p.department.name} ({p.region.name})
                                            </div>
                                            <div className="text-[10px] text-gray-400 mt-2 flex items-center font-mono">
                                                <CalendarIcon className="w-3 h-3 mr-1.5" />
                                                {new Date(p.validFrom).toLocaleDateString()} — {p.validTo ? new Date(p.validTo).toLocaleDateString() : 'Present'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Governance Tenures */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center">
                                    <Shield className="w-4 h-4 mr-2" />
                                    Governance Tenures
                                </h4>
                                <div className="space-y-3">
                                    {selectedUserForHistory.tenures?.map((t: any) => (
                                        <div key={t.id} className={`p-4 rounded-2xl border transition-all ${t.status === 'ACTIVE' ? 'bg-green-50/50 border-green-100 ring-2 ring-green-500/10' : 'bg-gray-50 border-gray-100'}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <div className={`text-sm font-bold ${t.status === 'ACTIVE' ? 'text-green-900' : 'text-gray-600'}`}>
                                                    {t.office.name}
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${t.status === 'ACTIVE' ? 'bg-green-200 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                                                        {t.status === 'ACTIVE' ? 'LIVE' : 'PAST'}
                                                    </span>
                                                    <button onClick={() => handleDeleteTenure(t.id)} className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors">
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="text-[10px] text-gray-400 mt-2 flex items-center font-mono">
                                                <CalendarIcon className="w-3 h-3 mr-1.5" />
                                                {new Date(t.startDate).toLocaleDateString()} — {t.endDate ? new Date(t.endDate).toLocaleDateString() : 'Present'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => setShowHistoryModal(false)}
                                className="px-6 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-100 transition-all"
                            >
                                Close Lifecycle View
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
