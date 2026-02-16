import { PrismaService } from '../../common/prisma.service';
export declare class MeetingService {
    private prisma;
    constructor(prisma: PrismaService);
    scheduleMeeting(committeeId: string, scheduledAt: Date, venue?: string, description?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        description: string | null;
        committeeId: string;
        scheduledAt: Date;
        venue: string | null;
        quorumSatisfied: boolean;
        minutesUrl: string | null;
        minutesHash: string | null;
    }>;
    addToAgenda(meetingId: string, decisionId: string, order: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        decisionId: string;
        meetingId: string;
        order: number;
        outcome: string;
        outcomeNotes: string | null;
    }>;
    recordAttendance(meetingId: string, attendance: {
        designationId: string;
        isPresent: boolean;
    }[]): Promise<import(".prisma/client").Prisma.BatchPayload>;
    updateAgendaOutcome(agendaItemId: string, outcome: string, outcomeNotes?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        decisionId: string;
        meetingId: string;
        order: number;
        outcome: string;
        outcomeNotes: string | null;
    }>;
    finalizeMeeting(meetingId: string, minutesUrl?: string, minutesHash?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        description: string | null;
        committeeId: string;
        scheduledAt: Date;
        venue: string | null;
        quorumSatisfied: boolean;
        minutesUrl: string | null;
        minutesHash: string | null;
    }>;
    getMeetingsByCommittee(committeeId: string): Promise<({
        agendaItems: ({
            decision: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                validFrom: Date | null;
                validTo: Date | null;
                status: string;
                deptContextId: string;
                regionContextId: string;
                outcomeData: import("@prisma/client/runtime/library").JsonValue | null;
                parentDecisionId: string | null;
                initiatorPostingId: string;
                authRuleId: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            decisionId: string;
            meetingId: string;
            order: number;
            outcome: string;
            outcomeNotes: string | null;
        })[];
        attendance: ({
            designation: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                title: string;
                titleHindi: string | null;
                titleTamil: string | null;
                rank: number;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            designationId: string;
            meetingId: string;
            isPresent: boolean;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        description: string | null;
        committeeId: string;
        scheduledAt: Date;
        venue: string | null;
        quorumSatisfied: boolean;
        minutesUrl: string | null;
        minutesHash: string | null;
    })[]>;
}
