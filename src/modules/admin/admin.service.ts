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
            'code', 'name', 'nameHindi', 'nameTamil', 'type', 'subType', 'populationGroup', 'status', 'parentId',
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

                // Automatically create a "Head" office for the new unit based on type
                let officeName = `Head of ${dept.name}`;
                let officeCode = `HEAD-${dept.code}`;
                const tier = 'TIER_3_EXECUTION'; // Default for unit heads

                if (dept.type === 'BRANCH') {
                    officeName = `Branch Manager - ${dept.name}`;
                    officeCode = `BM-${dept.code}`;
                } else if (dept.name.toUpperCase().includes('LPC') || dept.subType === 'LPC') {
                    officeName = `Head - ${dept.name}`;
                    officeCode = `LPC-${dept.code}`;
                } else if (dept.type === 'FUNCTIONAL') {
                    // Avoid "Department Department" if name already ends with it
                    officeName = dept.name.endsWith(' Department') ? `Head of ${dept.name}` : `Head of ${dept.name} Department`;
                    officeCode = `DEPT-${dept.code}`;
                }

                // Check for existing office to avoid duplicates
                const existingOffice = await tx.office.findFirst({
                    where: {
                        departments: { some: { id: dept.id } },
                        authorityLine: '1st'
                    }
                });

                if (!existingOffice) {
                    await tx.office.create({
                        data: {
                            code: officeCode,
                            name: officeName,
                            tier: tier,
                            departments: { connect: { id: dept.id } },
                            authorityLine: '1st',
                            vetoPower: true // Heads generally have veto power
                        }
                    });
                }

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

        // Ensure code uniqueness if it's being changed
        if (sanitized.code) {
            const existing = await this.prisma.department.findUnique({
                where: { code: sanitized.code }
            });
            if (existing && existing.id !== id) {
                throw new BadRequestException(`Unit Code '${sanitized.code}' is already assigned to another institutional object.`);
            }
        }

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
            const postings = await tx.posting.findMany({
                where: { departments: { some: { id } } }
            });
            const pIds = postings.map(p => p.id);
            if (pIds.length > 0) {
                await tx.decisionAudit.deleteMany({ where: { actorPostingId: { in: pIds } } });
                await tx.decision.deleteMany({ where: { initiatorPostingId: { in: pIds } } });
                await tx.posting.deleteMany({ where: { id: { in: pIds } } });
            }

            // 4. Cease linked offices (and their extensive dependencies)
            const linkedOffices = await tx.office.findMany({
                where: { departments: { some: { id } } }
            });
            const officeIds = linkedOffices.map(o => o.id);

            if (officeIds.length > 0) {
                await tx.tenure.deleteMany({ where: { officeId: { in: officeIds } } });
                await tx.committeeMembership.deleteMany({ where: { officeId: { in: officeIds } } });
                await tx.obligation.deleteMany({
                    where: { OR: [{ fromOfficeId: { in: officeIds } }, { toOfficeId: { in: officeIds } }] }
                });
                await tx.misReport.deleteMany({ where: { certifyingOfficeId: { in: officeIds } } });
                await tx.resolution.deleteMany({ where: { digitallySignedBy: { in: officeIds } } });
                await tx.office.deleteMany({
                    where: { departments: { some: { id } } }
                });
            }

            // 5. Finally delete the department
            return tx.department.delete({ where: { id } });
        });
    }

    // --- Regions ---
    async getRegions() {
        return this.prisma.region.findMany({ orderBy: { name: 'asc' } });
    }

    async createRegion(data: any) {
        const count = await this.prisma.region.count();
        if (count > 0) throw new Error('Only one Regional Master can exist.');

        const region = await this.prisma.region.create({ data });
        await this.syncRootRO(region);
        return region;
    }

    async updateRegion(id: string, data: any) {
        const region = await this.prisma.region.update({ where: { id }, data });
        await this.syncRootRO(region);
        return region;
    }

    async deleteRegion(id: string) {
        return this.prisma.$transaction(async (tx) => {
            // 1. Handle Dependent Postings
            const postings = await tx.posting.findMany({ where: { regionId: id } });
            const pIds = postings.map(p => p.id);

            if (pIds.length > 0) {
                // Delete audits where these postings were actors
                await tx.decisionAudit.deleteMany({ where: { actorPostingId: { in: pIds } } });
                // Delete decisions where these postings were initiators
                await tx.decision.deleteMany({ where: { initiatorPostingId: { in: pIds } } });
                // Finally delete the postings themselves
                await tx.posting.deleteMany({ where: { id: { in: pIds } } });
            }

            // 2. Delete the Region
            const res = await tx.region.delete({ where: { id } });

            // 3. Reset the root RO to unconfigured state if it was linked
            await tx.department.updateMany({
                where: { subType: 'RO', parentId: null },
                data: {
                    code: 'UNCONFIGURED-RO',
                    name: 'Regional Office (Unconfigured)',
                    nameHindi: null,
                    nameTamil: null
                }
            });

            return res;
        });
    }

    private async syncRootRO(region: any) {
        // PROACTIVE SYNC: Ensure the root RO department identity is strictly driven by the Region Master
        if (region.status === 'ACTIVE') {
            const rootRO = await this.prisma.department.findFirst({
                where: { subType: 'RO', parentId: null }
            });

            const data = {
                code: region.code,
                name: region.name,
                nameHindi: region.nameHindi,
                nameTamil: region.nameTamil,
                type: 'ADMINISTRATIVE',
                subType: 'RO',
                parentId: null
            };

            let targetDeptId = rootRO ? rootRO.id : null;

            if (rootRO) {
                await this.prisma.department.update({
                    where: { id: rootRO.id },
                    data: {
                        code: data.code,
                        name: data.name,
                        nameHindi: data.nameHindi,
                        nameTamil: data.nameTamil
                    }
                });
            } else {
                const newDept = await this.prisma.department.create({ data });
                targetDeptId = newDept.id;
            }

            // Ensure Regional Head Office Exists
            if (targetDeptId) {
                const officeCode = `RH-${region.code}`;
                const officeName = `Regional Head - ${region.name}`;

                const existingOffice = await this.prisma.office.findFirst({
                    where: {
                        departments: { some: { id: targetDeptId } },
                        authorityLine: '1st'
                    }
                });

                if (!existingOffice) {
                    await this.prisma.office.create({
                        data: {
                            code: officeCode,
                            name: officeName,
                            tier: 'TIER_3_EXECUTION',
                            departments: { connect: { id: targetDeptId } },
                            authorityLine: '1st',
                            vetoPower: true
                        }
                    });
                } else {
                    if (existingOffice.code === officeCode && existingOffice.name !== officeName) {
                        await this.prisma.office.update({
                            where: { id: existingOffice.id },
                            data: { name: officeName }
                        });
                    }
                }
            }
        }
    }

    // --- Designations ---
    async createDesignation(data: any) {
        return this.prisma.designation.create({ data });
    }

    async getDesignations() {
        return this.prisma.designation.findMany({ orderBy: { rank: 'desc' } });
    }

    async updateDesignation(id: string, data: any) {
        return this.prisma.designation.update({ where: { id }, data });
    }

    async deleteDesignation(id: string) {
        return this.prisma.designation.delete({ where: { id } });
    }

    // --- Users & Postings ---
    async createUser(data: any) {
        const { officeId, officeIds, deptId, deptIds, designationId, regionId, assignmentDate, tenureStartDate, postingLevel, ...userData } = data;
        const targetDeptIds = deptIds || (deptId ? [deptId] : []);
        const targetOfficeIds = officeIds || (officeId ? [officeId] : []);

        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({ data: userData });

            // 1. Atomic HR Posting
            if (targetDeptIds.length > 0 && designationId && regionId) {
                await tx.posting.create({
                    data: {
                        userId: user.id,
                        departments: { connect: targetDeptIds.map((id: string) => ({ id })) },
                        designationId,
                        regionId,
                        status: 'ACTIVE',
                        validFrom: (assignmentDate && !isNaN(Date.parse(assignmentDate))) ? new Date(assignmentDate) : new Date()
                    }
                });
            }

            // 2. Optional Governance Tenures
            if (targetOfficeIds.length > 0) {
                for (const oId of targetOfficeIds) {
                    await tx.tenure.create({
                        data: {
                            userId: user.id,
                            officeId: oId,
                            status: 'ACTIVE',
                            startDate: (tenureStartDate && !isNaN(Date.parse(tenureStartDate))) ? new Date(tenureStartDate) : new Date()
                        }
                    });
                }
            }

            return user;
        });
    }

    async updateUser(id: string, data: any) {
        const { officeId, officeIds, deptId, deptIds, designationId, regionId, assignmentDate, tenureStartDate, postingLevel, ...userData } = data;
        const targetDeptIds = deptIds || (deptId ? [deptId] : []);
        const targetOfficeIds = officeIds || (officeId ? [officeId] : []);

        return this.prisma.$transaction(async (tx) => {
            // 1. Update User Details
            const user = await tx.user.update({ where: { id }, data: userData });

            // 2. Handle HR Posting de-duplication
            if (targetDeptIds.length > 0 && designationId && regionId) {
                const currentPosting = await tx.posting.findFirst({
                    where: { userId: id, status: 'ACTIVE' },
                    include: { departments: true }
                });

                const currentDeptIds = currentPosting?.departments.map(d => d.id) || [];
                const isDeptMatching = currentDeptIds.length === targetDeptIds.length &&
                    targetDeptIds.every(id => currentDeptIds.includes(id));

                // Only create new if anything changed
                if (!currentPosting || !isDeptMatching || currentPosting.designationId !== designationId || currentPosting.regionId !== regionId) {
                    await tx.posting.updateMany({
                        where: { userId: id, status: 'ACTIVE' },
                        data: { status: 'PAST', validTo: new Date() }
                    });
                    await tx.posting.create({
                        data: {
                            userId: id,
                            departments: { connect: targetDeptIds.map((id: string) => ({ id })) },
                            designationId,
                            regionId,
                            status: 'ACTIVE',
                            validFrom: (assignmentDate && !isNaN(Date.parse(assignmentDate))) ? new Date(assignmentDate) : new Date()
                        }
                    });
                } else if (currentPosting && assignmentDate && !isNaN(Date.parse(assignmentDate))) {
                    await tx.posting.update({
                        where: { id: currentPosting.id },
                        data: { validFrom: new Date(assignmentDate) }
                    });
                }
            }

            // 3. Handle Tenures (Governance Offices) synchronization
            if (targetOfficeIds.length > 0) {
                const currentTenures = await tx.tenure.findMany({
                    where: { userId: id, status: 'ACTIVE' }
                });

                const currentOfficeIds = currentTenures.map(t => t.officeId);

                // Deactivate tenures not in the new list
                const toDeactivate = currentTenures.filter(t => !targetOfficeIds.includes(t.officeId));
                if (toDeactivate.length > 0) {
                    await tx.tenure.updateMany({
                        where: { id: { in: toDeactivate.map(t => t.id) } },
                        data: { status: 'PAST', endDate: new Date() }
                    });
                }

                // Activate new tenures
                const toActivate = targetOfficeIds.filter(oid => !currentOfficeIds.includes(oid));
                for (const oId of toActivate) {
                    await tx.tenure.create({
                        data: {
                            userId: id,
                            officeId: oId,
                            status: 'ACTIVE',
                            startDate: (tenureStartDate && !isNaN(Date.parse(tenureStartDate))) ? new Date(tenureStartDate) : new Date()
                        }
                    });
                }

                // Update start date for existing active tenures if provided
                if (tenureStartDate && !isNaN(Date.parse(tenureStartDate))) {
                    const existingActiveToUpdate = currentTenures.filter(t => targetOfficeIds.includes(t.officeId));
                    if (existingActiveToUpdate.length > 0) {
                        await tx.tenure.updateMany({
                            where: { id: { in: existingActiveToUpdate.map(t => t.id) } },
                            data: { startDate: new Date(tenureStartDate) }
                        });
                    }
                }
            } else if (data.hasOwnProperty('officeIds') || data.hasOwnProperty('officeId')) {
                // If officeIds was explicitly sent as empty, deactivate all
                await tx.tenure.updateMany({
                    where: { userId: id, status: 'ACTIVE' },
                    data: { status: 'PAST', endDate: new Date() }
                });
            }

            return user;
        });
    }

    async cleanupUserRoles(userId: string) {
        return this.prisma.$transaction(async (tx) => {
            // Cleanup Postings: Keep only the latest ACTIVE one
            const activePostings = await tx.posting.findMany({
                where: { userId, status: 'ACTIVE' },
                orderBy: { validFrom: 'desc' }
            });

            if (activePostings.length > 1) {
                const [keep, ...stale] = activePostings;
                await tx.posting.updateMany({
                    where: { id: { in: stale.map(p => p.id) } },
                    data: { status: 'PAST', validTo: new Date() }
                });
            }

            // Cleanup Tenures: Keep ACTIVE ones (duplicates for SAME office are removed)
            const activeTenures = await tx.tenure.findMany({
                where: { userId, status: 'ACTIVE' },
                orderBy: { startDate: 'desc' }
            });

            if (activeTenures.length > 1) {
                const seenOffices = new Set<string>();
                const toDeactivate: string[] = [];

                activeTenures.forEach(t => {
                    if (seenOffices.has(t.officeId)) {
                        toDeactivate.push(t.id);
                    } else {
                        seenOffices.add(t.officeId);
                    }
                });

                if (toDeactivate.length > 0) {
                    await tx.tenure.updateMany({
                        where: { id: { in: toDeactivate } },
                        data: { status: 'PAST', endDate: new Date() }
                    });
                }
            }

            return { success: true };
        });
    }

    async deleteUser(id: string) {
        try {
            return await this.prisma.$transaction(async (tx) => {
                // Remove associated tenures
                await tx.tenure.deleteMany({ where: { userId: id } });

                // Remove associated postings
                await tx.posting.deleteMany({ where: { userId: id } });

                // Finally delete the user
                return tx.user.delete({ where: { id } });
            });
        } catch (error) {
            console.error(`Failed to delete user ${id}:`, error);
            throw error;
        }
    }

    async getUsers() {
        return this.prisma.user.findMany({
            include: {
                postings: {
                    include: {
                        departments: true,
                        designation: true,
                        region: true,
                    },
                    orderBy: { validFrom: 'desc' }
                },
                tenures: {
                    include: { office: true },
                    orderBy: { startDate: 'desc' }
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

    async deletePosting(id: string) {
        return this.prisma.posting.delete({ where: { id } });
    }

    async deleteTenure(id: string) {
        return this.prisma.tenure.delete({ where: { id } });
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
