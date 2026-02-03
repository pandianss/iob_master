import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class ReportingService {
    constructor(private prisma: PrismaService) { }

    /**
     * Get decisions pending approval for a specific user based on their active postings.
     * This is key for the "Ledger/Inbox" view.
     */
    async getPendingApprovals(userIdentityRef: string) {
        // 1. Get user's active postings
        const user = await this.prisma.user.findUnique({
            where: { identityRef: userIdentityRef },
            include: {
                postings: {
                    where: { status: 'ACTIVE' },
                    include: { designation: { include: { committeeMembers: true } } }
                }
            }
        });

        if (!user) return [];

        const activeDesignationIds = user.postings.map(p => p.designationId);
        const activeCommitteeIds = user.postings.flatMap(p =>
            p.designation.committeeMembers.map(cm => cm.committeeId)
        );

        // 2. Find decisions pending approval where the Authority matches
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
                authRule: true, // Lineage: Show why this is here
            }
        });
    }

    /**
     * Heatmap of Escalated decisions, grouped by Department.
     * Useful for Board/Central governance to see bottlenecks or policy breaches.
     */
    async getDoABreachStats() {
        const breaches = await this.prisma.decision.groupBy({
            by: ['deptContextId'],
            where: {
                status: 'ESCALATED',
                // In a real scenario, we'd filter by specific escalation reason in outcomeData
            },
            _count: {
                id: true
            }
        });

        return breaches;
    }

    /**
     * Compliance score for a department.
     * Ratio of Resolved vs Open observations.
     */
    async getComplianceScore(deptCode: string) {
        const dept = await this.prisma.department.findUnique({ where: { code: deptCode } });
        if (!dept) return null;

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
        }, {} as Record<string, number>);
    }
}
