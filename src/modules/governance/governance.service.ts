
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class GovernanceService {
    constructor(private prisma: PrismaService) { }

    async getParameters() {
        return this.prisma.governanceParameter.findMany({
            orderBy: { category: 'asc' }
        });
    }

    async findAllowedContexts(postingId?: string) {
        // In a real scenario, filter by postingId -> DoA
        // For now, return all active DoA Rules as allowed contexts
        const rules = await this.prisma.doARule.findMany({
            include: {
                decisionType: true,
                functionalScope: true
            }
        });

        return rules.map(rule => ({
            decisionTypeId: rule.decisionTypeId,
            decisionTypeName: rule.decisionType.name,
            functionalScopeId: rule.functionalScopeId,
            functionalScopeName: rule.functionalScope.name,
            category: rule.decisionType.category || 'General'
        }));
    }

    async createParameter(data: { code: string; name: string; category: string; segment?: string; unitLevel: string; departmentId?: string }) {
        return this.prisma.governanceParameter.create({ data });
    }

    async updateParameter(id: string, data: Partial<{ name: string; category: string; segment: string; unitLevel: string; departmentId: string }>) {
        return this.prisma.governanceParameter.update({
            where: { id },
            data
        });
    }

    async deleteParameter(id: string) {
        return this.prisma.governanceParameter.delete({
            where: { id }
        });
    }
}
