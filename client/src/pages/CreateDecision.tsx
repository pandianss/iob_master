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
    const [isLoading, setIsLoading] = useState(true);

    const [formData, setFormData] = useState({
        decisionTypeId: '',
        functionalScopeId: '',
        deptContextId: 'dept-01',
        regionContextId: 'reg-01',
        amount: '',
        currency: 'INR',
        justification: '',
        routingMode: 'INDIVIDUAL', // INDIVIDUAL | COMMITTEE
        targetCommitteeId: ''
    });

    const [resolution, setResolution] = useState<DoAResolution>({ status: 'IDLE' });
    const [circulars, setCirculars] = useState<string[]>([]);
    const [newCircular, setNewCircular] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch existing decision if ID is present
    useEffect(() => {
        if (!id) return;

        const fetchDecision = async () => {
            try {
                // Mock fetching decision - replace with actual API call
                // const response = await fetch(`/api/decisions/${id}`);
                // const data = await response.json();

                // Simulating data fetch for now as backend might not support GET /:id yet
                // In real implementation this would fetch from API
                console.log('Fetching decision', id);
            } catch (error) {
                console.error('Failed to fetch decision', error);
            }
        };
        fetchDecision();
    }, [id]);

    // Fetch allowed contexts based on mock posting (Regional Office user)
    useEffect(() => {
        const fetchContexts = async () => {
            const fallbacks: AllowedContext[] = [
                { decisionTypeId: 'hv-dd', decisionTypeName: 'High Value DD Approval', functionalScopeId: 'dom-ops', functionalScopeName: 'Domestic Operations', category: 'ADMIN' },
                { decisionTypeId: 'csr-rec', decisionTypeName: 'CSR Recommendation', functionalScopeId: 'csr-scope', functionalScopeName: 'CSR & Sustainability', category: 'ADMIN' },
                { decisionTypeId: 'expense', decisionTypeName: 'General Expenses', functionalScopeId: 'dom-ops', functionalScopeName: 'Domestic Operations', category: 'ADMIN' },
                { decisionTypeId: 'ar9', decisionTypeName: 'AR9 - Asset Recovery', functionalScopeId: 'dom-ops', functionalScopeName: 'Domestic Operations', category: 'CREDIT' },
            ];

            try {
                // In a real app, postingId would come from user session
                // We mock it for a Regional Office (RO) context
                const response = await fetch('/api/governance/allowed-contexts?postingId=mock-ro-posting');
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.length > 0) {
                        setAllowedContexts(data);
                        // Only set default if NOT in view mode
                        if (!isViewMode) {
                            setFormData(prev => ({
                                ...prev,
                                decisionTypeId: data[0].decisionTypeId,
                                functionalScopeId: data[0].functionalScopeId
                            }));
                        }
                        setIsLoading(false);
                        return;
                    }
                }
            } catch (error) {
                console.error('Failed to fetch contexts, falling back to mock data', error);
            }

            // Fallback for demo stability
            setAllowedContexts(fallbacks);
            if (!isViewMode) {
                setFormData(prev => ({
                    ...prev,
                    decisionTypeId: fallbacks[0].decisionTypeId,
                    functionalScopeId: fallbacks[0].functionalScopeId
                }));
            }
            setIsLoading(false);
        };

        fetchContexts();
    }, [isViewMode]);

    // Simulate Live DoA Resolution
    useEffect(() => {
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            setResolution({ status: 'IDLE' });
            return;
        }

        setResolution({ status: 'RESOLVING' });

        const timer = setTimeout(() => {
            const amt = parseFloat(formData.amount);

            if (formData.routingMode === 'COMMITTEE') {
                let commName = 'Committee';
                if (amt > 50000000) commName = 'Board Level Committee (CAC-I)';
                else if (amt > 10000000) commName = 'Credit Approval Committee (CAC-II)';
                else commName = 'Regional Committee (RCC)';

                setResolution({ status: 'RESOLVED', authorityName: commName, limitMax: 'Uncapped (Quorum Based)' });
            } else {
                if (amt > 50000000) { // > 5 Cr
                    setResolution({ status: 'RESOLVED', authorityName: 'CAC-I (Board Level Committee)', limitMax: 'Uncapped' });
                } else if (amt > 10000000) { // > 1 Cr
                    setResolution({ status: 'RESOLVED', authorityName: 'GM (Credit Approval)', limitMax: '5.00 Cr' });
                } else {
                    setResolution({ status: 'RESOLVED', authorityName: 'DGM (Regional Head)', limitMax: '1.00 Cr' });
                }
            }
        }, 600);

        return () => clearTimeout(timer);
    }, [formData.amount, formData.decisionTypeId, formData.routingMode]);

    // Template Injection Effect
    useEffect(() => {
        if (!isViewMode && formData.decisionTypeId === 'expense' && !formData.justification) {
            import('../templates/officeNoteTemplate').then(({ OFFICE_NOTE_TEMPLATE }) => {
                setFormData(prev => ({
                    ...prev,
                    justification: OFFICE_NOTE_TEMPLATE
                }));
            });
        }
    }, [formData.decisionTypeId, isViewMode]);

    const steps = [
        { id: 1, name: 'Classification', icon: ShieldCheck },
        { id: 2, name: 'Context & Financials', icon: IndianRupee },
        { id: 3, name: 'Justification & Note', icon: FileText },
        { id: 4, name: 'Evidence & Attachments', icon: Upload }
    ];

    const nextStep = () => setStep(s => Math.min(s + 1, 4));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const addCircular = () => {
        if (newCircular.trim()) {
            setCirculars([...circulars, newCircular.trim()]);
            setNewCircular('');
        }
    };

    const removeCircular = (index: number) => {
        setCirculars(circulars.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const payload = {
                initiatorPostingId: 'mock-ro-posting', // In real app, from auth session
                deptContextId: formData.deptContextId,
                regionContextId: formData.regionContextId,
                decisionTypeId: formData.decisionTypeId,
                functionalScopeId: formData.functionalScopeId,
                data: {
                    amount: parseFloat(formData.amount) || 0,
                    justification: formData.justification,
                    circulars: circulars,
                    status: 'PENDING_APPROVAL',
                    routingMode: formData.routingMode,
                    targetCommittee: formData.routingMode === 'COMMITTEE' ? resolution.authorityName : undefined
                }
            };

            const response = await fetch('/api/decisions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                navigate('/');
            } else {
                console.error('Submission failed');
                alert('Submission failed. Please check your network or try again.');
            }
        } catch (error) {
            console.error('Error during submission', error);
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
                        <h1 className="text-2xl font-bold text-gray-900 italic" style={{ fontFamily: 'var(--font-primary)' }}>
                            {isViewMode ? 'View Proposal' : 'Initiate New Proposal'}
                        </h1>
                        <p className="text-gray-500 text-sm">
                            {isViewMode ? `Reference ID: ${id}` : 'Drafting a high-trust administrative or financial note'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    {steps.map((s) => (
                        <div key={s.id} className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                                ${step === s.id ? 'bg-iob-blue text-white shadow-lg ring-4 ring-iob-blue/20' : step > s.id ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                {step > s.id ? <CheckCircle2 className="w-4 h-4" /> : s.id}
                            </div>
                            {s.id < 4 && <div className={`w-8 h-0.5 ${step > s.id ? 'bg-green-500' : 'bg-gray-200'}`} />}
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 iob-card min-h-[400px] flex flex-col">
                    <div className="flex-1">
                        {step === 1 && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-gray-900 border-l-4 border-iob-blue pl-3">Proposal Classification</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Decision Type</label>
                                        <select
                                            className="w-full p-3 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-iob-blue outline-none transition-all"
                                            value={formData.decisionTypeId}
                                            onChange={(e) => setFormData({ ...formData, decisionTypeId: e.target.value })}
                                        >
                                            {Array.from(new Set(allowedContexts.map(c => c.decisionTypeId))).map(id => {
                                                const context = allowedContexts.find(c => c.decisionTypeId === id);
                                                return <option key={id} value={id}>{context?.decisionTypeName}</option>;
                                            })}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Functional Scope</label>
                                        <select
                                            className="w-full p-3 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-iob-blue outline-none transition-all"
                                            value={formData.functionalScopeId}
                                            onChange={(e) => setFormData({ ...formData, functionalScopeId: e.target.value })}
                                        >
                                            {allowedContexts
                                                .filter(c => c.decisionTypeId === formData.decisionTypeId)
                                                .map(c => (
                                                    <option key={c.functionalScopeId} value={c.functionalScopeId}>
                                                        {c.functionalScopeName}
                                                    </option>
                                                ))
                                            }
                                        </select>
                                    </div>

                                    <div className="space-y-1.5 pt-4 border-t">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Approval Route</label>
                                        <div className="flex space-x-4">
                                            <button
                                                onClick={() => setFormData({ ...formData, routingMode: 'INDIVIDUAL' })}
                                                className={`flex-1 p-3 rounded-lg border text-sm font-medium transition-all flex items-center justify-center
                                                ${formData.routingMode === 'INDIVIDUAL' ? 'bg-iob-blue text-white border-iob-blue' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                                            >
                                                <UserCheck className="w-4 h-4 mr-2" />
                                                Individual Authority
                                            </button>
                                            <button
                                                onClick={() => setFormData({ ...formData, routingMode: 'COMMITTEE' })}
                                                className={`flex-1 p-3 rounded-lg border text-sm font-medium transition-all flex items-center justify-center
                                                ${formData.routingMode === 'COMMITTEE' ? 'bg-iob-blue text-white border-iob-blue' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                                            >
                                                <Users className="w-4 h-4 mr-2" />
                                                Committee
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {isLoading && (
                            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-xl backdrop-blur-sm">
                                <div className="text-center space-y-3">
                                    <div className="w-10 h-10 border-4 border-iob-blue border-t-transparent rounded-full animate-spin mx-auto"></div>
                                    <p className="text-xs font-bold text-iob-blue uppercase tracking-widest">Resolving Unit Context...</p>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-gray-900 border-l-4 border-iob-blue pl-3">Context & Financials</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Department</label>
                                        <select className="w-full p-3 bg-gray-50 border border-gray-100 rounded-lg text-sm">
                                            <option>Credit Department</option>
                                            <option>General Administration</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Region/Zone</label>
                                        <select className="w-full p-3 bg-gray-50 border border-gray-100 rounded-lg text-sm">
                                            <option>Regional Office, Chennai</option>
                                            <option>Zonal Office, Delhi</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Exposure Amount (INR)</label>
                                    <div className="relative">
                                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="number"
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-lg font-bold text-iob-blue focus:ring-2 focus:ring-iob-blue outline-none transition-all"
                                            placeholder="Enter amount in figures..."
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-500 italic">Live DoA resolution will be triggered as you type.</p>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-gray-900 border-l-4 border-iob-blue pl-3">Justification & Proposal Note</h3>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Subject Line</label>
                                    <input className="w-full p-3 bg-gray-50 border border-gray-100 rounded-lg text-sm mb-4" placeholder="Brief summary of the request..." />

                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Detailed Proposal</label>
                                    <textarea
                                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-lg text-sm min-h-[200px] outline-none focus:ring-2 focus:ring-iob-blue"
                                        placeholder="Outline the background, rationale, and recommended action..."
                                        value={formData.justification}
                                        onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-gray-900 border-l-4 border-iob-blue pl-3">Evidence & Attachments</h3>
                                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center space-y-4 hover:border-iob-blue/30 transition-colors">
                                    <Upload className="w-12 h-12 text-gray-300 mx-auto" />
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Drag & drop files here</p>
                                        <p className="text-xs text-gray-500">Supported: PDF, DOCX, XLSX (Max 10MB per file)</p>
                                    </div>
                                    <button className="text-xs font-bold text-iob-blue uppercase tracking-widest bg-iob-blue/5 px-4 py-2 rounded-lg hover:bg-iob-blue/10 transition-all">
                                        Browse Files
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Linked Circulars</label>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            className="flex-1 p-2 bg-gray-50 border border-gray-100 rounded text-xs focus:ring-1 focus:ring-iob-blue outline-none"
                                            placeholder="Circular Reference Number (e.g. HO/CREDIT/102/2025)..."
                                            value={newCircular}
                                            onChange={(e) => setNewCircular(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && addCircular()}
                                        />
                                        <button
                                            onClick={addCircular}
                                            className="p-2 bg-iob-blue text-white rounded hover:bg-iob-blue-dark transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {circulars.map((c, i) => (
                                            <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100 group animate-in slide-in-from-left-2">
                                                <div className="flex items-center space-x-2 overflow-hidden">
                                                    <FileText className="w-3.5 h-3.5 text-iob-blue flex-shrink-0" />
                                                    <span className="text-xs text-gray-700 truncate">{c}</span>
                                                </div>
                                                <button
                                                    onClick={() => removeCircular(i)}
                                                    className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <Plus className="w-3.5 h-3.5 rotate-45" />
                                                </button>
                                            </div>
                                        ))}
                                        {circulars.length === 0 && (
                                            <p className="text-[10px] text-gray-400 italic text-center py-2">No circulars added yet.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 pt-6 border-t flex justify-between">
                        <button
                            onClick={prevStep}
                            disabled={step === 1 || isSubmitting}
                            className={`flex items-center text-xs font-bold uppercase tracking-widest transition-colors ${step === 1 ? 'text-gray-300' : 'text-gray-500 hover:text-iob-blue'}`}
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Back
                        </button>
                        <button
                            onClick={step === 4 ? handleSubmit : nextStep}
                            disabled={isSubmitting}
                            className={`iob-btn-primary flex items-center px-8 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center">
                                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Submitting...
                                </span>
                            ) : (
                                <>
                                    {step === 4 ? 'Submit for Sanction' : 'Save & Continue'}
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Live DoA Panel */}
                <div className="space-y-4">
                    <div className={`iob-card border-l-4 transition-all duration-500
                        ${resolution.status === 'RESOLVED' ? 'border-green-500 shadow-xl' : resolution.status === 'RESOLVING' ? 'border-amber-500 animate-pulse' : 'border-gray-200 opacity-60'}`}>
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                            <Database className="w-3.5 h-3.5 mr-2" />
                            Live Authority Resolution
                        </h4>

                        {resolution.status === 'IDLE' && (
                            <div className="text-center py-6 opacity-40">
                                <ShieldCheck className="w-10 h-10 mx-auto mb-2" />
                                <p className="text-xs font-medium">Input exposure amount to resolve authority</p>
                            </div>
                        )}

                        {resolution.status === 'RESOLVING' && (
                            <div className="space-y-3">
                                <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                            </div>
                        )}

                        {resolution.status === 'RESOLVED' && (
                            <div className="space-y-4">
                                <div className="bg-green-50 p-3 rounded-lg flex items-start">
                                    <CheckCircle2 className="w-4 h-4 text-green-600 mr-2 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-green-800 font-bold uppercase tracking-wide">Target Authority Found</p>
                                        <p className="text-sm font-bold text-green-900 mt-1">{resolution.authorityName}</p>
                                    </div>
                                </div>
                                <div className="space-y-2 px-1">
                                    <div className="flex justify-between text-xs font-medium">
                                        <span className="text-gray-500">DoA Limit (Max)</span>
                                        <span className="text-gray-900">{resolution.limitMax}</span>
                                    </div>
                                    <div className="flex justify-between text-xs font-medium">
                                        <span className="text-gray-500">Workflow Path</span>
                                        <span className="text-gray-900">
                                            {formData.routingMode === 'COMMITTEE' ? 'Committee Agenda' : 'Standard Approval'}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-2 bg-iob-blue/5 border border-iob-blue/10 p-2.5 rounded-lg">
                                    <p className="text-[10px] text-iob-blue leading-relaxed">
                                        <AlertCircle className="w-3 h-3 inline mr-1 -mt-0.5" />
                                        {formData.routingMode === 'COMMITTEE'
                                            ? `Proposal will be added to the agenda of the next ${resolution.authorityName} meeting.`
                                            : `This proposal will follow the 4-tier validation framework before reaching ${resolution.authorityName}.`
                                        }
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="iob-card group">
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Policy Checklist</h4>
                        <div className="space-y-2">
                            {[
                                'Credit Policy 2025-26 compliance',
                                'Exposure norms checked',
                                'Due diligence reports attached'
                            ].map((text, i) => (
                                <div key={i} className="flex items-center space-x-2 text-xs text-gray-600 group-hover:text-gray-900">
                                    <div className="w-1.5 h-1.5 rounded-full bg-iob-blue/30" />
                                    <span>{text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
