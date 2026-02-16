import { PrismaService } from '../../common/prisma.service';
export declare class ReportingService {
    private prisma;
    constructor(prisma: PrismaService);
    getPendingApprovals(userIdentityRef: string): Promise<({
        initiatorPosting: {
            designation: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                title: string;
                titleHindi: string | null;
                titleTamil: string | null;
                rank: number;
            };
            user: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                nameHindi: string | null;
                nameTamil: string | null;
                identityRef: string;
                email: string;
                mobile: string | null;
                dob: Date | null;
                gender: string | null;
                role: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            regionId: string;
            designationId: string;
            validFrom: Date;
            validTo: Date | null;
            status: string;
        };
        authRule: {
            id: string;
            authorityBodyType: string;
            authorityBodyId: string;
            decisionTypeId: string;
            functionalScopeId: string;
            limitMin: import("@prisma/client/runtime/library").Decimal | null;
            limitMax: import("@prisma/client/runtime/library").Decimal | null;
            currency: string;
            requiresEvidence: boolean;
            isEscalationMandatory: boolean;
            createdAt: Date;
            updatedAt: Date;
        } | null;
    } & {
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
    })[]>;
    getInboxStats(userIdentityRef: string): Promise<{
        pending: number;
        escalated: number;
    }>;
    getDoABreachStats(): Promise<(import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.DecisionGroupByOutputType, "deptContextId"[]> & {
        _count: {
            id: number;
        };
    })[]>;
    getComplianceScore(deptCode: string): Promise<Record<string, number> | null>;
    getBusinessSnapshot(date?: Date): Promise<any>;
    getComparisonSnapshot(dates: {
        t: Date;
        tMinus1: Date;
        monthEnd: Date;
        fyEnd: Date;
        fyStart: Date;
    }): Promise<{
        snapshots: {
            t: any;
            tMinus1: any;
            monthEnd: any;
            fyEnd: any;
            fyStart: any;
        };
        targets: any;
    }>;
    saveTarget(data: {
        metric: string;
        timeframe: string;
        targetValue: number;
        targetDate: Date;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metric: string;
        timeframe: string;
        targetValue: number;
        targetDate: Date;
    }>;
}
