import { PrismaService } from '../../common/prisma.service';
import { Prisma } from '@prisma/client';
import { DoAService } from '../governance/doa.service';
export declare enum DecisionStatus {
    DRAFT = "DRAFT",
    PENDING_REVIEW = "PENDING_REVIEW",
    PENDING_APPROVAL = "PENDING_APPROVAL",
    APPROVED = "APPROVED",
    ESCALATED = "ESCALATED",
    REJECTED = "REJECTED"
}
export declare enum ActionType {
    RECOMMEND = "RECOMMEND",
    REVIEW = "REVIEW",
    APPROVE = "APPROVE",
    RATIFY = "RATIFY",
    ESCALATE = "ESCALATE",
    QUERY = "QUERY"
}
export declare class DecisionService {
    private prisma;
    private doaService;
    constructor(prisma: PrismaService, doaService: DoAService);
    create(initiatorPostingId: string, data: any, deptContextId: string, regionContextId: string, decisionTypeId?: string, functionalScopeId?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        validFrom: Date | null;
        validTo: Date | null;
        status: string;
        deptContextId: string;
        regionContextId: string;
        outcomeData: Prisma.JsonValue | null;
        parentDecisionId: string | null;
        initiatorPostingId: string;
        authRuleId: string | null;
    }>;
    performAction(decisionId: string, actorPostingId: string, action: ActionType, notes?: string, evidenceRefs?: any[]): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        validFrom: Date | null;
        validTo: Date | null;
        status: string;
        deptContextId: string;
        regionContextId: string;
        outcomeData: Prisma.JsonValue | null;
        parentDecisionId: string | null;
        initiatorPostingId: string;
        authRuleId: string | null;
    }>;
    private handleRecommend;
    private handleReview;
    private handleApprove;
    private handleEscalate;
    private updateState;
    findAll(officeId?: string): Promise<({
        initiatorPosting: {
            designation: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                title: string;
                rank: number;
                roleAbstraction: string;
            };
            user: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                identityRef: string;
                email: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            deptId: string;
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
            limitMin: Prisma.Decimal | null;
            limitMax: Prisma.Decimal | null;
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
        outcomeData: Prisma.JsonValue | null;
        parentDecisionId: string | null;
        initiatorPostingId: string;
        authRuleId: string | null;
    })[]>;
}
