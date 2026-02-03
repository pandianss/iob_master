import { PrismaService } from '../../common/prisma.service';
export declare class CommitteeService {
    private prisma;
    constructor(prisma: PrismaService);
    createMeeting(committeeId: string, scheduledAt: Date): Promise<{
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
    validateQuorum(meetingId: string): Promise<boolean>;
    finalizeDecision(meetingId: string, decisionData: any, initiatorPostingId: string): Promise<{
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
    }>;
}
