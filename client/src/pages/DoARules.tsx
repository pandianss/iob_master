import { useEffect, useState } from 'react';
import { Shield, Plus, TrendingUp, AlertTriangle } from 'lucide-react';

interface DoARule {
    id: string;
    authorityBodyType: string;
    authorityBodyId: string;
    decisionTypeId: string;
    functionalScopeId: string;
    limitMin: number | null;
    limitMax: number | null;
    currency: string;
}

export function DoARules() {
    const [rules, setRules] = useState<DoARule[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // For now, show empty state - will connect to API
        setLoading(false);
        setRules([]);
    }, []);

    if (loading) return <div className="p-4">Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Delegation of Authority (DoA) Rules</h1>
                    <p className="text-sm text-gray-500 mt-1">Configure authority limits and decision-making powers</p>
                </div>
                <button className="flex items-center px-4 py-2 bg-[var(--color-brand-primary)] text-white rounded-lg hover:bg-[var(--color-brand-secondary)] transition-colors">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Rule
                </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Rules</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">12</p>
                        </div>
                        <Shield className="w-8 h-8 text-blue-500" />
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Active Designations</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">5</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-green-500" />
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Pending Reviews</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">3</p>
                        </div>
                        <AlertTriangle className="w-8 h-8 text-yellow-500" />
                    </div>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">DoA Rules Configuration</h3>
                <p className="text-gray-500 mb-4">
                    Define authority limits for designations and committees based on functional scopes.
                </p>
                <button className="px-4 py-2 bg-[var(--color-brand-primary)] text-white rounded-lg hover:bg-[var(--color-brand-secondary)]">
                    Configure First Rule
                </button>
            </div>
        </div>
    );
}
