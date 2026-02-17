import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';

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

@Injectable()
export class DoAService {
    constructor(private prisma: PrismaService) { }

    /**
     * Resolves the applicable DoA rule for a decision context.
     */
    async resolveRule(
        authorityBodyType: 'DESIGNATION' | 'COMMITTEE',
        authorityBodyId: string,
        decisionTypeId: string,
        functionalScopeId: string,
    ) {
        return this.prisma.doARule.findFirst({
            where: {
                authorityBodyType,
                authorityBodyId,
                decisionTypeId,
                functionalScopeId,
            },
        });
    }

    /**
     * Validates if a specific authority body can approve a decision with a given amount.
     * Returns a structured ValidationResult instead of throwing exceptions for business rules.
     */
    async validateAuthority(
        authorityBodyType: 'DESIGNATION' | 'COMMITTEE',
        authorityBodyId: string,
        decisionTypeId: string,
        functionalScopeId: string,
        amount: number,
    ): Promise<ValidationResult> {
        try {
            const rule = await this.resolveRule(
                authorityBodyType,
                authorityBodyId,
                decisionTypeId,
                functionalScopeId,
            );

            if (!rule) {
                return { valid: false, reason: 'NO_RULE' };
            }

            if (rule.limitMin && amount < Number(rule.limitMin)) {
                return { valid: false, reason: 'BELOW_MIN' };
            }

            if (rule.limitMax && amount > Number(rule.limitMax)) {
                return {
                    valid: false,
                    reason: 'EXCEEDS_LIMIT',
                    limitMax: Number(rule.limitMax),
                    isEscalationMandatory: rule.isEscalationMandatory
                };
            }

            return { valid: true };
        } catch (error) {
            console.error('DoA Validation Error', error);
            return { valid: false, reason: 'SYSTEM_ERROR' };
        }
    }

    /**
     * Checks if an initiator has the basic authority to even start a decision process.
     */
    async canInitiate(postingId: string, functionalScopeId: string): Promise<boolean> {
        const posting = await this.prisma.posting.findUnique({
            where: { id: postingId },
            include: { designation: true },
        });

        if (!posting || posting.status !== 'ACTIVE') return false;

        const ruleCount = await this.prisma.doARule.count({
            where: {
                authorityBodyType: 'DESIGNATION',
                authorityBodyId: posting.designationId,
                functionalScopeId,
            },
        });

        return ruleCount > 0;
    }

    /**
     * Finds the authority body that should approve a specific amount.
     * This follows the hierarchy: highest authority that has a limit covering this amount.
     */
    async resolveAuthorityBody(decisionTypeId: string, functionalScopeId: string, amount: number): Promise<AuthorityResolution> {
        // Find all applicable rules sorted by limitMax
        const rules = await this.prisma.doARule.findMany({
            where: {
                decisionTypeId,
                functionalScopeId,
            },
            orderBy: {
                limitMax: 'asc',
            },
        });

        // Find the FIRST rule where amount <= limitMax
        // If multiple rules exist (e.g., GM and Committee), the one with the smallest limitMax covering the amount is chosen.
        const applicableRule = rules.find(rule => {
            const min = rule.limitMin ? Number(rule.limitMin) : 0;
            const max = rule.limitMax ? Number(rule.limitMax) : Infinity;
            return amount >= min && amount <= max;
        });

        if (applicableRule) {
            return {
                found: true,
                ruleId: applicableRule.id,
                authorityBodyType: applicableRule.authorityBodyType,
                authorityBodyId: applicableRule.authorityBodyId,
                limitMax: Number(applicableRule.limitMax),
            };
        }

        // Return the highest authority if logic dictates standard escalation (or explicitly fail)
        // For now, if no one covers the amount, we return valid=false
        return { found: false };
    }

    /**
     * Fetches allowed decision types and functional scopes for a specific unit/posting.
     */
    async fetchAllowedContexts(postingId: string) {
        const posting = await this.prisma.posting.findUnique({
            where: { id: postingId },
            include: { departments: true },
        });

        if (!posting) return [];

        // Fetch based on specific departments OR unit types (RO, ZO, HO, Branch)
        const deptIds = posting.departments.map(d => d.id);
        const unitTypes = posting.departments.map(d => d.type);

        const availabilities = await this.prisma.unitAvailability.findMany({
            where: {
                OR: [
                    { deptId: { in: deptIds } },
                    { unitType: { in: unitTypes } },
                ],
            },
            include: {
                decisionType: true,
                functionalScope: true,
            },
        });

        // Map to a more consumable format for the frontend
        return availabilities.map(a => ({
            decisionTypeId: a.decisionTypeId,
            decisionTypeName: a.decisionType.name,
            functionalScopeId: a.functionalScopeId,
            functionalScopeName: a.functionalScope.name,
            category: a.decisionType.category
        }));
    }
}
