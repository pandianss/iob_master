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
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async getInboxStats(userIdentityRef) {
        const pending = await this.getPendingApprovals(userIdentityRef);
        const escalated = await this.prisma.decision.count({
            where: {
                status: 'ESCALATED',
                initiatorPosting: { user: { identityRef: userIdentityRef } }
            }
        });
        return {
            pending: pending.length,
            escalated
        };
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
    async getBusinessSnapshot(date) {
        const types = [
            'KEY_BUSINESS_PARAM', 'BULK_DEPOSIT', 'CORE_AGRI',
            'ADVANCES_VERTICAL', 'CASH_MANAGEMENT', 'ACCOUNT_OPENING',
            'ACCOUNTS_CLOSED', 'PROFIT_LOSS', 'RECOVERY_FLASH'
        ];
        const snapshot = {
            date: date || new Date(),
            deposits: { total: 0, savings: 0, current: 0, term: 0, bulk: 0, bulkCount: 0 },
            advances: {
                total: 0,
                agri: 0,
                retail: 0,
                msme: 0,
                jewel: 0,
                corporate: 0,
                sectoral: {}
            },
            assetQuality: {
                openingNpa: 0,
                closingNpa: 0,
                recovery: 0,
                slippage: 0,
                endLevelNpa: 0
            },
            performance: { netProfit: 0 },
            operations: { excessCash: 0, atmCash: 0, accountGrowth: 0 },
            metadata: { lastUpdates: {} }
        };
        const targetDate = date ? new Date(date) : undefined;
        for (const type of types) {
            const latestBatch = await this.prisma.ingestionBatch.findFirst({
                where: {
                    fileType: type,
                    status: 'COMPLETED',
                    snapshotDate: targetDate ? { lte: targetDate } : undefined
                },
                orderBy: [
                    { snapshotDate: 'desc' },
                    { uploadedAt: 'desc' }
                ],
                include: { records: true }
            });
            if (!latestBatch)
                continue;
            snapshot.metadata.lastUpdates[type] = latestBatch.snapshotDate;
            latestBatch.records.forEach(record => {
                const data = record.data;
                switch (type) {
                    case 'KEY_BUSINESS_PARAM':
                        snapshot.deposits.savings += (Number(data['Savings Bank']) || 0);
                        snapshot.deposits.current += (Number(data['Current Deposits']) || 0);
                        snapshot.deposits.term += (Number(data['Term Deposits']) || 0);
                        break;
                    case 'BULK_DEPOSIT':
                        snapshot.deposits.bulk += (Number(data['BALANCE']) || 0);
                        snapshot.deposits.bulkCount++;
                        break;
                    case 'CORE_AGRI':
                        snapshot.advances.agri += (Number(data['TOTAL BALANCE(In Crores)']) || 0);
                        break;
                    case 'ADVANCES_VERTICAL':
                        const priorityType = String(data['PRIORITY_TYPE'] || '').toUpperCase();
                        const schmCode = String(data['SCHM_CODE'] || '').toUpperCase();
                        const glCode = String(data['GL_SUB_CD'] || data['GL_SUB_CD_1'] || '');
                        const balance = Number(data['NET_BALANCE']) || 0;
                        let handled = false;
                        if (schmCode.startsWith('JL')) {
                            snapshot.advances.jewel += balance;
                            handled = true;
                        }
                        else if (priorityType === 'RETAIL') {
                            snapshot.advances.retail += balance;
                            handled = true;
                        }
                        else if (priorityType === 'SME' || priorityType === 'MSME') {
                            snapshot.advances.msme += balance;
                            handled = true;
                        }
                        if (!handled) {
                            snapshot.advances.corporate += balance;
                        }
                        if (['33750', '33850', '33950', '33999'].includes(glCode)) {
                            snapshot.assetQuality.endLevelNpa += balance;
                        }
                        const sector = data['PRIORITY_TYPE'] || 'OTHERS';
                        snapshot.advances.sectoral[sector] = (snapshot.advances.sectoral[sector] || 0) + balance;
                        break;
                    case 'CASH_MANAGEMENT':
                        snapshot.operations.excessCash += (Number(data['Excess Cash']) || 0);
                        snapshot.operations.atmCash += (Number(data['ATM Cash']) || 0);
                        break;
                    case 'ACCOUNT_OPENING':
                        snapshot.operations.accountGrowth++;
                        break;
                    case 'ACCOUNTS_CLOSED':
                        snapshot.operations.accountGrowth--;
                        break;
                    case 'PROFIT_LOSS':
                        const pl = Number(data['P & L']) || Number(data['P & L (Amount is in Lakhs)']) || 0;
                        snapshot.performance.netProfit += pl;
                        break;
                    case 'RECOVERY_FLASH':
                        snapshot.assetQuality.openingNpa += (Number(data['Opening NPA']) || 0);
                        snapshot.assetQuality.closingNpa += (Number(data['Closing NPA']) || 0);
                        snapshot.assetQuality.recovery += (Number(data['Cash Recovery']) || 0);
                        snapshot.assetQuality.slippage += (Number(data['Slippage']) || 0);
                        break;
                }
            });
        }
        snapshot.deposits.total = snapshot.deposits.savings + snapshot.deposits.current + snapshot.deposits.term;
        snapshot.deposits.retail = Math.max(0, snapshot.deposits.term - snapshot.deposits.bulk);
        snapshot.advances.total = snapshot.advances.retail +
            snapshot.advances.agri +
            snapshot.advances.msme +
            snapshot.advances.corporate +
            snapshot.advances.jewel;
        snapshot.deposits.casaRatio = snapshot.deposits.total > 0
            ? ((snapshot.deposits.savings + snapshot.deposits.current) / snapshot.deposits.total * 100).toFixed(2)
            : 0;
        snapshot.metadata.cdRatio = snapshot.deposits.total > 0
            ? Number((snapshot.advances.total / snapshot.deposits.total * 100).toFixed(2))
            : 0;
        snapshot.metadata.totalBusinessMix = snapshot.deposits.total + snapshot.advances.total;
        return snapshot;
    }
    async getComparisonSnapshot(dates) {
        const [snapT, snapT1, snapMonth, snapFY, snapFYStart] = await Promise.all([
            this.getBusinessSnapshot(dates.t),
            this.getBusinessSnapshot(dates.tMinus1),
            this.getBusinessSnapshot(dates.monthEnd),
            this.getBusinessSnapshot(dates.fyEnd),
            this.getBusinessSnapshot(dates.fyStart)
        ]);
        const targets = await this.prisma.reportingTarget.findMany({
            where: {
                targetDate: { gte: dates.monthEnd }
            }
        });
        return {
            snapshots: { t: snapT, tMinus1: snapT1, monthEnd: snapMonth, fyEnd: snapFY, fyStart: snapFYStart },
            targets: targets.reduce((acc, curr) => {
                if (!acc[curr.metric])
                    acc[curr.metric] = {};
                acc[curr.metric][curr.timeframe] = curr.targetValue;
                return acc;
            }, {})
        };
    }
    async saveTarget(data) {
        return this.prisma.reportingTarget.upsert({
            where: {
                metric_timeframe_targetDate: {
                    metric: data.metric,
                    timeframe: data.timeframe,
                    targetDate: new Date(data.targetDate)
                }
            },
            update: { targetValue: data.targetValue },
            create: {
                metric: data.metric,
                timeframe: data.timeframe,
                targetValue: data.targetValue,
                targetDate: new Date(data.targetDate)
            }
        });
    }
};
exports.ReportingService = ReportingService;
exports.ReportingService = ReportingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportingService);
//# sourceMappingURL=reporting.service.js.map