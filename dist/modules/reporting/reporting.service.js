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
exports.ReportingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
let ReportingService = class ReportingService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getPendingApprovals(userIdentityRef) {
        const user = await this.prisma.user.findUnique({
            where: { identityRef: userIdentityRef },
            include: {
                postings: {
                    where: { status: 'ACTIVE' },
                    include: { designation: { include: { committeeMembers: true } } }
                }
            }
        });
        if (!user)
            return [];
        const activeDesignationIds = user.postings.map(p => p.designationId);
        const activeCommitteeIds = user.postings.flatMap(p => p.designation.committeeMembers.map(cm => cm.committeeId));
        return this.prisma.decision.findMany({
            where: {
                status: 'PENDING_APPROVAL',
                authRule: {
                    OR: [
                        {
                            authorityBodyType: 'DESIGNATION',
                            authorityBodyId: { in: activeDesignationIds }
                        },
                        {
                            authorityBodyType: 'COMMITTEE',
                            authorityBodyId: { in: activeCommitteeIds }
                        }
                    ]
                }
            },
            include: {
                initiatorPosting: { include: { user: true, designation: true } },
                authRule: true,
            }
        });
    }
    async getDoABreachStats() {
        const breaches = await this.prisma.decision.groupBy({
            by: ['deptContextId'],
            where: {
                status: 'ESCALATED',
            },
            _count: {
                id: true
            }
        });
        return breaches;
    }
    async getComplianceScore(deptCode) {
        const dept = await this.prisma.department.findUnique({ where: { code: deptCode } });
        if (!dept)
            return null;
        const stats = await this.prisma.observation.groupBy({
            by: ['status'],
            where: {
                control: {
                    ownerDeptId: dept.id
                }
            },
            _count: { id: true }
        });
        return stats.reduce((acc, curr) => {
            acc[curr.status] = curr._count.id;
            return acc;
        }, {});
    }
};
exports.ReportingService = ReportingService;
exports.ReportingService = ReportingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportingService);
//# sourceMappingURL=reporting.service.js.map