
import { useState, useEffect } from 'react';
import { User, Briefcase, Landmark, Shield, Plus, CheckCircle2, Search, UserPlus } from 'lucide-react';

export function StaffRegistry() {
    const [users, setUsers] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [designations, setDesignations] = useState<any[]>([]);
    const [offices, setOffices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [uRes, dRes, dgRes, oRes] = await Promise.all([
                    fetch('/api/admin/users'),
                    fetch('/api/admin/departments'),
                    fetch('/api/admin/designations'),
                    fetch('/api/governance/offices')
                ]);
                setUsers(await uRes.json());
                setDepartments(await dRes.json());
                setDesignations(await dgRes.json());
                setOffices(await oRes.json());
            } catch (err) {
                console.error('Fetch error', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.identityRef.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center animate-pulse text-iob-blue font-bold">Loading Staff Records...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-800 italic">
                        Staff Governance Registry
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">Managing the interplay between Identity, Designation, and Office Tenure</p>
                </div>
                <button className="px-5 py-2.5 bg-iob-blue text-white rounded-xl shadow-lg hover:bg-iob-blue-dark font-bold flex items-center transition-all">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Onboard New Staff
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <div className="iob-card">
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name or Employee ID..."
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
                                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Identity</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Current Posting (HR)</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Office Tenure (Governance)</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-blue-50/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-xl bg-iob-blue/10 flex items-center justify-center mr-4">
                                                    <User className="w-5 h-5 text-iob-blue" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900">{user.name}</div>
                                                    <div className="text-xs text-gray-500 font-mono">{user.identityRef}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.postings && user.postings[0] ? (
                                                <div className="space-y-1">
                                                    <div className="flex items-center text-xs font-bold text-gray-700">
                                                        <Shield className="w-3 h-3 mr-1.5 text-iob-blue" />
                                                        {user.postings[0].designation.title}
                                                    </div>
                                                    <div className="flex items-center text-[10px] text-gray-500 uppercase tracking-wide">
                                                        <Briefcase className="w-3 h-3 mr-1.5" />
                                                        {user.postings[0].department.name}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-red-500 italic font-bold">Unposted Identity</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.tenures && user.tenures[0] ? (
                                                <div className="bg-green-50/50 p-2 rounded-lg border border-green-100 inline-block">
                                                    <div className="flex items-center text-xs font-bold text-green-800">
                                                        <Landmark className="w-3 h-3 mr-1.5" />
                                                        {user.tenures[0].office.name}
                                                    </div>
                                                    <div className="text-[10px] text-green-600 mt-0.5 font-medium">
                                                        Active since {new Date(user.tenures[0].startDate).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-amber-600 italic font-bold bg-amber-50 px-2 py-1 rounded">No Active Tenure</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-xs font-bold text-iob-blue hover:underline">Manage Context</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
