import { useEffect, useState } from 'react';
import { Shield, Plus, TrendingUp, AlertTriangle, Scale, Activity } from 'lucide-react';

interface DoARule {
    id: string;
    authorityBodyType: string;
    authorityBodyId: string;
    decisionType: { id: string; name: string; category: string };
    functionalScope: { id: string; name: string };
    limitMin: number | null;
    limitMax: number | null;
    currency: string;
    requiresEvidence: boolean;
    isEscalationMandatory: boolean;
}

export function DoARules() {
    const [rules, setRules] = useState<DoARule[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingRule, setEditingRule] = useState<DoARule | null>(null);

    // Dropdown data
    const [decisionTypes, setDecisionTypes] = useState<any[]>([]);
    const [functionalScopes, setFunctionalScopes] = useState<any[]>([]);
    const [designations, setDesignations] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        authorityBodyType: 'DESIGNATION',
        authorityBodyId: '',
        decisionTypeId: '',
        functionalScopeId: '',
        limitMin: 0,
        limitMax: 0,
        currency: 'INR',
        requiresEvidence: true,
        isEscalationMandatory: false
    });

    const fetchRules = () => {
        setLoading(true);
        fetch('/api/governance/doa-rules')
            .then(res => res.json())
            .then(data => {
                setRules(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    const fetchHelpers = async () => {
        try {
            const [dtRes, fsRes, dRes] = await Promise.all([
                fetch('/api/governance/decision-types'),
                fetch('/api/governance/functional-scopes'),
                fetch('/api/governance/designations')
            ]);

            const dtData = await dtRes.json();
            const fsData = await fsRes.json();
            const dData = await dRes.json();

            setDecisionTypes(Array.isArray(dtData) ? dtData : []);
            setFunctionalScopes(Array.isArray(fsData) ? fsData : []);
            setDesignations(Array.isArray(dData) ? dData : []);
        } catch (error) {
            console.error('Failed to fetch helpers:', error);
            setDecisionTypes([]);
            setFunctionalScopes([]);
            setDesignations([]);
        }
    };

    useEffect(() => {
        fetchRules();
        fetchHelpers();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingRule
                ? `/api/governance/doa-rules/${editingRule.id}`
                : '/api/governance/doa-rules';
            const method = editingRule ? 'PUT' : 'POST';

            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            setShowForm(false);
            setEditingRule(null);
            fetchRules();
        } catch (error) {
            console.error('Failed to save rule:', error);
        }
    };

    const handleEdit = (rule: DoARule) => {
        setEditingRule(rule);
        setFormData({
            authorityBodyType: rule.authorityBodyType,
            authorityBodyId: rule.authorityBodyId,
            decisionTypeId: rule.decisionType.id,
            functionalScopeId: rule.functionalScope.id,
            limitMin: rule.limitMin || 0,
            limitMax: rule.limitMax || 0,
            currency: rule.currency || 'INR',
            requiresEvidence: rule.requiresEvidence,
            isEscalationMandatory: rule.isEscalationMandatory
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this rule?')) return;
        try {
            await fetch(`/api/governance/doa-rules/${id}`, { method: 'DELETE' });
            fetchRules();
        } catch (error) {
            console.error('Failed to delete rule:', error);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center p-20 text-iob-blue animate-pulse">
            <Shield className="w-8 h-8 mr-3" />
            <span className="font-bold tracking-widest uppercase">Syncing Authority Matrix...</span>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Delegation of Authority (DoA) Rules</h1>
                        <p className="text-sm text-gray-500 mt-1">Configure authority limits and decision-making powers</p>
                    </div>
                    <div className="flex items-center bg-green-50 px-2 py-1 rounded border border-green-100 animate-pulse">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-[10px] font-black text-green-700 uppercase">Live Registry</span>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={fetchRules}
                        className="p-2 text-gray-400 hover:text-iob-blue hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-200"
                    >
                        <Activity className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => {
                            setEditingRule(null);
                            setFormData({
                                authorityBodyType: 'DESIGNATION',
                                authorityBodyId: '',
                                decisionTypeId: '',
                                functionalScopeId: '',
                                limitMin: 0,
                                limitMax: 0,
                                currency: 'INR',
                                requiresEvidence: true,
                                isEscalationMandatory: false
                            });
                            setShowForm(true);
                        }}
                        className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors font-bold text-sm shadow-sm"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Rule
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black text-gray-900 tracking-tighter uppercase italic flex items-center">
                            <Shield className="w-6 h-6 mr-2 text-iob-blue" />
                            {editingRule ? 'Modify Authority Rule' : 'Forge New Authority Rule'}
                        </h3>
                        <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 font-bold text-xs uppercase tracking-widest">Cancel</button>
                    </div>
                    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Authority Holder</label>
                                <select
                                    className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg text-sm font-bold focus:ring-2 focus:ring-iob-blue outline-none"
                                    value={formData.authorityBodyId}
                                    onChange={e => setFormData({ ...formData, authorityBodyId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Designation</option>
                                    {designations.map(d => (
                                        <option key={d.id} value={d.id}>{d.title} (Rank {d.rank})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Decision Nature</label>
                                    <select
                                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg text-sm font-bold focus:ring-2 focus:ring-iob-blue outline-none"
                                        value={formData.decisionTypeId}
                                        onChange={e => setFormData({ ...formData, decisionTypeId: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Type</option>
                                        {decisionTypes.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Functional Scope</label>
                                    <select
                                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg text-sm font-bold focus:ring-2 focus:ring-iob-blue outline-none"
                                        value={formData.functionalScopeId}
                                        onChange={e => setFormData({ ...formData, functionalScopeId: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Scope</option>
                                        {functionalScopes.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Min Limit</label>
                                    <input
                                        type="number"
                                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg text-sm font-bold focus:ring-2 focus:ring-iob-blue outline-none"
                                        value={formData.limitMin}
                                        onChange={e => setFormData({ ...formData, limitMin: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Max Limit</label>
                                    <input
                                        type="number"
                                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg text-sm font-bold focus:ring-2 focus:ring-iob-blue outline-none"
                                        value={formData.limitMax}
                                        onChange={e => setFormData({ ...formData, limitMax: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center space-x-8 pt-4">
                                <label className="flex items-center cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-gray-300 text-iob-blue focus:ring-iob-blue mr-3"
                                        checked={formData.requiresEvidence}
                                        onChange={e => setFormData({ ...formData, requiresEvidence: e.target.checked })}
                                    />
                                    <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900 transition-colors uppercase tracking-tight">Evidence Mandatory</span>
                                </label>
                                <label className="flex items-center cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-gray-300 text-iob-blue focus:ring-iob-blue mr-3"
                                        checked={formData.isEscalationMandatory}
                                        onChange={e => setFormData({ ...formData, isEscalationMandatory: e.target.checked })}
                                    />
                                    <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900 transition-colors uppercase tracking-tight">Force Escalation</span>
                                </label>
                            </div>
                        </div>
                        <div className="col-span-2 pt-4 flex justify-end">
                            <button type="submit" className="px-8 py-3 bg-iob-blue text-white rounded-lg hover:bg-blue-700 transition-all font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-100">
                                {editingRule ? 'Update Authorized Rule' : 'Commit Rule to Registry'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Rules</p>
                            <p className="text-2xl font-black text-gray-900 mt-1">{rules.length}</p>
                        </div>
                        <Shield className="w-8 h-8 text-blue-500 opacity-20" />
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Functional Scopes</p>
                            <p className="text-2xl font-black text-gray-900 mt-1">
                                {new Set(rules.map(r => r.functionalScope?.name)).size}
                            </p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-green-500 opacity-20" />
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Categories</p>
                            <p className="text-2xl font-black text-gray-900 mt-1">
                                {new Set(rules.map(r => r.decisionType?.category)).size}
                            </p>
                        </div>
                        <AlertTriangle className="w-8 h-8 text-yellow-500 opacity-20" />
                    </div>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">Authority Line</th>
                            <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">Decision Nature</th>
                            <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">Scope</th>
                            <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-500 uppercase tracking-widest">Authority Limit</th>
                            <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {rules.map((rule) => {
                            const designation = designations.find(d => d.id === rule.authorityBodyId);
                            const maxLimit = rule.limitMax ? Number(rule.limitMax) : null;
                            const minLimit = rule.limitMin ? Number(rule.limitMin) : 0;

                            return (
                                <tr key={rule.id || Math.random()} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="text-sm font-bold text-gray-900">
                                                {designation?.title || rule.authorityBodyType || 'UNSPECIFIED'}
                                            </div>
                                            <span className="ml-2 px-1.5 py-0.5 bg-blue-50 text-[10px] font-bold text-blue-600 rounded">
                                                RANK {designation?.rank ?? '-'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 font-medium">{rule.decisionType?.name || 'Unknown Type'}</div>
                                        <div className="text-[10px] text-gray-400 uppercase font-bold">{rule.decisionType?.category || 'N/A'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            {rule.functionalScope?.name || 'General'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="text-sm font-black text-gray-900">
                                            {maxLimit !== null ? `${rule.currency || 'INR'} ${new Intl.NumberFormat('en-IN').format(maxLimit)}` : 'Unlimited'}
                                        </div>
                                        <div className="text-[10px] text-gray-400 italic">
                                            Floor: {rule.currency || 'INR'} {new Intl.NumberFormat('en-IN').format(minLimit)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEdit(rule)}
                                                className="p-1.5 text-gray-400 hover:text-iob-blue hover:bg-blue-50 rounded-md transition-colors"
                                            >
                                                <Activity className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(rule.id)}
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                            >
                                                <Shield className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {rules.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                    <Scale className="w-12 h-12 mx-auto mb-4 opacity-10" />
                                    <p className="text-sm">No Authority Rules indexed in the registry.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
