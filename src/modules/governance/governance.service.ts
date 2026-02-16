
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

    async createContext(data: { decisionTypeName: string; functionalScopeName: string }) {
        const dtCode = data.decisionTypeName.toUpperCase().replace(/\s+/g, '_');
        const fsCode = data.functionalScopeName.toUpperCase().replace(/\s+/g, '_');

        // 1. Ensure Decision Type Exists
        const decisionType = await this.prisma.decisionType.upsert({
            where: { code: dtCode },
            update: {},
            create: { code: dtCode, name: data.decisionTypeName, category: 'ADMIN' }
        });

        // 2. Ensure Functional Scope Exists
        const functionalScope = await this.prisma.functionalScope.upsert({
            where: { code: fsCode },
            update: {},
            create: { code: fsCode, name: data.functionalScopeName }
        });

        // 3. Create a Default Rule so it appears in allowed-contexts
        // We attach it to the first found designation for simplicity (e.g. GM)
        const defaultAuth = await this.prisma.designation.findFirst();
        if (!defaultAuth) {
            // Fallback if no designation exists (unlikely after seed)
            throw new Error('Cannot create default rule: No designations found.');
        }

        return this.prisma.doARule.create({
            data: {
                authorityBodyType: 'DESIGNATION',
                authorityBodyId: defaultAuth.id,
                decisionTypeId: decisionType.id,
                functionalScopeId: functionalScope.id,
                limitMin: 0,
                limitMax: 1000000, // Default 10 Lakhs
            }
        });
    }
}
