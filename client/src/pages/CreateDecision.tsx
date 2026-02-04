import { useState, useEffect } from 'react';
import {
    ChevronRight,
    ChevronLeft,
    ShieldCheck,
    FileText,
    Database,
    IndianRupee,
    CheckCircle2,
    AlertCircle,
    ArrowLeft,
    Upload,
    Plus,
    UserCheck,
    Users
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';

interface AllowedContext {
    decisionTypeId: string;
    decisionTypeName: string;
    functionalScopeId: string;
    functionalScopeName: string;
    category: string;
}

interface DoAResolution {
    status: 'IDLE' | 'RESOLVING' | 'RESOLVED' | 'UNKNOWN';
    authorityName?: string;
    limitMax?: string;
}

export function CreateDecision() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isViewMode = !!id;
    const [step, setStep] = useState(1);
    const [allowedContexts, setAllowedContexts] = useState<AllowedContext[]>([]);
    const [units, setUnits] = useState<any[]>([]);
    const [offices, setOffices] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [formData, setFormData] = useState({
        decisionTypeId: '',
        functionalScopeId: '',
        deptContextId: 'dept-01',
        regionContextId: 'reg-01',
        amount: '',
        currency: 'INR',
        subject: '',
        justification: '',
        routingMode: 'INDIVIDUAL',
        targetCommitteeId: '',
        expectedImpact: '',
        gapAnalysis: '',
        correctiveAction: '',
        instrumentType: 'APPROVAL',
        reviewerId: '',
        approverId: ''
    });

    const [resolution, setResolution] = useState<DoAResolution>({ status: 'IDLE' });
    const [circulars, setCirculars] = useState<string[]>([]);
    const [newCircular, setNewCircular] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [contextsRes, unitsRes, officesRes] = await Promise.all([
                    fetch('/api/governance/allowed-contexts?postingId=mock-ro-posting'),
                    fetch('/api/admin/departments'),
                    fetch('/api/governance/offices')
                ]);

                if (officesRes.ok) setOffices(await officesRes.json());
                if (unitsRes.ok) setUnits(await unitsRes.json());

                if (contextsRes.ok) {
                    const data = await contextsRes.json();
                    if (data && data.length > 0) {
                        setAllowedContexts(data);
                        if (!isViewMode) {
                            setFormData(prev => ({
                                ...prev,
                                decisionTypeId: data[0].decisionTypeId,
                                functionalScopeId: data[0].functionalScopeId
                            }));
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to fetch data', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [isViewMode]);

    useEffect(() => {
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            setResolution({ status: 'IDLE' });
            return;
        }
        setResolution({ status: 'RESOLVING' });
        const timer = setTimeout(() => {
            const amt = parseFloat(formData.amount);
            if (amt > 50000000) setResolution({ status: 'RESOLVED', authorityName: 'CAC-I (Board Committee)', limitMax: 'Uncapped' });
            else if (amt > 10000000) setResolution({ status: 'RESOLVED', authorityName: 'GM (Credit Approval)', limitMax: '5.00 Cr' });
            else setResolution({ status: 'RESOLVED', authorityName: 'DGM (Regional Head)', limitMax: '1.00 Cr' });
        }, 600);
        return () => clearTimeout(timer);
    }, [formData.amount]);

    const steps = [
        { id: 1, name: 'Classification', icon: ShieldCheck },
        { id: 2, name: 'Context', icon: IndianRupee },
        { id: 3, name: 'Governance', icon: UserCheck },
        { id: 4, name: 'Proposal', icon: FileText },
        { id: 5, name: 'Evidence', icon: Upload }
    ];

    const nextStep = () => setStep(s => Math.min(s + 1, 5));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const payload = {
                initiatorPostingId: 'mock-ro-posting',
                deptContextId: formData.deptContextId,
                regionContextId: formData.regionContextId,
                decisionTypeId: formData.decisionTypeId,
                functionalScopeId: formData.functionalScopeId,
                data: {
                    ...formData,
                    amount: parseFloat(formData.amount) || 0,
                    circulars,
                    status: 'PENDING_APPROVAL'
                }
            };
            const response = await fetch('/api/decisions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (response.ok) navigate('/');
        } catch (error) {
            console.error('Submission failed', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link to="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 italic">Initiate Proposal</h1>
                        <p className="text-gray-500 text-sm">Drafting a high-trust administrative note</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    {steps.map((s) => (
                        <div key={s.id} className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                                ${step === s.id ? 'bg-iob-blue text-white shadow-lg ring-4 ring-iob-blue/20' : step > s.id ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                {step > s.id ? <CheckCircle2 className="w-4 h-4" /> : s.id}
                            </div>
                            {s.id < 5 && <div className={`w-6 h-0.5 ${step > s.id ? 'bg-green-500' : 'bg-gray-200'}`} />}
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 iob-card min-h-[500px] flex flex-col">
                    <div className="flex-1 relative">
                        {step === 1 && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <h3 className="text-lg font-bold text-gray-900 border-l-4 border-iob-blue pl-3">Proposal Classification</h3>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Decision Type</label>
                                        <select className="w-full p-3 bg-gray-50 border border-gray-100 rounded-lg text-sm"
                                            value={formData.decisionTypeId} onChange={e => setFormData({ ...formData, decisionTypeId: e.target.value })}>
                                            {allowedContexts.map(ctx => <option key={ctx.decisionTypeId} value={ctx.decisionTypeId}>{ctx.decisionTypeName}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Decision Type</label>
                                        <select className="w-full p-3 bg-gray-50 border border-gray-100 rounded-lg text-sm"
                                            value={formData.decisionTypeId} onChange={e => setFormData({ ...formData, decisionTypeId: e.target.value, functionalScopeId: '' })}>
                                            {Array.from(new Set(allowedContexts.map(c => c.decisionTypeId)))
                                                .map(id => allowedContexts.find(c => c.decisionTypeId === id))
                                                .map(ctx => <option key={ctx?.decisionTypeId} value={ctx?.decisionTypeId}>{ctx?.decisionTypeName}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Functional Scope</label>
                                        <select className="w-full p-3 bg-gray-50 border border-gray-100 rounded-lg text-sm"
                                            value={formData.functionalScopeId} onChange={e => setFormData({ ...formData, functionalScopeId: e.target.value })}>
                                            <option value="">Select Scope</option>
                                            {allowedContexts
                                                .filter(ctx => ctx.decisionTypeId === formData.decisionTypeId)
                                                .map(ctx => <option key={ctx.functionalScopeId} value={ctx.functionalScopeId}>{ctx.functionalScopeName}</option>)}
                                        </select>
                                    </div>
                                    <div className="pt-4 border-t border-gray-100">
                                        <label className="text-[10px] font-bold text-iob-blue uppercase tracking-widest">Instrument Category</label>
                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                            {[
                                                { id: 'APPROVAL', label: 'Note for Approval', desc: 'Administrative sanction' },
                                                { id: 'RATIFICATION', label: 'Ratification', desc: 'Ex-post facto confirmation' },
                                                { id: 'SANCTION', label: 'Sanction Order', desc: 'Final executive instrument' },
                                                { id: 'CIRCULAR', label: 'Policy Circular', desc: 'Instruction for units' }
                                            ].map(type => (
                                                <button key={type.id} onClick={() => setFormData({ ...formData, instrumentType: type.id })}
                                                    className={`p-3 text-left rounded-xl border transition-all ${formData.instrumentType === type.id ? 'border-iob-blue bg-iob-blue/5 ring-1 ring-iob-blue' : 'border-gray-100 hover:border-gray-200'}`}>
                                                    <p className="text-xs font-bold text-gray-900">{type.label}</p>
                                                    <p className="text-[10px] text-gray-500 mt-0.5">{type.desc}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <h3 className="text-lg font-bold text-gray-900 border-l-4 border-iob-blue pl-3">Context & Financials</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Department</label>
                                        <select className="w-full p-3 bg-gray-50 border border-gray-100 rounded-lg text-sm"
                                            value={formData.deptContextId} onChange={e => setFormData({ ...formData, deptContextId: e.target.value })}>
                                            {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Region/Zone</label>
                                        <select className="w-full p-3 bg-gray-50 border border-gray-100 rounded-lg text-sm"
                                            value={formData.regionContextId} onChange={e => setFormData({ ...formData, regionContextId: e.target.value })}>
                                            {units.filter(u => u.subType === 'RO' || u.subType === 'ZO' || u.subType === 'CO').map(u => (
                                                <option key={u.id} value={u.id}>
                                                    {u.subType === 'RO' && !u.name.startsWith('Regional Office')
                                                        ? `Regional Office - ${u.name}`
                                                        : u.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Exposure Amount (INR)</label>
                                    <div className="relative">
                                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input type="number" className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-lg text-lg font-bold text-iob-blue focus:ring-2 focus:ring-iob-blue outline-none"
                                            placeholder="Enter amount..." value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <h3 className="text-lg font-bold text-gray-900 border-l-4 border-iob-blue pl-3">Stakeholder Governance</h3>
                                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex items-start space-x-3 mb-4">
                                    <UserCheck className="w-5 h-5 text-amber-600 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Accountability Matrix</p>
                                        <p className="text-[11px] text-amber-700 mt-0.5">Select the stakeholders for the official Management Instrument.</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reviewing Authority</label>
                                        <select className="w-full p-3 bg-gray-50 border border-gray-100 rounded-lg text-sm"
                                            value={formData.reviewerId} onChange={e => setFormData({ ...formData, reviewerId: e.target.value })}>
                                            <option value="">Select Reviewing Office</option>
                                            {offices.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Approving Authority</label>
                                        <select className="w-full p-3 bg-gray-50 border border-gray-100 rounded-lg text-sm font-bold text-iob-blue"
                                            value={formData.approverId} onChange={e => setFormData({ ...formData, approverId: e.target.value })}>
                                            <option value="">Select Sanctioning Office</option>
                                            {offices.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <h3 className="text-lg font-bold text-gray-900 border-l-4 border-iob-blue pl-3">Justification & Quality Tests</h3>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Subject Line</label>
                                        <input className="w-full p-3 bg-gray-50 rounded-lg text-sm" placeholder="Subject..."
                                            value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Proposal Body</label>
                                        <textarea className="w-full p-4 bg-gray-50 rounded-lg text-sm min-h-[120px] outline-none"
                                            placeholder="Rationale..." value={formData.justification} onChange={e => setFormData({ ...formData, justification: e.target.value })} />
                                    </div>
                                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-3">
                                        <h4 className="text-[10px] font-bold text-blue-800 uppercase tracking-widest flex items-center">
                                            <ShieldCheck className="w-4 h-4 mr-2" />
                                            Instrument Quality Tests
                                        </h4>
                                        <div className="space-y-2">
                                            <input className="w-full p-2.5 bg-white border border-blue-100 rounded text-xs"
                                                placeholder="Expected Impact..." value={formData.expectedImpact} onChange={e => setFormData({ ...formData, expectedImpact: e.target.value })} />
                                            <input className="w-full p-2.5 bg-white border border-blue-100 rounded text-xs"
                                                placeholder="Variance Analysis..." value={formData.gapAnalysis} onChange={e => setFormData({ ...formData, gapAnalysis: e.target.value })} />
                                            <input className="w-full p-2.5 bg-white border border-red-100 rounded text-xs font-bold text-red-700"
                                                placeholder="Mandated Corrective Action..." value={formData.correctiveAction} onChange={e => setFormData({ ...formData, correctiveAction: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 5 && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <h3 className="text-lg font-bold text-gray-900 border-l-4 border-iob-blue pl-3">Evidence & Traceability</h3>
                                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center space-y-2">
                                    <Upload className="w-10 h-10 text-gray-300 mx-auto" />
                                    <p className="text-xs font-bold text-gray-900">Upload Attachments</p>
                                    <button className="text-[10px] font-bold text-iob-blue uppercase tracking-widest bg-iob-blue/5 px-3 py-1.5 rounded">Browse</button>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Guideline Markers</label>
                                    <div className="flex space-x-2">
                                        <input className="flex-1 p-2 bg-gray-50 border rounded text-xs" placeholder="Circular Ref..."
                                            value={newCircular} onChange={e => setNewCircular(e.target.value)} onKeyPress={e => e.key === 'Enter' && (setCirculars([...circulars, newCircular]), setNewCircular(''))} />
                                        <button onClick={() => { setCirculars([...circulars, newCircular]); setNewCircular('') }} className="p-2 bg-iob-blue text-white rounded"><Plus className="w-4 h-4" /></button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {circulars.map((c, i) => (
                                            <div key={i} className="flex items-center bg-gray-100 px-2 py-1 rounded text-[10px] font-medium text-gray-700">
                                                {c} <button onClick={() => setCirculars(circulars.filter((_, idx) => idx !== i))} className="ml-1.5 text-gray-400 hover:text-red-500">×</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-auto pt-6 border-t flex justify-between">
                        <button onClick={prevStep} disabled={step === 1 || isSubmitting} className={`flex items-center text-[10px] font-bold uppercase tracking-widest ${step === 1 ? 'text-gray-300' : 'text-gray-500 hover:text-iob-blue'}`}>
                            <ChevronLeft className="w-4 h-4 mr-1" /> Back
                        </button>
                        <button onClick={step === 5 ? handleSubmit : nextStep} disabled={isSubmitting} className="iob-btn-primary flex items-center px-8">
                            {isSubmitting ? 'Submitting...' : step === 5 ? 'Submit for Sanction' : 'Continue'}
                            {!isSubmitting && <ChevronRight className="w-4 h-4 ml-1" />}
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className={`iob-card border-l-4 transition-all ${resolution.status === 'RESOLVED' ? 'border-green-500' : 'border-gray-200 opacity-60'}`}>
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                            <Database className="w-3.5 h-3.5 mr-2" /> Live Authority
                        </h4>
                        {resolution.status === 'RESOLVED' && (
                            <div className="space-y-3">
                                <div className="bg-green-50 p-2.5 rounded border border-green-100">
                                    <p className="text-[10px] text-green-800 font-bold uppercase">Sanctioning Power</p>
                                    <p className="text-sm font-bold text-green-900">{resolution.authorityName}</p>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">DoA Limit</span>
                                    <span className="font-bold text-gray-900">{resolution.limitMax}</span>
                                </div>
                            </div>
                        )}
                        {resolution.status === 'IDLE' && <p className="text-center py-4 text-[10px] text-gray-400 italic">Enter amount to resolve DoA</p>}
                        {resolution.status === 'RESOLVING' && <div className="h-4 bg-gray-100 animate-pulse rounded w-full"></div>}
                    </div>

                    <div className="iob-card">
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Governance Status</h4>
                        <div className="space-y-2">
                            <div className="flex items-center text-[10px] text-gray-600">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2" />
                                <span>Instrument Mandate: ACTIVE</span>
                            </div>
                            <div className="flex items-center text-[10px] text-gray-600">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2" />
                                <span>Policy Tier: CORPORATE</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
