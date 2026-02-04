import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import * as os from 'os';

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService) { }

    getSystemUser() {
        try {
            const userInfo = os.userInfo();
            return {
                username: userInfo.username,
                platform: os.platform(),
                homedir: userInfo.homedir
            };
        } catch (error) {
            return { username: 'Unknown', error: error.message };
        }
    }

    private sanitizeDeptData(data: any) {
        // Strict Whitelist Sanitization
        const allowedFields = [
            'code', 'name', 'type', 'subType', 'status', 'parentId',
            'statutoryBasis', 'establishmentOrderRef', 'dateOfEstablishment',
            'geographicalScope', 'peerGroupCode', 'reportingChain',
            'mandateStatement', 'delegationRef', 'powers', 'decisionRights',
            'vetoRights', 'restrictions', 'policiesOwned', 'processesOwned',
            'metricsAccountableFor', 'certificationResponsibility', 'dataRoles',
            'sourceSystems', 'misFrequency', 'misSla', 'dataFreezeTime',
            'revisionPolicy', 'riskCategory', 'inspectionCycle', 'lastInspectionDate',
            'openObservationsCount', 'vigilanceSensitivity', 'regulatoryTouchpoints',
            'linkedCommittees', 'escalationPath', 'exceptionThresholds',
            'canReceiveObligations', 'canIssueObligations', 'obligationCategories',
            'defaultConsequence', 'decisionLogRetentionYears', 'documentRetentionPolicy',
            'auditTrailEnabled', 'inspectionReplayCapable'
        ];

        const s: any = {};
        allowedFields.forEach(f => {
            if (data[f] !== undefined) s[f] = data[f];
        });

        // 1. Handle Dates
        if (s.dateOfEstablishment === '' || !s.dateOfEstablishment) {
            delete s.dateOfEstablishment;
        } else {
            s.dateOfEstablishment = new Date(s.dateOfEstablishment);
        }

        if (s.lastInspectionDate === '' || !s.lastInspectionDate) {
            delete s.lastInspectionDate;
        } else {
            s.lastInspectionDate = new Date(s.lastInspectionDate);
        }

        // 2. Handle Numbers
        if (s.decisionLogRetentionYears !== undefined) {
            s.decisionLogRetentionYears = parseInt(s.decisionLogRetentionYears as any) || 10;
        }
        if (s.openObservationsCount !== undefined) {
            s.openObservationsCount = parseInt(s.openObservationsCount as any) || 0;
        }

        // 3. Handle Optional IDs/Lookups (Empty string to null/undefined)
        if (s.parentId === '') s.parentId = null;

        // 4. Handle Arrays (Strict filtering)
        const arrayFields = ['powers', 'policiesOwned', 'processesOwned', 'metricsAccountableFor', 'obligationCategories', 'dataRoles', 'sourceSystems'];
        arrayFields.forEach(field => {
            if (Array.isArray(s[field])) {
                s[field] = s[field].filter((item: any) => typeof item === 'string' && item.trim() !== '');
            }
        });

        return s;
    }

    // --- Organization Masters ---
    async createDepartment(data: any) {
        const sanitized = this.sanitizeDeptData(data);

        try {
            return await this.prisma.$transaction(async (tx) => {
                const dept = await tx.department.create({ data: sanitized });

                // Automatically create a "Head" office for the new unit
                const tier = (dept.subType === 'CO' || dept.type === 'EXECUTIVE')
                    ? 'TIER_2_EXECUTIVE'
                    : 'TIER_3_EXECUTION';

                await tx.office.create({
                    data: {
                        code: `HEAD-${dept.code}`,
                        name: `Head of ${dept.name}`,
                        tier: tier as any,
                        departmentId: dept.id
                    }
                });

                return dept;
            });
        } catch (error) {
            console.error('CREATE DEPT FAILURE:', error);
            console.error('PAYLOAD:', JSON.stringify(sanitized, null, 2));
            throw error;
        }
    }

    async getDepartments() {
        return this.prisma.department.findMany({
            orderBy: { name: 'asc' },
            include: { parent: true, children: true }
        });
    }

    async updateDepartment(id: string, data: any) {
        const sanitized = this.sanitizeDeptData(data);
        if (sanitized.parentId === undefined) sanitized.parentId = null;

        return this.prisma.department.update({ where: { id }, data: sanitized });
    }

    async deleteDepartment(id: string) {
        const dept = await this.prisma.department.findUnique({
            where: { id },
            include: { children: true, offices: true }
        });

        if (!dept) throw new BadRequestException('Unit not found');

        return this.prisma.$transaction(async (tx) => {
            // 1. Detach child departments (make them roots)
            await tx.department.updateMany({
                where: { parentId: id },
                data: { parentId: null }
            });

            // 2. Cleanup Unit-specific models
            await tx.unitAvailability.deleteMany({ where: { deptId: id } });
            await tx.governanceParameter.deleteMany({ where: { departmentId: id } });

            // 3. Handle Postings (Users assigned to this unit)
            const postings = await tx.posting.findMany({ where: { deptId: id } });
            const pIds = postings.map(p => p.id);
            if (pIds.length > 0) {
                await tx.decisionAudit.deleteMany({ where: { actorPostingId: { in: pIds } } });
                await tx.decision.deleteMany({ where: { initiatorPostingId: { in: pIds } } });
                await tx.posting.deleteMany({ where: { id: { in: pIds } } });
            }

            // 4. Cease linked offices (and their extensive dependencies)
            const linkedOffices = await tx.office.findMany({ where: { departmentId: id } });
            const officeIds = linkedOffices.map(o => o.id);

            if (officeIds.length > 0) {
                await tx.tenure.deleteMany({ where: { officeId: { in: officeIds } } });
                await tx.committeeMembership.deleteMany({ where: { officeId: { in: officeIds } } });
                await tx.obligation.deleteMany({
                    where: { OR: [{ fromOfficeId: { in: officeIds } }, { toOfficeId: { in: officeIds } }] }
                });
                await tx.misReport.deleteMany({ where: { certifyingOfficeId: { in: officeIds } } });
                await tx.resolution.deleteMany({ where: { digitallySignedBy: { in: officeIds } } });
                await tx.office.deleteMany({ where: { departmentId: id } });
            }

            // 5. Finally delete the department
            return tx.department.delete({ where: { id } });
        });
    }

    // --- Designations ---
    async createDesignation(data: any) {
        return this.prisma.designation.create({ data });
    }

    async getDesignations() {
        return this.prisma.designation.findMany({ orderBy: { rank: 'asc' } });
    }

    // --- Users & Postings ---
    async createUser(data: any) {
        return this.prisma.user.create({ data });
    }

    async getUsers() {
        return this.prisma.user.findMany({
            include: {
                postings: {
                    include: {
                        department: true,
                        designation: true,
                        region: true,
                    },
                    where: { status: 'ACTIVE' }
                },
                tenures: {
                    include: { office: true },
                    where: { status: 'ACTIVE' }
                }
            },
            orderBy: { name: 'asc' }
        });
    }

    async assignTenure(data: any) {
        const s = { ...data };
        if (s.startDate) s.startDate = new Date(s.startDate);
        if (s.endDate) s.endDate = new Date(s.endDate);
        return this.prisma.tenure.create({ data: s });
    }

    async assignPosting(data: any) {
        // Handle dates if present
        const s = { ...data };
        if (s.validFrom) s.validFrom = new Date(s.validFrom);
        if (s.validTo) s.validTo = new Date(s.validTo);
        return this.prisma.posting.create({ data: s });
    }

    // --- DoA Rules ---
    async createDoARule(data: any) {
        return this.prisma.doARule.create({ data });
    }

    // --- Stats ---
    async getUnitStats() {
        const [unitCount, officeCount, paramCount] = await Promise.all([
            this.prisma.department.count(),
            this.prisma.office.count(),
            this.prisma.governanceParameter.count()
        ]);

        return {
            units: unitCount,
            offices: officeCount,
            parameters: paramCount
        };
    }
}
