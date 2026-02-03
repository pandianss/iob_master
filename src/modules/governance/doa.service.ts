import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

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
     */
    async validateAuthority(
        authorityBodyType: 'DESIGNATION' | 'COMMITTEE',
        authorityBodyId: string,
        decisionTypeId: string,
        functionalScopeId: string,
        amount: number,
    ) {
        const rule = await this.resolveRule(
            authorityBodyType,
            authorityBodyId,
            decisionTypeId,
            functionalScopeId,
        );

        if (!rule) {
            throw new ForbiddenException('No authority rule found for this context.');
        }

        if (rule.limitMin && amount < Number(rule.limitMin)) {
            throw new ForbiddenException(`Amount is below the minimum threshold of ${rule.limitMin}`);
        }

        if (rule.limitMax && amount > Number(rule.limitMax)) {
            return {
                valid: false,
                reason: 'EXCEEDS_LIMIT',
                limitMax: rule.limitMax,
                isEscalationMandatory: rule.isEscalationMandatory
            };
        }

        return { valid: true };
    }

    /**
     * Checks if an initiator has the basic authority to even start a decision process.
     */
    async canInitiate(postingId: string, functionalScopeId: string) {
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
    async resolveAuthorityBody(decisionTypeId: string, functionalScopeId: string, amount: number) {
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

        if (!applicableRule) {
            // If no rule matches, it might exceed all limits, return the one with the highest limitMax
            return rules[rules.length - 1] || null;
        }

        return applicableRule;
    }

    /**
     * Fetches allowed decision types and functional scopes for a specific unit/posting.
     */
    async fetchAllowedContexts(postingId: string) {
        const posting = await this.prisma.posting.findUnique({
            where: { id: postingId },
            include: { department: true },
        });

        if (!posting) return [];

        // Fetch based on specific department OR unit type (RO, ZO, HO, Branch)
        const availabilities = await this.prisma.unitAvailability.findMany({
            where: {
                OR: [
                    { deptId: posting.deptId },
                    { unitType: posting.department.type },
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
