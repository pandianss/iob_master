import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

export function MISDashboard() {
    const [stats, setStats] = useState({
        pendingApprovals: 0,
        escalatedDecisions: 0,
        complianceScore: 0,
    });

    useEffect(() => {
        // Mock data for now
        setStats({
            pendingApprovals: 12,
            escalatedDecisions: 3,
            complianceScore: 94,
        });
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">MIS Command Center</h1>
                <p className="text-sm text-gray-500 mt-1">Real-time governance metrics and decision analytics</p>
            </div>

            <div className="grid grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-500">Pending Approvals</p>
                        <TrendingUp className="w-5 h-5 text-yellow-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.pendingApprovals}</p>
                    <p className="text-xs text-gray-400 mt-1">Awaiting your action</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-500">Escalated</p>
                        <AlertCircle className="w-5 h-5 text-red-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.escalatedDecisions}</p>
                    <p className="text-xs text-gray-400 mt-1">DoA limit breaches</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-500">Compliance Score</p>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.complianceScore}%</p>
                    <p className="text-xs text-gray-400 mt-1">Controls satisfied</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-500">Decisions (MTD)</p>
                        <BarChart3 className="w-5 h-5 text-blue-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">47</p>
                    <p className="text-xs text-gray-400 mt-1">Month-to-date</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">DoA Breach Heatmap</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                            <div>
                                <p className="font-medium text-gray-900">Credit Department</p>
                                <p className="text-sm text-gray-500">3 escalations this month</p>
                            </div>
                            <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded">High</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                            <div>
                                <p className="font-medium text-gray-900">IT Department</p>
                                <p className="text-sm text-gray-500">1 escalation this month</p>
                            </div>
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded">Medium</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <div>
                                <p className="font-medium text-gray-900">HR Department</p>
                                <p className="text-sm text-gray-500">0 escalations this month</p>
                            </div>
                            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded">Low</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                        <div className="flex items-start space-x-3 p-3 border-l-4 border-green-500 bg-gray-50 rounded">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Credit Sanction Approved</p>
                                <p className="text-xs text-gray-500">DEC-2026-045 • 2 hours ago</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3 p-3 border-l-4 border-yellow-500 bg-gray-50 rounded">
                            <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Pending Review</p>
                                <p className="text-xs text-gray-500">DEC-2026-046 • 5 hours ago</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3 p-3 border-l-4 border-red-500 bg-gray-50 rounded">
                            <TrendingUp className="w-5 h-5 text-red-500 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Escalated to GM</p>
                                <p className="text-xs text-gray-500">DEC-2026-044 • 1 day ago</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
