import { ReportingService } from './reporting.service';
export declare class ReportingController {
    private readonly reportingService;
    constructor(reportingService: ReportingService);
    getInbox(identityRef: string): Promise<({
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
    getDoABreaches(): Promise<(import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.DecisionGroupByOutputType, "deptContextId"[]> & {
        _count: {
            id: number;
        };
    })[]>;
    getDeptCompliance(deptCode: string): Promise<Record<string, number> | null>;
}
