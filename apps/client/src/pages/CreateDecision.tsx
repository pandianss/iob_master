import { useState, useEffect } from 'react';
import {
    FileText,
    Send,
    AlertCircle,
    Paperclip,
    CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDecision, DecisionProvider } from '../contexts/DecisionContext';
import { FormLayout } from '../components/ui/FormLayout';

function CreateDecisionContent() {
    const navigate = useNavigate();
    const { state, dispatch } = useDecision();
    const [units, setUnits] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/admin/departments');
                if (response.ok) {
                    const depts = await response.json();
                    setUnits(depts);
                }
            } catch (error) {
                console.error('Failed to fetch data', error);
            }
        };
        fetchData();
    }, []);

    const nextStep = () => dispatch({ type: 'SET_STEP', payload: state.step + 1 });
    const prevStep = () => dispatch({ type: 'SET_STEP', payload: state.step - 1 });

    const updateForm = (data: any) => dispatch({ type: 'UPDATE_FORM', payload: data });

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Simplified submission for UI demonstration
            setTimeout(() => {
                navigate('/');
                dispatch({ type: 'RESET' });
            }, 1500);
        } catch (error) {
            console.error('Submission failed', error);
        }
    };

    const renderStep = () => {
        switch (state.step) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Originating Context</label>
                                <select
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-iob-blue/10"
                                    value={state.formData.context}
                                    onChange={e => updateForm({ context: e.target.value })}
                                >
                                    <option value="">Select Branch/Unit</option>
                                    {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Classification</label>
                                <select
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-iob-blue/10"
                                    value={state.formData.classification}
                                    onChange={e => updateForm({ classification: e.target.value })}
                                >
                                    <option value="GENERAL">General Proposal</option>
                                    <option value="CREDIT">Credit Sanction</option>
                                    <option value="POLICY">Policy Amendment</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center">
                                <FileText className="w-3 h-3 mr-1.5" /> Subject of Note
                            </label>
                            <input
                                className="w-full p-4 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-900 outline-none focus:ring-4 focus:ring-iob-blue/5"
                                placeholder="Enter specific subject line..."
                                value={state.formData.title}
                                onChange={e => updateForm({ title: e.target.value })}
                            />
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6">
                        <div className="p-12 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors cursor-pointer">
                            <Paperclip className="w-8 h-8 mb-4" />
                            <p className="text-sm font-medium">Click to attach supporting documents</p>
                            <p className="text-[10px] uppercase tracking-widest mt-1">PDF, DOCX up to 10MB</p>
                        </div>
                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-start space-x-3">
                            <AlertCircle className="w-4 h-4 text-iob-blue mt-0.5" />
                            <p className="text-xs text-blue-900 leading-relaxed">
                                <strong>Mandatory Checklist:</strong> Ensure Annexure-1 (Rationale) and Annexure-2 (Compliance) are included for Credit vertical notes.
                            </p>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6">
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                            <h3 className="text-sm font-bold text-gray-900 mb-4">Final Review Summary</h3>
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                <div>
                                    <dt className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Protocol Type</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{state.formData.classification} Protocol</dd>
                                </div>
                                <div>
                                    <dt className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Subject</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{state.formData.title}</dd>
                                </div>
                            </dl>
                        </div>
                        <label className="flex items-start space-x-3 p-4 bg-amber-50 border border-amber-100 rounded-xl cursor-pointer">
                            <input
                                type="checkbox"
                                className="mt-1 rounded text-iob-blue"
                                checked={state.formData.governanceReview}
                                onChange={e => updateForm({ governanceReview: e.target.checked })}
                            />
                            <span className="text-xs text-amber-900 leading-relaxed italic">
                                I certify that this proposal aligns with current DoA guidelines and has been reviewed for technical compliance within the originating vertical.
                            </span>
                        </label>
                    </div>
                );
            default:
                return null;
        }
    };

    const stepTitles = ["Initial Draft", "Documentation", "Governance Verification", "System Authenticating"];

    return (
        <FormLayout
            title={stepTitles[state.step - 1]}
            subtitle={`Step ${state.step} of 4: Coordination Zone Entry Protocol`}
            actions={
                <>
                    {state.step > 1 && (
                        <button onClick={prevStep} className="px-6 py-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
                            Previous Step
                        </button>
                    )}
                    {state.step < 3 ? (
                        <button
                            onClick={nextStep}
                            disabled={state.step === 1 && !state.formData.title}
                            className="bg-iob-blue text-white px-8 py-3 rounded-xl font-bold flex items-center space-x-2 shadow-lg hover:shadow-iob-blue/20 hover:bg-blue-700 transition-all disabled:opacity-50"
                        >
                            <span>Proceed to {state.step === 1 ? 'Attachments' : 'Verification'}</span>
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !state.formData.governanceReview}
                            className="bg-iob-blue text-white px-10 py-3 rounded-xl font-bold flex items-center space-x-2 shadow-xl hover:bg-blue-700 transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? <span className="animate-spin text-lg">◌</span> : <CheckCircle2 className="w-4 h-4" />}
                            <span>{isSubmitting ? 'Authenticating...' : 'Digitally Submit Note'}</span>
                        </button>
                    )}
                </>
            }
        >
            {/* Step Progress Bar */}
            <div className="flex border-b border-gray-100 -mx-8 -mt-8 mb-8 overflow-hidden">
                {[1, 2, 3, 4].map(s => (
                    <div
                        key={s}
                        className={`flex-1 h-1.5 transition-all duration-500 ${state.step >= s ? 'bg-iob-blue' : 'bg-gray-100'}`}
                    />
                ))}
            </div>
            {renderStep()}
        </FormLayout>
    );
}

export function CreateDecision() {
    return (
        <DecisionProvider>
            <CreateDecisionContent />
        </DecisionProvider>
    );
}
