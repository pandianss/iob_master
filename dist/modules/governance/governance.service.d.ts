import { PrismaService } from '../../common/prisma.service';
export declare class GovernanceService {
    private prisma;
    constructor(prisma: PrismaService);
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
    findAllowedContexts(postingId?: string): Promise<{
        decisionTypeId: string;
        decisionTypeName: string;
        functionalScopeId: string;
        functionalScopeName: string;
        category: string;
    }[]>;
    createParameter(data: {
        code: string;
        name: string;
        category: string;
        segment?: string;
        unitLevel: string;
        departmentId?: string;
    }): Promise<{
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
    updateParameter(id: string, data: Partial<{
        name: string;
        category: string;
        segment: string;
        unitLevel: string;
        departmentId: string;
    }>): Promise<{
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
    createContext(data: {
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
