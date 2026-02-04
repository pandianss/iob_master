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
                const tier = (dept.subType === 'CO' || dept.type === 'EXECUTIVE')
                    ? 'TIER_2_EXECUTIVE'
                    : 'TIER_3_EXECUTION';
                await tx.office.create({
                    data: {
                        code: `HEAD-${dept.code}`,
                        name: `Head of ${dept.name}`,
                        tier: tier,
                        departmentId: dept.id
                    }
                });
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
            const postings = await tx.posting.findMany({ where: { deptId: id } });
            const pIds = postings.map(p => p.id);
            if (pIds.length > 0) {
                await tx.decisionAudit.deleteMany({ where: { actorPostingId: { in: pIds } } });
                await tx.decision.deleteMany({ where: { initiatorPostingId: { in: pIds } } });
                await tx.posting.deleteMany({ where: { id: { in: pIds } } });
            }
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
            return tx.department.delete({ where: { id } });
        });
    }
    async createDesignation(data) {
        return this.prisma.designation.create({ data });
    }
    async getDesignations() {
        return this.prisma.designation.findMany({ orderBy: { rank: 'asc' } });
    }
    async createUser(data) {
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