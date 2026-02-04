
import { useState, useEffect } from 'react';
import { Clock, ArrowRight, FileDown, PlusCircle, Shield, User, Landmark, IndianRupee } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Decision {
    id: string;
    status: string;
    createdAt: string;
    initiatorPosting: {
        user: { name: string };
        designation: { title: string };
    };
    authRule: {
        authorityBodyType: string;
    } | null;
    outcomeData: any;
}

export function ObligationRegister() {
    const [decisions, setDecisions] = useState<Decision[]>([]);
    const [currentOffice, setCurrentOffice] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            try {
                const res = await fetch('/api/governance/offices/MD-CEO');
                const office = await res.json();
                setCurrentOffice(office);
                if (office && office.id) {
                    await fetchDecisions(office.id);
                }
            } catch (err) {
                console.error('Context error', err);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    const fetchDecisions = async (officeId: string) => {
        try {
            const res = await fetch(`/api/decisions?officeId=${officeId}`);
            const data = await res.json();
            setDecisions(data);
        } catch (err) {
            console.error('Fetch error', err);
        }
    };

    if (loading) return <div className="p-8 text-center animate-pulse text-iob-blue font-bold">Initializing Ledger Context...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-800 italic">
                        Decision Register
                    </h1>
                    <p className="text-gray-500 mt-1 flex items-center text-sm">
                        <Landmark className="w-3.5 h-3.5 mr-1.5" />
                        Viewing as: <span className="font-semibold text-gray-800 ml-1">{currentOffice?.name} ({currentOffice?.code})</span>
                    </p>
                </div>
                <div className="flex space-x-2">
                    <Link to="/decisions/new" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 font-bold flex items-center transition-all hover:scale-105">
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Initiate Proposal
                    </Link>
                </div>
            </div>

            <div className="iob-card overflow-hidden !p-0">
                <table className="w-full border-collapse">
                    <thead className="bg-gray-50/50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Decision / Instrument</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Initiator</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Authority</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Value</th>
                            <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {decisions.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center">
                                    <div className="opacity-30 mb-2 font-bold italic text-iob-blue uppercase tracking-tighter text-xl">No active decisions recorded</div>
                                    <p className="text-xs text-gray-400">Initiate a proposal to seed the governance ledger.</p>
                                </td>
                            </tr>
                        ) : (
                            decisions.map((item) => (
                                <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                                            ${item.status === 'APPROVED' ? 'bg-green-100 text-green-800 border border-green-200' :
                                                item.status === 'DRAFT' ? 'bg-gray-100 text-gray-600 border border-gray-200' :
                                                    'bg-amber-100 text-amber-800 border border-amber-200'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-gray-900 line-clamp-1">{item.outcomeData?.subject || 'Administrative Proposal'}</div>
                                        <div className="flex items-center mt-1">
                                            <Shield className="w-3 h-3 text-iob-blue mr-1" />
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.outcomeData?.instrumentType || 'Note'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 rounded-full bg-iob-blue/10 flex items-center justify-center mr-3">
                                                <User className="w-4 h-4 text-iob-blue" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-gray-900">{item.initiatorPosting.user.name}</div>
                                                <div className="text-[10px] text-gray-500 uppercase font-medium">{item.initiatorPosting.designation.title}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded inline-block">
                                            {item.authRule?.authorityBodyType || item.outcomeData?.targetCommittee || 'Standard authority'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-xs font-bold text-iob-blue">
                                            <IndianRupee className="w-3 h-3 mr-0.5" />
                                            {Number(item.outcomeData?.amount || 0).toLocaleString('en-IN')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => window.open(`/api/documents/download/${item.id}`, '_blank')}
                                                className="p-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-all group"
                                                title="Download Management Instrument"
                                            >
                                                <FileDown className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                            </button>
                                            <button className="px-3 py-1.5 bg-white border border-gray-200 shadow-sm text-xs font-bold text-gray-600 rounded-lg hover:bg-gray-50">
                                                View
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
