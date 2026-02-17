import { useEffect, useState } from 'react';
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    TrendingUp,
    ShieldAlert,
    ArrowUpRight,
    Search,
    BarChart3
} from 'lucide-react';

interface MISStats {
    pendingApprovals: number;
    escalatedDecisions: number;
    complianceScore: number;
    totalDecisions: number;
}

interface PendingAction {
    id: string;
    title: string;
    status: string;
    createdAt: string;
    initiatorPosting: { user: { name: string } };
}

export function MISDashboard() {
    const [stats, setStats] = useState<MISStats | null>(null);
    const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, pendingRes] = await Promise.all([
                    fetch('/api/reporting/mis-summary'),
                    fetch('/api/reporting/inbox/EMP00000')
                ]);

                const statsData = await statsRes.json();
                const pendingData = await pendingRes.json();

                setStats(statsData);
                setPendingActions(pendingData);
            } catch (error) {
                console.error('Failed to fetch MIS data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center p-20 text-iob-blue animate-pulse">
            <TrendingUp className="w-8 h-8 mr-3" />
            <span className="font-bold tracking-widest uppercase">Aggregating Intelligence...</span>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Intelligence Hub Overview</h1>
                    <p className="text-sm text-gray-500 mt-1">Real-time system health and governance metrics</p>
                </div>
                <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm">
                    <Search className="w-4 h-4 text-gray-400 mr-2" />
                    <input
                        type="text"
                        placeholder="Search entities..."
                        className="text-sm border-none focus:ring-0 w-48 text-gray-600"
                    />
                </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3 text-yellow-600">
                        <Clock className="w-5 h-5" />
                        <span className="text-[10px] font-bold bg-yellow-50 px-2 py-0.5 rounded-full">ACTIVE</span>
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending Approvals</p>
                    <p className="text-3xl font-black text-gray-900 mt-1">{stats?.pendingApprovals || 0}</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3 text-red-600">
                        <ShieldAlert className="w-5 h-5" />
                        <span className="text-[10px] font-bold bg-red-50 px-2 py-0.5 rounded-full">CRITICAL</span>
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Escalated Decisions</p>
                    <p className="text-3xl font-black text-gray-900 mt-1">{stats?.escalatedDecisions || 0}</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3 text-green-600">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="text-[10px] font-bold bg-green-50 px-2 py-0.5 rounded-full">OPTIMAL</span>
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Compliance Score</p>
                    <p className="text-3xl font-black text-gray-900 mt-1">{stats?.complianceScore || 0}%</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3 text-blue-600">
                        <TrendingUp className="w-5 h-5" />
                        <span className="text-[10px] font-bold bg-blue-50 px-2 py-0.5 rounded-full">TOTAL</span>
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Indexed Decisions</p>
                    <p className="text-3xl font-black text-gray-900 mt-1">{stats?.totalDecisions || 0}</p>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-8 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <h3 className="text-sm font-bold text-gray-900 flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-iob-blue" />
                            Authority Action Queue
                        </h3>
                        <button className="text-[10px] font-bold text-iob-blue hover:underline uppercase tracking-widest">
                            View All Queue
                        </button>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {pendingActions.slice(0, 5).map((action) => (
                            <div key={action.id} className="px-6 py-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                        <AlertCircle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{action.title}</p>
                                        <div className="flex items-center mt-0.5 space-x-2 text-[10px] font-bold">
                                            <span className="text-gray-400">BY: {action.initiatorPosting?.user?.name || 'Unknown'}</span>
                                            <span className="text-gray-300">•</span>
                                            <span className="text-iob-blue">{new Date(action.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <button className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all border border-transparent hover:border-gray-200">
                                    <ArrowUpRight className="w-4 h-4 text-gray-400" />
                                </button>
                            </div>
                        ))}
                        {pendingActions.length === 0 && (
                            <div className="px-6 py-12 text-center text-gray-400">
                                <p className="text-sm">Action Queue is clear. No pending items found.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="col-span-4 space-y-6">
                    <div className="bg-brand-gradient p-6 rounded-xl text-white shadow-lg">
                        <h3 className="text-sm font-bold opacity-80 uppercase tracking-widest mb-4">Quick Health Audit</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs font-bold mb-1">
                                    <span>Resolution Speed</span>
                                    <span>84%</span>
                                </div>
                                <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-white w-[84%] rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs font-bold mb-1">
                                    <span>Risk Coverage</span>
                                    <span>92%</span>
                                </div>
                                <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-white w-[92%] rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                        <div className="flex items-center space-x-2 mb-4">
                            <BarChart3 className="w-4 h-4 text-gray-400" />
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Key Insights</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                <p className="text-xs text-gray-600 leading-relaxed font-medium">Compliance scores are 4% above last quarter average.</p>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                                <p className="text-xs text-gray-600 leading-relaxed font-medium">Average approval time has increased for Credit exceptions.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
