import { useState, useEffect } from 'react';
import {
    Link2,
    Settings2,
    Activity,
    ShieldCheck,
    AlertCircle,
    ArrowRight
} from 'lucide-react';

interface ParameterMapping {
    id: string;
    parameterId: string;
    parameter: { id: string; name: string; code: string };
    decisionTypeId?: string;
    decisionType?: { id: string; name: string };
    thresholdValue: string;
    operator: string;
    action: string;
    mappingType: 'DOA' | 'RISK' | 'PERFORMANCE';
    frequency: 'DAILY' | 'MONTHLY' | 'ON_DEMAND';
    targetUnitType: 'ALL' | 'BRANCH' | 'RO' | 'CO';
    status: 'ACTIVE' | 'PENDING';
}

export function ParameterMapping() {
    const [mappings, setMappings] = useState<ParameterMapping[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Dropdown data
    const [parameters, setParameters] = useState<any[]>([]);
    const [decisionTypes, setDecisionTypes] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        parameterId: '',
        decisionTypeId: '',
        thresholdValue: '',
        operator: '>',
        action: '',
        mappingType: 'DOA' as 'DOA' | 'RISK' | 'PERFORMANCE',
        frequency: 'ON_DEMAND' as 'DAILY' | 'MONTHLY' | 'ON_DEMAND',
        targetUnitType: 'ALL' as 'ALL' | 'BRANCH' | 'RO' | 'CO',
        status: 'ACTIVE'
    });

    const [activeHub, setActiveHub] = useState<'DOA' | 'RISK' | 'PERFORMANCE'>('DOA');

    const fetchMappings = () => {
        setLoading(true);
        fetch('/api/governance/mappings')
            .then(res => res.json())
            .then(data => {
                setMappings(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    const fetchHelpers = async () => {
        try {
            const [pRes, dtRes] = await Promise.all([
                fetch('/api/governance/parameters'),
                fetch('/api/governance/decision-types')
            ]);

            const pData = await pRes.json();
            const dtData = await dtRes.json();

            setParameters(Array.isArray(pData) ? pData : []);
            setDecisionTypes(Array.isArray(dtData) ? dtData : []);
        } catch (error) {
            console.error('Failed to fetch helpers:', error);
            setParameters([]);
            setDecisionTypes([]);
        }
    };

    useEffect(() => {
        fetchMappings();
        fetchHelpers();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingId
                ? `/api/governance/mappings/${editingId}`
                : '/api/governance/mappings';
            const method = editingId ? 'PUT' : 'POST';

            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            setShowForm(false);
            setEditingId(null);
            fetchMappings();
        } catch (error) {
            console.error('Failed to save mapping:', error);
        }
    };

    const handleEdit = (mapping: any) => {
        setEditingId(mapping.id);
        setFormData({
            parameterId: mapping.parameterId,
            decisionTypeId: mapping.decisionTypeId || '',
            thresholdValue: mapping.thresholdValue,
            operator: mapping.operator,
            action: mapping.action,
            mappingType: mapping.mappingType,
            frequency: mapping.frequency,
            targetUnitType: mapping.targetUnitType,
            status: mapping.status
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this mapping?')) return;
        try {
            await fetch(`/api/governance/mappings/${id}`, { method: 'DELETE' });
            fetchMappings();
        } catch (error) {
            console.error('Failed to delete mapping:', error);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center p-20 text-iob-blue animate-pulse">
            <Link2 className="w-8 h-8 mr-3" />
            <span className="font-bold tracking-widest uppercase">Initializing Mapping Logic...</span>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Governance Intelligence Hub</h1>
                    <p className="text-sm text-gray-500 mt-1">Strategic oversight engine for Risk, Performance, and Accountability</p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={() => {
                            setEditingId(null);
                            setFormData({
                                parameterId: '',
                                decisionTypeId: '',
                                thresholdValue: '',
                                operator: '>',
                                action: activeHub === 'RISK' ? 'TRIGGER_OP_RISK' : activeHub === 'PERFORMANCE' ? 'ISSUE_APPRECIATION' : '',
                                mappingType: activeHub,
                                frequency: activeHub === 'RISK' ? 'DAILY' : activeHub === 'PERFORMANCE' ? 'MONTHLY' : 'ON_DEMAND',
                                targetUnitType: activeHub === 'RISK' ? 'BRANCH' : 'ALL',
                                status: 'ACTIVE'
                            });
                            setShowForm(true);
                        }}
                        className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors font-bold text-sm shadow-sm"
                    >
                        <Settings2 className="w-4 h-4 mr-2" />
                        Configure Logic
                    </button>
                </div>
            </div>

            {/* Hub Switcher */}
            <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
                {[
                    { id: 'DOA', label: 'Authority Matrix', icon: ShieldCheck },
                    { id: 'RISK', label: 'Risk Scanners', icon: Activity },
                    { id: 'PERFORMANCE', label: 'Performance Engine', icon: Settings2 }
                ].map(hub => (
                    <button
                        key={hub.id}
                        onClick={() => setActiveHub(hub.id as any)}
                        className={`
                            flex items-center px-6 py-2 rounded-lg text-xs font-bold transition-all
                            ${activeHub === hub.id
                                ? 'bg-white text-iob-blue shadow-sm'
                                : 'text-gray-500 hover:text-gray-900'}
                        `}
                    >
                        <hub.icon className={`w-4 h-4 mr-2 ${activeHub === hub.id ? 'text-iob-blue' : 'text-gray-400'}`} />
                        {hub.label}
                    </button>
                ))}
            </div>

            {showForm && (
                <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black text-gray-900 tracking-tighter uppercase italic flex items-center">
                            <Link2 className="w-6 h-6 mr-2 text-iob-blue" />
                            {editingId ? 'Modify Logic Mapping' : 'Define New Strategy'}
                        </h3>
                        <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 font-bold text-xs uppercase tracking-widest">Cancel</button>
                    </div>
                    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Category / Hub</label>
                                <select
                                    className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg text-sm font-bold focus:ring-2 focus:ring-iob-blue outline-none"
                                    value={formData.mappingType}
                                    onChange={e => setFormData({ ...formData, mappingType: e.target.value as any })}
                                    required
                                >
                                    <option value="DOA">Authority Matrix (DoA)</option>
                                    <option value="RISK">Operational Risk Scanner</option>
                                    <option value="PERFORMANCE">Performance Engine</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Source KPI (Parameter)</label>
                                <select
                                    className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg text-sm font-bold focus:ring-2 focus:ring-iob-blue outline-none"
                                    value={formData.parameterId}
                                    onChange={e => setFormData({ ...formData, parameterId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Parameter</option>
                                    {parameters.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                                    ))}
                                </select>
                            </div>
                            {formData.mappingType === 'DOA' && (
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Affected Decision Type</label>
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
                            )}
                            {formData.mappingType !== 'DOA' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Check Frequency</label>
                                        <select
                                            className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg text-sm font-bold focus:ring-2 focus:ring-iob-blue outline-none"
                                            value={formData.frequency}
                                            onChange={e => setFormData({ ...formData, frequency: e.target.value as any })}
                                        >
                                            <option value="DAILY">Daily</option>
                                            <option value="WEEKLY">Weekly</option>
                                            <option value="MONTHLY">Monthly</option>
                                            <option value="ON_DEMAND">On Demand</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Target Units</label>
                                        <select
                                            className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg text-sm font-bold focus:ring-2 focus:ring-iob-blue outline-none"
                                            value={formData.targetUnitType}
                                            onChange={e => setFormData({ ...formData, targetUnitType: e.target.value as any })}
                                        >
                                            <option value="ALL">All Units</option>
                                            <option value="BRANCH">Branches Only</option>
                                            <option value="RO">Regional Offices</option>
                                            <option value="CO">Central Office</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Condition Operator</label>
                                    <select
                                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg text-sm font-bold focus:ring-2 focus:ring-iob-blue outline-none"
                                        value={formData.operator}
                                        onChange={e => setFormData({ ...formData, operator: e.target.value })}
                                    >
                                        <option value=">">Greater Than (&gt;)</option>
                                        <option value="<">Less Than (&lt;)</option>
                                        <option value="==">Equals (==)</option>
                                        <option value=">=">Greater or Equal (&gt;=)</option>
                                        <option value="<=">Less or Equal (&lt;=)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Threshold Value</label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg text-sm font-bold focus:ring-2 focus:ring-iob-blue outline-none"
                                        placeholder="e.g. 5.0%"
                                        value={formData.thresholdValue}
                                        onChange={e => setFormData({ ...formData, thresholdValue: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">System Action</label>
                                <select
                                    className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg text-sm font-bold focus:ring-2 focus:ring-iob-blue outline-none"
                                    value={formData.action}
                                    onChange={e => setFormData({ ...formData, action: e.target.value })}
                                    required
                                >
                                    <option value="">Select Action</option>
                                    {formData.mappingType === 'DOA' && (
                                        <>
                                            <option value="REDUCE_LIMIT_50">Reduce Authority Limit by 50%</option>
                                            <option value="REDUCE_LIMIT_100">Suspend Authority (100% Reduction)</option>
                                            <option value="MANDATORY_ESCALATION">Force Central Office Escalation</option>
                                        </>
                                    )}
                                    {formData.mappingType === 'RISK' && (
                                        <>
                                            <option value="TRIGGER_OP_RISK">Trigger Operational Risk Audit</option>
                                            <option value="FLAG_FOR_INSPECTION">Flag Unit for Spot Inspection</option>
                                            <option value="REDUCE_NON_CRITICAL_SANCTIONS">Restrict Special Expenditures</option>
                                        </>
                                    )}
                                    {formData.mappingType === 'PERFORMANCE' && (
                                        <>
                                            <option value="ISSUE_APPRECIATION">Generate Appreciation Letter (Achiever)</option>
                                            <option value="ISSUE_EXPLANATION">Generate Explanation Call (Underperformer)</option>
                                            <option value="EXCEPTIONAL_PERFORMANCE_AWARD">Nominate for Exceptional Award</option>
                                        </>
                                    )}
                                </select>
                            </div>
                        </div>
                        <div className="col-span-2 pt-4 flex justify-end">
                            <button type="submit" className="px-8 py-3 bg-iob-blue text-white rounded-lg hover:bg-blue-700 transition-all font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-100">
                                {editingId ? 'Update Mapping Logic' : 'Deploy Mapping Logic'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-brand-gradient p-6 rounded-2xl text-white shadow-lg overflow-hidden relative">
                <div className="relative z-10">
                    <div className="flex items-center space-x-2 mb-4">
                        <Activity className="w-5 h-5 text-white/80" />
                        <h2 className="text-sm font-bold uppercase tracking-widest">How Mapping Works</h2>
                    </div>
                    <p className="text-sm leading-relaxed opacity-90 max-w-2xl">
                        Parameter Mapping is the <strong>Intelligence Layer</strong> of IOBIAN.
                        It monitors live MIS data and automatically adjusts the <strong>Authority Matrix</strong> based on risk thresholds.
                    </p>
                </div>
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <ShieldCheck className="w-32 h-32" />
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Mapping Registry</span>
                    <span className="text-[10px] font-bold text-iob-blue bg-blue-50 px-2 py-0.5 rounded-full uppercase">{mappings.length} Rules Active</span>
                </div>
                <div className="divide-y divide-gray-100">
                    {mappings.filter(m => m.mappingType === activeHub).map((mapping: any) => (
                        <div key={mapping.id} className="p-6 hover:bg-gray-50 transition-all flex items-center justify-between group">
                            <div className="flex items-center space-x-8">
                                <div className="space-y-1 w-48">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Parameter</p>
                                    <div className="text-sm font-bold text-gray-900 flex items-center">
                                        <Activity className="w-4 h-4 mr-2 text-iob-blue" />
                                        {mapping.parameter?.name}
                                    </div>
                                </div>

                                <div className="flex items-center text-gray-300">
                                    <ArrowRight className="w-5 h-5" />
                                </div>

                                {activeHub === 'DOA' ? (
                                    <div className="space-y-1 w-48">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Authority Context</p>
                                        <div className="text-sm font-bold text-gray-900 flex items-center">
                                            <ShieldCheck className="w-4 h-4 mr-2 text-green-600" />
                                            {mapping.decisionType?.name}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-1 w-48">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Scan Scope</p>
                                        <div className="text-sm font-bold text-gray-900 flex items-center uppercase tracking-tighter">
                                            <ShieldCheck className="w-4 h-4 mr-2 text-iob-blue" />
                                            {mapping.frequency} / {mapping.targetUnitType}
                                        </div>
                                    </div>
                                )}

                                <div className="hidden lg:block space-y-1 px-8 border-l border-gray-100 italic">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest not-italic">Strategy Logic</p>
                                    <div className="text-sm font-medium text-gray-600">
                                        IF {mapping.parameter?.code} {mapping.operator} {mapping.thresholdValue} THEN <span className="text-iob-blue font-bold">{mapping.action}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <span className={`
                                    text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-tighter
                                    ${mapping.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}
                                `}>
                                    {mapping.status}
                                </span>
                                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleEdit(mapping)}
                                        className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all border border-transparent hover:border-gray-200"
                                    >
                                        <Settings2 className="w-4 h-4 text-gray-400 hover:text-iob-blue" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(mapping.id)}
                                        className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all border border-transparent hover:border-gray-200"
                                    >
                                        <AlertCircle className="w-4 h-4 text-gray-400 hover:text-red-600" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {mappings.length === 0 && (
                        <div className="p-12 text-center text-gray-400">
                            <Link2 className="w-12 h-12 mx-auto mb-4 opacity-10" />
                            <p className="text-sm uppercase font-bold tracking-widest">Strategic Logic Registry Empty</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
