"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoAService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
let DoAService = class DoAService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async resolveRule(authorityBodyType, authorityBodyId, decisionTypeId, functionalScopeId) {
        return this.prisma.doARule.findFirst({
            where: {
                authorityBodyType,
                authorityBodyId,
                decisionTypeId,
                functionalScopeId,
            },
        });
    }
    async validateAuthority(authorityBodyType, authorityBodyId, decisionTypeId, functionalScopeId, amount) {
        try {
            const rule = await this.resolveRule(authorityBodyType, authorityBodyId, decisionTypeId, functionalScopeId);
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
        }
        catch (error) {
            console.error('DoA Validation Error', error);
            return { valid: false, reason: 'SYSTEM_ERROR' };
        }
    }
    async canInitiate(postingId, functionalScopeId) {
        const posting = await this.prisma.posting.findUnique({
            where: { id: postingId },
            include: { designation: true },
        });
        if (!posting || posting.status !== 'ACTIVE')
            return false;
        const ruleCount = await this.prisma.doARule.count({
            where: {
                authorityBodyType: 'DESIGNATION',
                authorityBodyId: posting.designationId,
                functionalScopeId,
            },
        });
        return ruleCount > 0;
    }
    async resolveAuthorityBody(decisionTypeId, functionalScopeId, amount) {
        const rules = await this.prisma.doARule.findMany({
            where: {
                decisionTypeId,
                functionalScopeId,
            },
            orderBy: {
                limitMax: 'asc',
            },
        });
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
        return { found: false };
    }
    async fetchAllowedContexts(postingId) {
        const posting = await this.prisma.posting.findUnique({
            where: { id: postingId },
            include: { departments: true },
        });
        if (!posting)
            return [];
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
        return availabilities.map(a => ({
            decisionTypeId: a.decisionTypeId,
            decisionTypeName: a.decisionType.name,
            functionalScopeId: a.functionalScopeId,
            functionalScopeName: a.functionalScope.name,
            category: a.decisionType.category
        }));
    }
};
exports.DoAService = DoAService;
exports.DoAService = DoAService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DoAService);
//# sourceMappingURL=doa.service.js.map