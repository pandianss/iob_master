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
exports.GovernanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
let GovernanceService = class GovernanceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getParameters() {
        return this.prisma.governanceParameter.findMany({
            orderBy: { category: 'asc' }
        });
    }
    async findAllowedContexts(postingId) {
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
    async createParameter(data) {
        return this.prisma.governanceParameter.create({ data });
    }
    async updateParameter(id, data) {
        return this.prisma.governanceParameter.update({
            where: { id },
            data
        });
    }
    async deleteParameter(id) {
        return this.prisma.governanceParameter.delete({
            where: { id }
        });
    }
};
exports.GovernanceService = GovernanceService;
exports.GovernanceService = GovernanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GovernanceService);
//# sourceMappingURL=governance.service.js.map