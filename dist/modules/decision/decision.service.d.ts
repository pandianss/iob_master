import { PrismaService } from '../../common/prisma.service';
import { Prisma } from '@prisma/client';
import { DoAService } from '../governance/doa.service';
export declare enum DecisionStatus {
    DRAFT = "DRAFT",
    PENDING_APPROVAL = "PENDING_APPROVAL",
    QUERY_RAISED = "QUERY_RAISED",
    APPROVED = "APPROVED",
    SANCTIONED = "SANCTIONED",
    REJECTED = "REJECTED",
    ESCALATED = "ESCALATED"
}
export declare enum ActionType {
    SUBMIT = "SUBMIT",
    APPROVE = "APPROVE",
    SANCTION = "SANCTION",
    REJECT = "REJECT",
    ESCALATE = "ESCALATE",
    QUERY = "QUERY",
    RESPOND = "RESPOND"
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
    private handleSubmit;
    private handleSanction;
    private handleReject;
    private handleQuery;
    private handleRespond;
    private handleApprove;
    private handleEscalate;
    private updateState;
    findOne(id: string): Promise<{
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
        authRule: ({
            decisionType: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                code: string;
                description: string | null;
                category: string | null;
            };
            functionalScope: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                code: string;
                parentScopeId: string | null;
            };
        } & {
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
        }) | null;
        evidence: {
            id: string;
            type: string;
            decisionId: string;
            uri: string;
            hash: string;
            capturedAt: Date;
        }[];
        auditLogs: ({
            actorPosting: {
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
        } & {
            id: string;
            timestamp: Date;
            actionType: string;
            prevState: Prisma.JsonValue | null;
            newState: Prisma.JsonValue | null;
            metadata: Prisma.JsonValue | null;
            decisionId: string;
            actorPostingId: string;
        })[];
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
    }>;
    findAll(officeId?: string): Promise<({
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
