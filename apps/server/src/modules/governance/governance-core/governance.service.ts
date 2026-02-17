
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';

@Injectable()
export class GovernanceService {
    constructor(private prisma: PrismaService) { }

    async getParameters() {
        return this.prisma.governanceParameter.findMany({
            orderBy: { category: 'asc' }
        });
    }

    async getDoARules() {
        const rules = await this.prisma.doARule.findMany({
            include: {
                decisionType: true,
                functionalScope: true,
            },
            orderBy: { updatedAt: 'desc' }
        });

        // Convert Decimal types to Number for frontend compatibility
        return rules.map(rule => ({
            ...rule,
            limitMin: rule.limitMin ? Number(rule.limitMin) : 0,
            limitMax: rule.limitMax ? Number(rule.limitMax) : null
        }));
    }

    async createDoARule(data: any) {
        return this.prisma.doARule.create({
            data: {
                authorityBodyType: data.authorityBodyType,
                authorityBodyId: data.authorityBodyId,
                decisionTypeId: data.decisionTypeId,
                functionalScopeId: data.functionalScopeId,
                limitMin: data.limitMin,
                limitMax: data.limitMax,
                currency: data.currency || 'INR',
                requiresEvidence: data.requiresEvidence ?? true,
                isEscalationMandatory: data.isEscalationMandatory ?? false
            }
        });
    }

    async updateDoARule(id: string, data: any) {
        return this.prisma.doARule.update({
            where: { id },
            data: {
                authorityBodyType: data.authorityBodyType,
                authorityBodyId: data.authorityBodyId,
                decisionTypeId: data.decisionTypeId,
                functionalScopeId: data.functionalScopeId,
                limitMin: data.limitMin,
                limitMax: data.limitMax,
                currency: data.currency,
                requiresEvidence: data.requiresEvidence,
                isEscalationMandatory: data.isEscalationMandatory
            }
        });
    }

    async deleteDoARule(id: string) {
        return this.prisma.doARule.delete({
            where: { id }
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

    // Parameter Mappings
    async getMappings() {
        return this.prisma.parameterMapping.findMany({
            include: {
                parameter: true,
                decisionType: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async createMapping(data: any) {
        return this.prisma.parameterMapping.create({
            data: {
                parameterId: data.parameterId,
                decisionTypeId: data.decisionTypeId || null,
                thresholdValue: data.thresholdValue,
                operator: data.operator,
                action: data.action,
                mappingType: data.mappingType || 'DOA',
                frequency: data.frequency || 'ON_DEMAND',
                targetUnitType: data.targetUnitType || 'ALL',
                status: data.status || 'ACTIVE'
            }
        });
    }

    async updateMapping(id: string, data: any) {
        return this.prisma.parameterMapping.update({
            where: { id },
            data: {
                parameterId: data.parameterId,
                decisionTypeId: data.decisionTypeId || null,
                thresholdValue: data.thresholdValue,
                operator: data.operator,
                action: data.action,
                mappingType: data.mappingType,
                frequency: data.frequency,
                targetUnitType: data.targetUnitType,
                status: data.status
            }
        });
    }

    async deleteMapping(id: string) {
        return this.prisma.parameterMapping.delete({
            where: { id }
        });
    }

    // Helper methods for UI dropdowns
    async getDecisionTypes() {
        return this.prisma.decisionType.findMany({ orderBy: { name: 'asc' } });
    }

    async getFunctionalScopes() {
        return this.prisma.functionalScope.findMany({ orderBy: { name: 'asc' } });
    }

    async getDesignations() {
        return this.prisma.designation.findMany({ orderBy: { rank: 'asc' } });
    }
}
