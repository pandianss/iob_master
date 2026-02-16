import { GovernanceService } from './governance.service';
export declare class GovernanceController {
    private readonly governanceService;
    constructor(governanceService: GovernanceService);
    getParameters(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        category: string;
        segment: string | null;
        unitLevel: string;
        departmentId: string | null;
    }[]>;
    getAllowedContexts(): Promise<{
        decisionTypeId: string;
        decisionTypeName: string;
        functionalScopeId: string;
        functionalScopeName: string;
        category: string;
    }[]>;
    createParameter(body: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        category: string;
        segment: string | null;
        unitLevel: string;
        departmentId: string | null;
    }>;
    updateParameter(id: string, body: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        category: string;
        segment: string | null;
        unitLevel: string;
        departmentId: string | null;
    }>;
    deleteParameter(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        category: string;
        segment: string | null;
        unitLevel: string;
        departmentId: string | null;
    }>;
    createContext(body: {
        decisionTypeName: string;
        functionalScopeName: string;
    }): Promise<{
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
    }>;
}
