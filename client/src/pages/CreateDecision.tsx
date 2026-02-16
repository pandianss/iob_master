import { useState, useEffect } from 'react';
import {
    ShieldCheck,
    FileText,
    ArrowLeft,
    ChevronDown,
    Send,
    AlertCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';


export function CreateDecision() {
    const navigate = useNavigate();
    const [units, setUnits] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        decisionTypeId: '',
        functionalScopeId: '',
        deptContextId: '',
        regionContextId: '',
        subject: '',
        justification: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/admin/departments');
                if (response.ok) {
                    const depts = await response.json();
                    setUnits(depts);
                    // Pre-select first branch or RO if available
                    const branch = depts.find((d: any) => d.subType === 'BRANCH');
                    const ro = depts.find((d: any) => d.subType === 'RO');
                    setFormData(prev => ({
                        ...prev,
                        deptContextId: branch?.id || depts[0]?.id || '',
                        regionContextId: ro?.id || ''
                    }));
                }
            } catch (error) {
                console.error('Failed to fetch data', error);
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async () => {
        if (!formData.subject || !formData.justification) {
            alert('Please provide a subject and abstract for the proposal.');
            return;
        }

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
                    status: 'PENDING_APPROVAL'
                }
            };
            const response = await fetch('/api/decisions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                // After creation, submit it for review (transition from DRAFT to PENDING_APPROVAL)
                const decision = await response.json();
                await fetch(`/api/decisions/${decision.id}/action`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        actorPostingId: 'mock-ro-posting',
                        action: 'SUBMIT',
                        notes: 'Initial Submission'
                    })
                });
                navigate('/');
            }
        } catch (error) {
            console.error('Submission failed', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center space-x-4">
                <Link to="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight italic">Initiate Coordination Zone Note</h1>
                    <p className="text-gray-500 text-xs font-mono uppercase tracking-widest mt-0.5">Direct Branch-to-RO Department Protocol</p>
                </div>
            </div>

            <div className="iob-card shadow-2xl border-t-4 border-iob-blue bg-white">
                <div className="mb-8 p-4 bg-blue-50/50 rounded-xl border border-blue-100/50 flex items-start space-x-3">
                    <ShieldCheck className="w-5 h-5 text-iob-blue mt-0.5" />
                    <div className="text-xs text-blue-900 leading-relaxed">
                        <p className="font-bold uppercase tracking-wider mb-1">Coordination Zone Entry</p>
                        This note will be routed to the <span className="font-bold underline">Regional Authority</span> for specific departmental review. Ensure all rationales are accurate.
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Part 1: Routing Context */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Originating Unit (Branch)</label>
                            <div className="relative">
                                <select className="w-full p-3 bg-gray-50/50 border border-gray-100 rounded-lg text-sm appearance-none outline-none focus:ring-2 focus:ring-iob-blue/10"
                                    value={formData.deptContextId} onChange={e => setFormData({ ...formData, deptContextId: e.target.value })}>
                                    {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Target RO Department</label>
                            <div className="relative">
                                <select className="w-full p-3 bg-gray-50/50 border border-gray-100 rounded-lg text-sm appearance-none outline-none focus:ring-2 focus:ring-iob-blue/10"
                                    value={formData.regionContextId} onChange={e => setFormData({ ...formData, regionContextId: e.target.value })}>
                                    <option value="">Select Department</option>
                                    {units.filter(u => u.subType === 'DEPT').map(u => (
                                        <option key={u.id} value={u.id}>{u.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>



                    {/* Part 4: Proposal Body */}
                    <div className="space-y-6 pt-6 border-t-2 border-dashed border-gray-100">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center">
                                <FileText className="w-3 h-3 mr-1.5" /> Subject of Note
                            </label>
                            <input className="w-full p-4 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:ring-4 focus:ring-iob-blue/5 outline-none placeholder:font-normal placeholder:text-gray-300"
                                placeholder="Enter specific subject line..."
                                value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center">
                                <FileText className="w-3 h-3 mr-1.5" /> Abstract & Rationale
                            </label>
                            <textarea className="w-full p-4 bg-white border border-gray-200 rounded-xl text-sm leading-relaxed min-h-[180px] focus:ring-4 focus:ring-iob-blue/5 outline-none placeholder:text-gray-300"
                                placeholder="Provide the detailed abstract and rationale for this proposal..."
                                value={formData.justification} onChange={e => setFormData({ ...formData, justification: e.target.value })} />
                        </div>
                    </div>

                    <div className="pt-8 flex items-center justify-between border-t border-gray-100">
                        <div className="flex items-center text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">
                            <AlertCircle className="w-4 h-4 mr-2" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Official Fingerprint Required</span>
                        </div>
                        <button onClick={handleSubmit} disabled={isSubmitting}
                            className="bg-iob-blue text-white px-10 py-4 rounded-xl font-bold flex items-center space-x-2 shadow-xl hover:bg-blue-700 transition-all disabled:opacity-50 hover:translate-y-[-2px]">
                            {isSubmitting ? <span className="animate-spin">◌</span> : <Send className="w-4 h-4" />}
                            <span>{isSubmitting ? 'Authenticating...' : 'Digitally Submit Note'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
