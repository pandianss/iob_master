import { useState, Suspense, lazy } from 'react';
import { LayoutDashboard, FileText, TrendingUp } from 'lucide-react';

const MISDashboard = lazy(() => import('./MISDashboard').then(m => ({ default: m.MISDashboard })));
const BusinessSnapshot = lazy(() => import('./BusinessSnapshot').then(m => ({ default: m.BusinessSnapshot })));

export default function IntelligenceHub() {
    const [activeTab, setActiveTab] = useState<'mis' | 'snapshot' | 'negative'>('mis');

    const tabs = [
        { id: 'mis', name: 'MIS Dashboard', icon: LayoutDashboard },
        { id: 'snapshot', name: 'Business Snapshot', icon: FileText },
        { id: 'negative', name: 'Negative Parameters', icon: TrendingUp },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Intelligence Hub</h1>
                    <p className="text-sm text-gray-500">Centralized analytics and monitoring</p>
                </div>
            </div>

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`
                                flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-all
                                ${activeTab === tab.id
                                    ? 'border-iob-blue text-iob-blue'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                            `}
                        >
                            <tab.icon className="w-4 h-4 mr-2" />
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="mt-6">
                <Suspense fallback={<div className="p-12 text-center text-gray-400 animate-pulse">Loading Analytics...</div>}>
                    {activeTab === 'mis' && <MISDashboard />}
                    {activeTab === 'snapshot' && <BusinessSnapshot />}
                    {activeTab === 'negative' && (
                        <div className="bg-white p-16 rounded-2xl border border-dashed border-gray-200 text-center shadow-sm">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <TrendingUp className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Negative Parameter MIS</h3>
                            <p className="text-gray-500 max-w-sm mx-auto text-sm leading-relaxed">
                                This module is currently indexing legacy CBS data for automated exception detection.
                                Live feeds will be available in the next governance sprint.
                            </p>
                        </div>
                    )}
                </Suspense>
            </div>
        </div>
    );
}
