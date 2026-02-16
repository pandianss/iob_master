"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
const os = __importStar(require("os"));
let AdminService = class AdminService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    getSystemUser() {
        try {
            const userInfo = os.userInfo();
            return {
                username: userInfo.username,
                platform: os.platform(),
                homedir: userInfo.homedir
            };
        }
        catch (error) {
            return { username: 'Unknown', error: error.message };
        }
    }
    sanitizeDeptData(data) {
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
        const s = {};
        allowedFields.forEach(f => {
            if (data[f] !== undefined)
                s[f] = data[f];
        });
        if (s.dateOfEstablishment === '' || !s.dateOfEstablishment) {
            delete s.dateOfEstablishment;
        }
        else {
            s.dateOfEstablishment = new Date(s.dateOfEstablishment);
        }
        if (s.lastInspectionDate === '' || !s.lastInspectionDate) {
            delete s.lastInspectionDate;
        }
        else {
            s.lastInspectionDate = new Date(s.lastInspectionDate);
        }
        if (s.decisionLogRetentionYears !== undefined) {
            s.decisionLogRetentionYears = parseInt(s.decisionLogRetentionYears) || 10;
        }
        if (s.openObservationsCount !== undefined) {
            s.openObservationsCount = parseInt(s.openObservationsCount) || 0;
        }
        if (s.parentId === '')
            s.parentId = null;
        const arrayFields = ['powers', 'policiesOwned', 'processesOwned', 'metricsAccountableFor', 'obligationCategories', 'dataRoles', 'sourceSystems'];
        arrayFields.forEach(field => {
            if (Array.isArray(s[field])) {
                s[field] = s[field].filter((item) => typeof item === 'string' && item.trim() !== '');
            }
        });
        return s;
    }
    async createDepartment(data) {
        const sanitized = this.sanitizeDeptData(data);
        try {
            return await this.prisma.$transaction(async (tx) => {
                const dept = await tx.department.create({ data: sanitized });
                let officeName = `Head of ${dept.name}`;
                let officeCode = `HEAD-${dept.code}`;
                const tier = 'TIER_3_EXECUTION';
                if (dept.type === 'BRANCH') {
                    officeName = `Branch Manager - ${dept.name}`;
                    officeCode = `BM-${dept.code}`;
                }
                else if (dept.name.toUpperCase().includes('LPC') || dept.subType === 'LPC') {
                    officeName = `Head - ${dept.name}`;
                    officeCode = `LPC-${dept.code}`;
                }
                else if (dept.type === 'FUNCTIONAL') {
                    officeName = dept.name.endsWith(' Department') ? `Head of ${dept.name}` : `Head of ${dept.name} Department`;
                    officeCode = `DEPT-${dept.code}`;
                }
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
                            vetoPower: true
                        }
                    });
                }
                return dept;
            });
        }
        catch (error) {
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
    async updateDepartment(id, data) {
        const sanitized = this.sanitizeDeptData(data);
        if (sanitized.parentId === undefined)
            sanitized.parentId = null;
        if (sanitized.code) {
            const existing = await this.prisma.department.findUnique({
                where: { code: sanitized.code }
            });
            if (existing && existing.id !== id) {
                throw new common_1.BadRequestException(`Unit Code '${sanitized.code}' is already assigned to another institutional object.`);
            }
        }
        return this.prisma.department.update({ where: { id }, data: sanitized });
    }
    async deleteDepartment(id) {
        const dept = await this.prisma.department.findUnique({
            where: { id },
            include: { children: true, offices: true }
        });
        if (!dept)
            throw new common_1.BadRequestException('Unit not found');
        return this.prisma.$transaction(async (tx) => {
            await tx.department.updateMany({
                where: { parentId: id },
                data: { parentId: null }
            });
            await tx.unitAvailability.deleteMany({ where: { deptId: id } });
            await tx.governanceParameter.deleteMany({ where: { departmentId: id } });
            const postings = await tx.posting.findMany({
                where: { departments: { some: { id } } }
            });
            const pIds = postings.map(p => p.id);
            if (pIds.length > 0) {
                await tx.decisionAudit.deleteMany({ where: { actorPostingId: { in: pIds } } });
                await tx.decision.deleteMany({ where: { initiatorPostingId: { in: pIds } } });
                await tx.posting.deleteMany({ where: { id: { in: pIds } } });
            }
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
            return tx.department.delete({ where: { id } });
        });
    }
    async getRegions() {
        return this.prisma.region.findMany({ orderBy: { name: 'asc' } });
    }
    async createRegion(data) {
        const count = await this.prisma.region.count();
        if (count > 0)
            throw new Error('Only one Regional Master can exist.');
        const region = await this.prisma.region.create({ data });
        await this.syncRootRO(region);
        return region;
    }
    async updateRegion(id, data) {
        const region = await this.prisma.region.update({ where: { id }, data });
        await this.syncRootRO(region);
        return region;
    }
    async deleteRegion(id) {
        return this.prisma.$transaction(async (tx) => {
            const postings = await tx.posting.findMany({ where: { regionId: id } });
            const pIds = postings.map(p => p.id);
            if (pIds.length > 0) {
                await tx.decisionAudit.deleteMany({ where: { actorPostingId: { in: pIds } } });
                await tx.decision.deleteMany({ where: { initiatorPostingId: { in: pIds } } });
                await tx.posting.deleteMany({ where: { id: { in: pIds } } });
            }
            const res = await tx.region.delete({ where: { id } });
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
    async syncRootRO(region) {
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
            }
            else {
                const newDept = await this.prisma.department.create({ data });
                targetDeptId = newDept.id;
            }
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
                }
                else {
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
    async createDesignation(data) {
        return this.prisma.designation.create({ data });
    }
    async getDesignations() {
        return this.prisma.designation.findMany({ orderBy: { rank: 'desc' } });
    }
    async updateDesignation(id, data) {
        return this.prisma.designation.update({ where: { id }, data });
    }
    async deleteDesignation(id) {
        return this.prisma.designation.delete({ where: { id } });
    }
    async createUser(data) {
        const { officeId, officeIds, deptId, deptIds, designationId, regionId, assignmentDate, tenureStartDate, postingLevel, ...userData } = data;
        const targetDeptIds = deptIds || (deptId ? [deptId] : []);
        const targetOfficeIds = officeIds || (officeId ? [officeId] : []);
        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({ data: userData });
            if (targetDeptIds.length > 0 && designationId && regionId) {
                await tx.posting.create({
                    data: {
                        userId: user.id,
                        departments: { connect: targetDeptIds.map((id) => ({ id })) },
                        designationId,
                        regionId,
                        status: 'ACTIVE',
                        validFrom: (assignmentDate && !isNaN(Date.parse(assignmentDate))) ? new Date(assignmentDate) : new Date()
                    }
                });
            }
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
    async updateUser(id, data) {
        const { officeId, officeIds, deptId, deptIds, designationId, regionId, assignmentDate, tenureStartDate, postingLevel, ...userData } = data;
        const targetDeptIds = deptIds || (deptId ? [deptId] : []);
        const targetOfficeIds = officeIds || (officeId ? [officeId] : []);
        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.update({ where: { id }, data: userData });
            if (targetDeptIds.length > 0 && designationId && regionId) {
                const currentPosting = await tx.posting.findFirst({
                    where: { userId: id, status: 'ACTIVE' },
                    include: { departments: true }
                });
                const currentDeptIds = currentPosting?.departments.map(d => d.id) || [];
                const isDeptMatching = currentDeptIds.length === targetDeptIds.length &&
                    targetDeptIds.every(id => currentDeptIds.includes(id));
                if (!currentPosting || !isDeptMatching || currentPosting.designationId !== designationId || currentPosting.regionId !== regionId) {
                    await tx.posting.updateMany({
                        where: { userId: id, status: 'ACTIVE' },
                        data: { status: 'PAST', validTo: new Date() }
                    });
                    await tx.posting.create({
                        data: {
                            userId: id,
                            departments: { connect: targetDeptIds.map((id) => ({ id })) },
                            designationId,
                            regionId,
                            status: 'ACTIVE',
                            validFrom: (assignmentDate && !isNaN(Date.parse(assignmentDate))) ? new Date(assignmentDate) : new Date()
                        }
                    });
                }
                else if (currentPosting && assignmentDate && !isNaN(Date.parse(assignmentDate))) {
                    await tx.posting.update({
                        where: { id: currentPosting.id },
                        data: { validFrom: new Date(assignmentDate) }
                    });
                }
            }
            if (targetOfficeIds.length > 0) {
                const currentTenures = await tx.tenure.findMany({
                    where: { userId: id, status: 'ACTIVE' }
                });
                const currentOfficeIds = currentTenures.map(t => t.officeId);
                const toDeactivate = currentTenures.filter(t => !targetOfficeIds.includes(t.officeId));
                if (toDeactivate.length > 0) {
                    await tx.tenure.updateMany({
                        where: { id: { in: toDeactivate.map(t => t.id) } },
                        data: { status: 'PAST', endDate: new Date() }
                    });
                }
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
                if (tenureStartDate && !isNaN(Date.parse(tenureStartDate))) {
                    const existingActiveToUpdate = currentTenures.filter(t => targetOfficeIds.includes(t.officeId));
                    if (existingActiveToUpdate.length > 0) {
                        await tx.tenure.updateMany({
                            where: { id: { in: existingActiveToUpdate.map(t => t.id) } },
                            data: { startDate: new Date(tenureStartDate) }
                        });
                    }
                }
            }
            else if (data.hasOwnProperty('officeIds') || data.hasOwnProperty('officeId')) {
                await tx.tenure.updateMany({
                    where: { userId: id, status: 'ACTIVE' },
                    data: { status: 'PAST', endDate: new Date() }
                });
            }
            return user;
        });
    }
    async cleanupUserRoles(userId) {
        return this.prisma.$transaction(async (tx) => {
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
            const activeTenures = await tx.tenure.findMany({
                where: { userId, status: 'ACTIVE' },
                orderBy: { startDate: 'desc' }
            });
            if (activeTenures.length > 1) {
                const seenOffices = new Set();
                const toDeactivate = [];
                activeTenures.forEach(t => {
                    if (seenOffices.has(t.officeId)) {
                        toDeactivate.push(t.id);
                    }
                    else {
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
    async deleteUser(id) {
        try {
            return await this.prisma.$transaction(async (tx) => {
                await tx.tenure.deleteMany({ where: { userId: id } });
                await tx.posting.deleteMany({ where: { userId: id } });
                return tx.user.delete({ where: { id } });
            });
        }
        catch (error) {
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
    async assignTenure(data) {
        const s = { ...data };
        if (s.startDate)
            s.startDate = new Date(s.startDate);
        if (s.endDate)
            s.endDate = new Date(s.endDate);
        return this.prisma.tenure.create({ data: s });
    }
    async assignPosting(data) {
        const s = { ...data };
        if (s.validFrom)
            s.validFrom = new Date(s.validFrom);
        if (s.validTo)
            s.validTo = new Date(s.validTo);
        return this.prisma.posting.create({ data: s });
    }
    async deletePosting(id) {
        return this.prisma.posting.delete({ where: { id } });
    }
    async deleteTenure(id) {
        return this.prisma.tenure.delete({ where: { id } });
    }
    async createDoARule(data) {
        return this.prisma.doARule.create({ data });
    }
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
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map