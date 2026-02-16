import { PrismaService } from '../../common/prisma.service';
export interface ValidationResult {
    valid: boolean;
    reason?: 'NO_RULE' | 'BELOW_MIN' | 'EXCEEDS_LIMIT' | 'SYSTEM_ERROR';
    limitMax?: number;
    isEscalationMandatory?: boolean;
}
export interface AuthorityResolution {
    found: boolean;
    ruleId?: string;
    authorityBodyType?: string;
    authorityBodyId?: string;
    limitMax?: number;
}
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
    validateAuthority(authorityBodyType: 'DESIGNATION' | 'COMMITTEE', authorityBodyId: string, decisionTypeId: string, functionalScopeId: string, amount: number): Promise<ValidationResult>;
    canInitiate(postingId: string, functionalScopeId: string): Promise<boolean>;
    resolveAuthorityBody(decisionTypeId: string, functionalScopeId: string, amount: number): Promise<AuthorityResolution>;
    fetchAllowedContexts(postingId: string): Promise<{
        decisionTypeId: string;
        decisionTypeName: string;
        functionalScopeId: string;
        functionalScopeName: string;
        category: string | null;
    }[]>;
}
