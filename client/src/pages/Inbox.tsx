import { useEffect, useState } from 'react';
import { FileText, User, ArrowRight, Clock, AlertTriangle, Plus, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Decision {
    id: string;
    deptContextId: string;
    status: string;
    outcomeData: any;
    createdAt: string;
    initiatorPosting: {
        user: {
            name: string;
        };
        designation: {
            title: string;
        };
    };
    authRule: {
        authorityBodyType: string;
    } | null;
}

interface Stats {
    pending: number;
    escalated: number;
}

export function Inbox() {
    const [decisions, setDecisions] = useState<Decision[]>([]);
    const [stats, setStats] = useState<Stats>({ pending: 0, escalated: 0 });
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const parsedUser = JSON.parse(userStr);
            setUser(parsedUser);
            fetchData(parsedUser.user.identityRef);
        }
    }, []);

    const fetchData = async (identityRef: string) => {
        try {
            setLoading(true);
            const [decisionsRes, statsRes] = await Promise.all([
                fetch(`/api/reporting/inbox/${identityRef}`),
                fetch(`/api/reporting/inbox/${identityRef}/stats`)
            ]);

            if (decisionsRes.ok) {
                const data = await decisionsRes.json();
                setDecisions(data);
            }

            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStats(statsData);
            }
        } catch (error) {
            console.error('Failed to fetch inbox data', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center animate-pulse text-iob-blue font-bold tracking-widest uppercase text-sm">Synchronizing Ledger...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-iob-blue-dark tracking-tight italic">The Ledger</h1>
                    <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-semibold flex items-center">
                        <Shield className="w-3 h-3 mr-1.5 text-iob-blue" />
                        Governance Inbox for {user?.user?.name || 'Authorized User'}
                    </p>
                </div>
                <div className="flex space-x-3">
                    <div className="flex space-x-2">
                        <span className="iob-badge-neutral flex items-center bg-amber-50 text-amber-800 border-amber-100">
                            <Clock className="w-3 h-3 mr-1.5" /> Pending: {stats.pending}
                        </span>
                        <span className="px-3 py-1 bg-red-50 text-red-800 border border-red-100 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center">
                            <AlertTriangle className="w-3 h-3 mr-1.5" /> Escalated: {stats.escalated}
                        </span>
                    </div>
                    <Link to="/decisions/new" className="iob-btn-primary py-2 px-4 text-xs flex items-center shadow-lg hover:scale-105 transition-all">
                        <Plus className="w-3.5 h-3.5 mr-1.5" />
                        Initiate Request
                    </Link>
                </div>
            </div>

            <div className="iob-card !p-0 overflow-hidden ring-1 ring-black/5 shadow-xl">
                <table className="iob-table w-full">
                    <thead className="bg-gray-50/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Status</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Item / Instrument</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Initiator</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Authority</th>
                            <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {decisions.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                            <FileText className="w-8 h-8 text-gray-200" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-300 italic tracking-tight">No Pending Decisions</h3>
                                        <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">Your governance inbox is clear. New proposals requiring your action will appear here.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            decisions.map((decision) => (
                                <tr key={decision.id} className="hover:bg-blue-50/40 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border
                                            ${decision.status === 'PENDING_APPROVAL' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                                decision.status === 'SANCTIONED' ? 'bg-green-600 text-white border-green-700' :
                                                    decision.status === 'REJECTED' ? 'bg-red-100 text-red-800 border-red-200' :
                                                        decision.status === 'QUERY_RAISED' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                                                            'bg-gray-100 text-gray-800 border-gray-200'
                                            }`}>
                                            {decision.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-sm text-gray-900 line-clamp-1">{decision.outcomeData?.subject || 'Proposal'}</div>
                                        <div className="flex items-center mt-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            <FileText className="w-3 h-3 mr-1.5 text-iob-blue/50" />
                                            ID: {decision.id.substring(0, 8)} | Coordination Note
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 rounded-full bg-iob-emphasis/10 flex items-center justify-center mr-3 ring-2 ring-white">
                                                <User className="w-4 h-4 text-iob-emphasis" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-gray-900">{decision.initiatorPosting.user.name}</div>
                                                <div className="text-[10px] text-gray-500 font-medium">{decision.initiatorPosting.designation.title}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-200 uppercase tracking-tighter">
                                            {decision.authRule?.authorityBodyType || 'STANDARD'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <Link
                                            to={`/decisions/${decision.id}`}
                                            className="iob-btn-primary text-[10px] px-3 py-1.5 flex items-center justify-end ml-auto bg-white !text-iob-blue border border-iob-blue hover:bg-iob-blue hover:!text-white transition-all shadow-sm"
                                        >
                                            Take Action <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
