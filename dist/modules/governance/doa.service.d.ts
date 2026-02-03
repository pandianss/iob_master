import { PrismaService } from '../../common/prisma.service';
export declare class DoAService {
    private prisma;
    constructor(prisma: PrismaService);
    resolveRule(authorityBodyType: 'DESIGNATION' | 'COMMITTEE', authorityBodyId: string, decisionTypeId: string, functionalScopeId: string): Promise<{
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
    } | null>;
    validateAuthority(authorityBodyType: 'DESIGNATION' | 'COMMITTEE', authorityBodyId: string, decisionTypeId: string, functionalScopeId: string, amount: number): Promise<{
        valid: boolean;
        reason: string;
        limitMax: import("@prisma/client/runtime/library").Decimal;
        isEscalationMandatory: boolean;
    } | {
        valid: boolean;
        reason?: undefined;
        limitMax?: undefined;
        isEscalationMandatory?: undefined;
    }>;
    canInitiate(postingId: string, functionalScopeId: string): Promise<boolean>;
    resolveAuthorityBody(decisionTypeId: string, functionalScopeId: string, amount: number): Promise<{
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
    fetchAllowedContexts(postingId: string): Promise<{
        decisionTypeId: string;
        decisionTypeName: string;
        functionalScopeId: string;
        functionalScopeName: string;
        category: string | null;
    }[]>;
}
