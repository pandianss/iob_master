import { useState } from 'react';
import {
    Plus,
    ChevronLeft,
    ChevronRight,
    Clock,
    MapPin,
    FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Meeting {
    id: string;
    committeeName: string;
    scheduledAt: string;
    venue: string;
    status: 'SCHEDULED' | 'IN_PROGRESS' | 'CONCLUDED' | 'CANCELLED';
    agendaCount: number;
}

export function CalendarDashboard() {
    const navigate = useNavigate();
    const [viewDate] = useState(new Date());

    // Mock data for upcoming meetings
    const upcomingMeetings: Meeting[] = [
        {
            id: 'm1',
            committeeName: 'CAC-I (Credit Approval Committee)',
            scheduledAt: '2026-02-05T11:00:00Z',
            venue: 'Board Room, HO',
            status: 'SCHEDULED',
            agendaCount: 4
        },
        {
            id: 'm2',
            committeeName: 'ALCO (Asset Liability Committee)',
            scheduledAt: '2026-02-06T15:30:00Z',
            venue: 'VC Hall, 4th Floor',
            status: 'SCHEDULED',
            agendaCount: 2
        },
        {
            id: 'm3',
            committeeName: 'IT Strategy Committee',
            scheduledAt: '2026-02-10T10:00:00Z',
            venue: 'Conference Room A',
            status: 'SCHEDULED',
            agendaCount: 5
        }
    ];

    const getStatusColor = (status: Meeting['status']) => {
        switch (status) {
            case 'SCHEDULED': return 'bg-blue-100 text-blue-800';
            case 'IN_PROGRESS': return 'bg-amber-100 text-amber-800';
            case 'CONCLUDED': return 'bg-green-100 text-green-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Committee Calendar</h1>
                    <p className="text-gray-500 text-sm">Organizing and monitoring bank-wide committee cycles</p>
                </div>
                <button className="iob-btn-primary flex items-center">
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Meeting
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Visual Calendar (Mock) */}
                <div className="lg:col-span-1 iob-card flex flex-col items-center">
                    <div className="flex justify-between items-center w-full mb-6 text-sm">
                        <button className="p-1 hover:bg-gray-100 rounded-lg">
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <h3 className="font-semibold text-gray-900">
                            {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h3>
                        <button className="p-1 hover:bg-gray-100 rounded-lg">
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-2 w-full text-center text-[10px] font-bold text-gray-400 mb-2 uppercase">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={`${d}-${i}`}>{d}</div>)}
                    </div>

                    <div className="grid grid-cols-7 gap-1 w-full text-center">
                        {/* Dummy days */}
                        {Array.from({ length: 28 }).map((_, i) => {
                            const day = i + 1;
                            const hasMeeting = [5, 6, 10, 15, 22].includes(day);
                            return (
                                <div
                                    key={i}
                                    className={`aspect-square flex items-center justify-center text-sm rounded-lg cursor-pointer transition-colors
                                        ${day === new Date().getDate() ? 'bg-iob-blue text-white' : 'hover:bg-gray-50 text-gray-700 font-medium'}
                                        ${hasMeeting ? 'ring-2 ring-iob-blue-light/30 bg-iob-blue/5' : ''}
                                    `}
                                >
                                    {day}
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-8 w-full border-t pt-4 space-y-3">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Legend</p>
                        <div className="flex items-center text-xs text-gray-600 font-medium">
                            <div className="w-2.5 h-2.5 bg-iob-blue rounded-full mr-2"></div>
                            Today
                        </div>
                        <div className="flex items-center text-xs text-gray-600 font-medium">
                            <div className="w-2.5 h-2.5 bg-iob-blue/5 ring-2 ring-iob-blue-light/30 rounded-full mr-2"></div>
                            Scheduled Meeting
                        </div>
                    </div>
                </div>

                {/* Upcoming Meetings List */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest border-l-4 border-iob-blue pl-3 py-1 bg-gray-50/50">
                        Upcoming Agenda
                    </h3>

                    {upcomingMeetings.map((meeting) => (
                        <div
                            key={meeting.id}
                            onClick={() => navigate(`/calendar/meeting/${meeting.id}`)}
                            className="iob-card group hover:shadow-xl transition-all cursor-pointer border-l-4 border-transparent hover:border-iob-blue"
                        >
                            <div className="flex justify-between items-start">
                                <div className="space-y-3">
                                    <h4 className="font-bold text-gray-900 text-lg group-hover:text-iob-blue transition-colors">
                                        {meeting.committeeName}
                                    </h4>

                                    <div className="flex flex-wrap gap-4 text-xs text-gray-600 font-medium">
                                        <div className="flex items-center">
                                            <Clock className="w-3.5 h-3.5 mr-1.5 text-iob-blue" />
                                            {new Date(meeting.scheduledAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                        </div>
                                        <div className="flex items-center">
                                            <MapPin className="w-3.5 h-3.5 mr-1.5 text-iob-blue" />
                                            {meeting.venue}
                                        </div>
                                        <div className="flex items-center">
                                            <FileText className="w-3.5 h-3.5 mr-1.5 text-iob-blue" />
                                            {meeting.agendaCount} Agenda Items
                                        </div>
                                    </div>
                                </div>

                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusColor(meeting.status)}`}>
                                    {meeting.status}
                                </span>
                            </div>

                            <div className="mt-4 pt-4 border-t flex justify-end space-x-4">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-iob-blue">
                                    Edit Schedule
                                </span>
                                <span className="text-[10px] font-bold text-iob-blue uppercase tracking-widest underline underline-offset-4">
                                    Manage Agenda & Minutes
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
