import { useState, Suspense, lazy } from 'react';
import { ShieldCheck, ListChecks, Settings } from 'lucide-react';

const DoARules = lazy(() => import('./DoARules').then(m => ({ default: m.DoARules })));
const GovernanceParameters = lazy(() => import('./GovernanceParameters').then(m => ({ default: m.GovernanceParameters })));
const ParameterMapping = lazy(() => import('./ParameterMapping').then(m => ({ default: m.ParameterMapping })));

export default function GovernanceWorkspace() {
    const [activeTab, setActiveTab] = useState<'doa' | 'params' | 'mapping'>('doa');

    const tabs = [
        { id: 'doa', name: 'DoA Rules', icon: ShieldCheck },
        { id: 'params', name: 'Governance Parameters', icon: Settings },
        { id: 'mapping', name: 'Parameter Mapping', icon: ListChecks },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Governance Workspace</h1>
                    <p className="text-sm text-gray-500">Manage rules, parameters and authority matrices</p>
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
                <Suspense fallback={<div className="p-12 text-center text-gray-400 animate-pulse">Loading Governance Context...</div>}>
                    {activeTab === 'doa' && <DoARules />}
                    {activeTab === 'params' && <GovernanceParameters />}
                    {activeTab === 'mapping' && <ParameterMapping />}
                </Suspense>
            </div>
        </div>
    );
}
