import { useEffect, useState } from 'react';
import { FileText, User, ArrowRight, Clock, AlertTriangle, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Decision {
    id: string;
    deptContextId: string;
    status: string;
    outcomeData: any;
    createdAt: string;
    initiator: {
        name: string;
        designation: string;
    };
    authBasis: string;
}

export function Inbox() {
    const [decisions, setDecisions] = useState<Decision[]>([]);

    useEffect(() => {
        const fetchDecisions = async () => {
            try {
                const response = await fetch('/api/decisions');
                if (response.ok) {
                    const data = await response.json();
                    setDecisions(data.map((d: any) => ({
                        id: d.id,
                        deptContextId: d.deptContextId,
                        status: d.status,
                        outcomeData: d.outcomeData,
                        createdAt: d.createdAt,
                        initiator: {
                            name: d.initiatorPosting?.user?.name || 'Unknown',
                            designation: d.initiatorPosting?.designation?.name || 'Unknown'
                        },
                        authBasis: d.authRuleId || 'Manual'
                    })));
                }
            } catch (error) {
                console.error('Failed to fetch decisions', error);
            }
        };

        fetchDecisions();
        // Refresh every 30 seconds for live updates
        const interval = setInterval(fetchDecisions, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <h1 className="text-2xl font-bold text-iob-blue-dark tracking-tight">The Ledger</h1>
                    <Link to="/decisions/new" className="iob-btn-primary py-1.5 px-3 text-xs flex items-center">
                        <Plus className="w-3 h-3 mr-1.5" />
                        New Request
                    </Link>
                </div>
                <div className="flex space-x-2">
                    <span className="iob-badge-neutral flex items-center">
                        <Clock className="w-3 h-3 mr-1" /> Pending: 1
                    </span>
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold flex items-center">
                        <AlertTriangle className="w-3 h-3 mr-1" /> Escalated: 1
                    </span>
                </div>
            </div>

            <div className="iob-card">
                <table className="iob-table">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Ref No.</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Subject</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Department</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Initiator</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {decisions.map((decision) => (
                            <tr key={decision.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    <div className="flex items-center">
                                        <FileText className="w-4 h-4 mr-2 text-gray-400" />
                                        {decision.id}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    <div className="font-medium">{decision.outcomeData.subject}</div>
                                    <div className="text-xs text-gray-500 mt-0.5">Basis: {decision.authBasis}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className="iob-badge-neutral">
                                        {decision.deptContextId}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex items-center">
                                        <User className="w-3 h-3 mr-1.5 text-gray-400" />
                                        {decision.initiator.name}
                                    </div>
                                    <div className="text-xs text-gray-400 ml-4.5">{decision.initiator.designation}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${decision.status === 'PENDING_APPROVAL' ? 'bg-yellow-100 text-yellow-800' :
                                        decision.status === 'ESCALATED' ? 'bg-red-100 text-red-800' :
                                            'bg-green-100 text-green-800'
                                        }`}>
                                        {decision.status.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link to={`/decisions/${decision.id}`} className="iob-btn-primary text-xs px-3 py-1.5 flex items-center justify-end ml-auto">
                                        View <ArrowRight className="w-4 h-4 ml-1" />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
