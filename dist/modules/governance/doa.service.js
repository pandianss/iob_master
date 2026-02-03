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
        const rule = await this.resolveRule(authorityBodyType, authorityBodyId, decisionTypeId, functionalScopeId);
        if (!rule) {
            throw new common_1.ForbiddenException('No authority rule found for this context.');
        }
        if (rule.limitMin && amount < Number(rule.limitMin)) {
            throw new common_1.ForbiddenException(`Amount is below the minimum threshold of ${rule.limitMin}`);
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
        if (!applicableRule) {
            return rules[rules.length - 1] || null;
        }
        return applicableRule;
    }
    async fetchAllowedContexts(postingId) {
        const posting = await this.prisma.posting.findUnique({
            where: { id: postingId },
            include: { department: true },
        });
        if (!posting)
            return [];
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