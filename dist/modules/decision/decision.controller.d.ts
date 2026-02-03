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
    findAll(): Promise<({
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
