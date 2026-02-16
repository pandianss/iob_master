import { DecisionService, ActionType } from './decision.service';
export declare class DecisionController {
    private readonly decisionService;
    constructor(decisionService: DecisionService);
    create(body: {
        initiatorPostingId: string;
        data: any;
        deptContextId: string;
        regionContextId: string;
        decisionTypeId?: string;
        functionalScopeId?: string;
    }): Promise<{
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
    performAction(id: string, body: {
        actorPostingId: string;
        action: ActionType;
        notes?: string;
        evidenceRefs?: any[];
    }): Promise<{
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
            limitMin: import("@prisma/client/runtime/library").Decimal | null;
            limitMax: import("@prisma/client/runtime/library").Decimal | null;
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
            prevState: import("@prisma/client/runtime/library").JsonValue | null;
            newState: import("@prisma/client/runtime/library").JsonValue | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
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
        outcomeData: import("@prisma/client/runtime/library").JsonValue | null;
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
}
