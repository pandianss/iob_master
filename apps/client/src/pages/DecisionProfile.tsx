import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Shield,
    Clock,
    User,
    FileText,
    History,
    CheckCircle2,
    XCircle,
    Send,
    MessageSquare,
    ChevronRight,
    AlertCircle
} from 'lucide-react';

interface Decision {
    id: string;
    status: string;
    outcomeData: any;
    createdAt: string;
    initiatorPosting: {
        user: { name: string };
        designation: { title: string };
    };
    authRule?: {
        decisionType: { name: string };
        functionalScope: { name: string };
        authorityBodyType: string;
    };
    auditLogs: any[];
}

export function DecisionProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [decision, setDecision] = useState<Decision | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionNotes, setActionNotes] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        fetchDecision();
    }, [id]);

    const fetchDecision = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/decisions/${id}`);
            if (res.ok) {
                setDecision(await res.json());
            } else {
                navigate('/decisions');
            }
        } catch (error) {
            console.error('Failed to fetch decision profile', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action: string) => {
        if (!window.confirm(`Are you sure you want to ${action.toLowerCase()} this proposal?`)) return;

        setIsProcessing(true);
        try {
            const userStr = localStorage.getItem('user');
            const currentUser = userStr ? JSON.parse(userStr) : null;

            const res = await fetch(`/api/decisions/${id}/action`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    actorPostingId: currentUser?.activePosting?.id || 'mock-ro-posting',
                    action: action,
                    notes: actionNotes
                })
            });

            if (res.ok) {
                setActionNotes('');
                fetchDecision();
            }
        } catch (error) {
            console.error('Action failed', error);
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) return <div className="p-20 text-center animate-pulse text-iob-blue font-bold uppercase tracking-widest text-xs">Accessing Secure Instrument Profile...</div>;
    if (!decision) return null;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header / Breadcrumbs */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link to="/decisions" className="p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center">
                        <ArrowLeft className="w-5 h-5 text-gray-400" />
                    </Link>
                    <div>
                        <div className="flex items-center space-x-2">
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight italic">Coordination Zone Profile</h1>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border
                                ${decision.status === 'PENDING_APPROVAL' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                    decision.status === 'SANCTIONED' ? 'bg-green-600 text-white border-green-700' :
                                        decision.status === 'REJECTED' ? 'bg-red-100 text-red-800 border-red-200' :
                                            decision.status === 'QUERY_RAISED' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                                                'bg-gray-100 text-gray-800 border-gray-200'}`}>
                                {decision.status.replace('_', ' ')}
                            </span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5 uppercase tracking-widest">REF: {decision.id}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Proposal Details */}
                    <div className="iob-card shadow-xl ring-1 ring-black/5">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-50">
                            <h3 className="text-sm font-bold text-gray-900 flex items-center">
                                <FileText className="w-4 h-4 mr-2 text-iob-blue" />
                                Justification & Proposal Body
                            </h3>
                            <div className="text-[10px] text-gray-400 font-semibold italic">
                                Instituted on {new Date(decision.createdAt).toLocaleDateString()}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Subject Line</h4>
                                <div className="p-3 bg-gray-50/50 rounded-lg text-sm font-bold text-gray-800 border border-gray-100">
                                    {decision.outcomeData?.subject || 'NO SUBJECT PROVIDED'}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Detailed Rationale</h4>
                                <div className="p-4 bg-white border border-gray-100 rounded-xl text-sm leading-relaxed text-gray-700 min-h-[150px] whitespace-pre-wrap">
                                    {decision.outcomeData?.justification || 'No justification provided.'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Center - Only show for active decisions */}
                    {decision.status !== 'SANCTIONED' && decision.status !== 'REJECTED' && (
                        <div className="iob-card border-2 border-iob-blue/10 bg-blue-50/5 shadow-2xl">
                            <div className="flex items-center mb-6">
                                <Shield className="w-5 h-5 mr-3 text-iob-blue" />
                                <h3 className="text-base font-bold text-gray-900">Coordination Action Center</h3>
                            </div>

                            <div className="space-y-4">
                                {decision.status === 'QUERY_RAISED' && (
                                    <div className="p-3 bg-purple-50 border border-purple-100 rounded-lg flex items-start space-x-3 mb-4">
                                        <MessageSquare className="w-4 h-4 text-purple-600 mt-1" />
                                        <div className="text-xs text-purple-900">
                                            <p className="font-bold uppercase tracking-wider mb-1">Active Query from Regional Office</p>
                                            Please provide the requested information below to resume the sanctioning process.
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                                        {decision.status === 'QUERY_RAISED' ? 'Response to Query' : 'Observation / Notes'}
                                    </label>
                                    <textarea
                                        className="w-full p-4 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-iob-blue/10 outline-none transition-all"
                                        placeholder={decision.status === 'QUERY_RAISED' ? 'Enter your response here...' : 'Provide specific notes regarding your decision...'}
                                        rows={3}
                                        value={actionNotes}
                                        onChange={e => setActionNotes(e.target.value)}
                                    />
                                </div>

                                <div className="flex items-center space-x-3 pt-2">
                                    {decision.status === 'PENDING_APPROVAL' && (
                                        <>
                                            <button
                                                onClick={() => handleAction('SANCTION')}
                                                disabled={isProcessing}
                                                className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-green-700 transition-all flex items-center justify-center disabled:opacity-50"
                                            >
                                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                                ENTER RESOLUTION (SANCTION)
                                            </button>
                                            <button
                                                onClick={() => handleAction('QUERY')}
                                                disabled={isProcessing}
                                                className="px-6 bg-purple-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-purple-700 transition-all flex items-center justify-center disabled:opacity-50"
                                            >
                                                <MessageSquare className="w-4 h-4 mr-2" />
                                                RAISE QUERY
                                            </button>
                                            <button
                                                onClick={() => handleAction('REJECT')}
                                                disabled={isProcessing}
                                                className="px-6 bg-white text-red-600 border border-red-100 py-3 rounded-xl font-bold text-sm hover:bg-red-50 transition-all flex items-center justify-center disabled:opacity-50"
                                            >
                                                <XCircle className="w-4 h-4 mr-2" />
                                                REJECT
                                            </button>
                                        </>
                                    )}

                                    {decision.status === 'QUERY_RAISED' && (
                                        <button
                                            onClick={() => handleAction('RESPOND')}
                                            disabled={isProcessing || !actionNotes}
                                            className="flex-1 bg-iob-blue text-white py-4 rounded-xl font-bold text-sm shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center disabled:opacity-50"
                                        >
                                            <Send className="w-4 h-4 mr-2" />
                                            SUBMIT RESPONSE TO RO
                                        </button>
                                    )}
                                </div>
                                <p className="text-[10px] text-gray-400 italic text-center">
                                    All workflow transitions are immutable and recorded in the audit ledger.
                                </p>
                            </div>
                        </div>
                    )}

                    {decision.status === 'SANCTIONED' && (
                        <div className="iob-card bg-green-50 border-2 border-green-500/20 shadow-xl overflow-hidden relative">
                            <div className="absolute right-[-20px] top-[-20px] text-green-500/10 rotate-12">
                                <CheckCircle2 className="w-24 h-24" />
                            </div>
                            <div className="flex items-center space-x-3 mb-2">
                                <div className="p-2 bg-green-500 rounded-lg text-white">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold text-green-900">Resolution: SANCTIONED</h3>
                            </div>
                            <p className="text-xs text-green-800 line-clamp-3">
                                This proposal has received final executive sanction from the Regional Office. All terms and conditions defined in the abstract are now operative.
                            </p>
                        </div>
                    )}

                    {decision.status === 'REJECTED' && (
                        <div className="iob-card bg-red-50 border-2 border-red-500/20 shadow-xl overflow-hidden relative">
                            <div className="absolute right-[-20px] top-[-20px] text-red-500/10 rotate-12">
                                <XCircle className="w-24 h-24" />
                            </div>
                            <div className="flex items-center space-x-3 mb-2">
                                <div className="p-2 bg-red-500 rounded-lg text-white">
                                    <XCircle className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold text-red-900">Resolution: REJECTED</h3>
                            </div>
                            <p className="text-xs text-red-800">
                                This proposal has been declined for the reasons stated in the audit logs.
                            </p>
                        </div>
                    )}
                </div>

                {/* Sidebar Context */}
                <div className="space-y-6">
                    {/* Stewardship Section */}
                    <div className="iob-card">
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Stewardship</h4>
                        <div className="space-y-4">
                            <div className="flex items-start">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5">
                                    <User className="w-4 h-4 text-iob-blue" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Initiator</p>
                                    <p className="text-xs font-bold text-gray-900">{decision.initiatorPosting.user.name}</p>
                                    <p className="text-[9px] text-gray-500">{decision.initiatorPosting.designation.title}</p>
                                </div>
                            </div>

                            {decision.authRule && (
                                <div className="pt-4 border-t border-gray-50">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2 flex items-center">
                                        <Shield className="w-3 h-3 mr-1.5" />
                                        Authority Context
                                    </p>
                                    <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] text-gray-500">Body</span>
                                            <span className="text-[10px] font-bold text-gray-900 border border-gray-200 px-1.5 py-0.5 rounded bg-white">{decision.authRule.authorityBodyType}</span>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] text-gray-400 font-bold uppercase">Classification</p>
                                            <p className="text-[11px] font-medium text-gray-700 leading-tight">
                                                Coordination Note <ChevronRight className="w-2 h-2 inline" /> {decision.authRule.functionalScope.name}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Timeline / Audit Logs */}
                    <div className="iob-card">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Audit Trail</h4>
                            <History className="w-3.5 h-3.5 text-gray-300" />
                        </div>
                        <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                            {decision.auditLogs.map((log: any, idx: number) => (
                                <div key={log.id} className="relative pl-8">
                                    <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 
                                            ${idx === 0 ? 'bg-iob-blue border-iob-blue/20 text-white animate-pulse' : 'bg-white border-gray-100 text-gray-300'}`}>
                                        {idx === 0 ? <Clock className="w-3 h-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-bold text-gray-900">{log.newState?.replace('_', ' ') || 'ACTION TAKEN'}</p>
                                            <span className="text-[9px] text-gray-400 font-medium">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <p className="text-[10px] text-gray-500 flex items-center">
                                            <User className="w-2.5 h-2.5 mr-1" />
                                            {log.actorPosting.user.name}
                                            <span className="mx-1 text-gray-300">•</span>
                                            {log.actorPosting.designation.title}
                                        </p>
                                        {log.metadata?.notes && (
                                            <div className="mt-2 p-2 bg-gray-50 rounded-lg text-[10px] text-gray-600 italic flex items-start">
                                                <MessageSquare className="w-2.5 h-2.5 mr-1.5 mt-0.5 text-gray-300" />
                                                "{log.metadata.notes}"
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {decision.auditLogs.length === 0 && (
                                <div className="pl-8 text-[10px] text-gray-400 italic">No audit history found.</div>
                            )}
                        </div>
                    </div>

                    <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100/50 flex items-start space-x-3">
                        <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
                        <p className="text-[10px] text-amber-700 leading-normal">
                            This instrument is legally binding once authorized. All actions are digitally fingerprinted and immutable.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
