import { useState } from 'react';
import {
    CheckCircle2,
    XCircle,
    Clock,
    UserCheck,
    FileText,
    Save,
    ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface AgendaItem {
    id: string;
    title: string;
    initiator: string;
    department: string;
    amount: string;
    status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'DEFERRED';
    outcomeNotes?: string;
}

interface Member {
    id: string;
    name: string;
    designation: string;
    isPresent: boolean;
}

export function AgendaManagement() {
    // Mock meeting metadata
    const meeting = {
        id: 'm1',
        committeeName: 'CAC-I (Credit Approval Committee)',
        scheduledAt: '2026-02-05T11:00:00Z',
        venue: 'Board Room, HO',
        status: 'SCHEDULED'
    };

    const [agenda, setAgenda] = useState<AgendaItem[]>([
        { id: 'a1', title: 'Credit Sanction - M/s ABC Exports', initiator: 'Branch Mgr, Ludhiana', department: 'Credit', amount: '4.50 Cr', status: 'PENDING' },
        { id: 'a2', title: 'Enhancement of Limit - XYZ Infra', initiator: 'RM, Delhi', department: 'Credit', amount: '12.00 Cr', status: 'PENDING' },
        { id: 'a3', title: 'Renewal of CC Limit - PQR Textiles', initiator: 'Branch Mgr, Surat', department: 'Credit', amount: '2.25 Cr', status: 'PENDING' },
    ]);

    const [members, setMembers] = useState<Member[]>([
        { id: 'u1', name: 'Shri R.K. Sharma', designation: 'GM (Credit)', isPresent: false },
        { id: 'u2', name: 'Smt. Priya Nair', designation: 'DGM (SME)', isPresent: false },
        { id: 'u3', name: 'Shri Amit Verma', designation: 'AGM (MSME)', isPresent: false },
        { id: 'u4', name: 'Shri S. Venkatesh', designation: 'Chief Manager (Secy)', isPresent: false },
    ]);

    const toggleAttendance = (id: string) => {
        setMembers(members.map(m => m.id === id ? { ...m, isPresent: !m.isPresent } : m));
    };

    const updateStatus = (id: string, status: AgendaItem['status']) => {
        setAgenda(agenda.map(a => a.id === id ? { ...a, status } : a));
    };

    const presentCount = members.filter(m => m.isPresent).length;

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link to="/calendar" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{meeting.committeeName}</h1>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Clock className="w-4 h-4 mr-1 ml-0" />
                        {new Date(meeting.scheduledAt).toLocaleString()} | {meeting.venue}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Attendance Panel */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="iob-card">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center">
                            <UserCheck className="w-4 h-4 mr-2 text-iob-blue" />
                            Attendance
                        </h3>
                        <div className="space-y-4">
                            {members.map(member => (
                                <div key={member.id} className="flex items-center justify-between group">
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-semibold text-gray-900">{member.name}</p>
                                        <p className="text-xs text-gray-500">{member.designation}</p>
                                    </div>
                                    <button
                                        onClick={() => toggleAttendance(member.id)}
                                        className={`w-5 h-5 rounded border transition-all flex items-center justify-center
                                            ${member.isPresent ? 'bg-iob-blue border-iob-blue text-white' : 'border-gray-200 hover:border-iob-blue'}
                                        `}
                                    >
                                        {member.isPresent && <CheckCircle2 className="w-4 h-4" />}
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 pt-4 border-t">
                            <p className="text-xs text-gray-500">
                                Quorum Status: <span className={presentCount >= 3 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                                    {presentCount >= 3 ? 'SATISFIED' : 'PENDING'}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Agenda Items */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center">
                            <FileText className="w-4 h-4 mr-2 text-iob-blue" />
                            Meeting Agenda
                        </h3>
                        <button className="iob-btn-primary py-1 px-4 text-xs">
                            <Save className="w-3 h-3 mr-2 inline" />
                            Finalize Minutes
                        </button>
                    </div>

                    {agenda.map((item, index) => (
                        <div key={item.id} className="iob-card">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <div className="flex items-center space-x-2">
                                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold">ITEM {index + 1}</span>
                                        <h4 className="font-bold text-gray-900">{item.title}</h4>
                                    </div>
                                    <p className="text-sm text-gray-600">Proposed by: {item.initiator} ({item.department})</p>
                                    <p className="text-sm font-bold text-iob-blue">Value: {item.amount}</p>
                                </div>

                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => updateStatus(item.id, 'APPROVED')}
                                        className={`p-2 rounded-lg border transition-all ${item.status === 'APPROVED' ? 'bg-green-100 border-green-500 text-green-700' : 'hover:bg-green-50 text-gray-400'}`}
                                        title="Approve"
                                    >
                                        <CheckCircle2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => updateStatus(item.id, 'DECLINED')}
                                        className={`p-2 rounded-lg border transition-all ${item.status === 'DECLINED' ? 'bg-red-100 border-red-500 text-red-700' : 'hover:bg-red-50 text-gray-400'}`}
                                        title="Decline"
                                    >
                                        <XCircle className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => updateStatus(item.id, 'DEFERRED')}
                                        className={`p-2 rounded-lg border transition-all ${item.status === 'DEFERRED' ? 'bg-amber-100 border-amber-500 text-amber-700' : 'hover:bg-amber-50 text-gray-400'}`}
                                        title="Defer"
                                    >
                                        <Clock className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {item.status !== 'PENDING' && (
                                <div className="mt-4 pt-4 border-t">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Outcome Notes</label>
                                    <textarea
                                        className="w-full bg-gray-50 border border-gray-100 rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-iob-blue"
                                        placeholder="Add deliberation notes here..."
                                        rows={2}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
