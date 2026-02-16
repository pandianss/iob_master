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
exports.OfficeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
let OfficeService = class OfficeService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.office.findMany({
            include: { departments: true }
        });
    }
    async findByCode(code) {
        try {
            const office = await this.prisma.office.findUnique({
                where: { code },
                include: { departments: true }
            });
            if (!office)
                return { success: false, reason: 'NOT_FOUND' };
            return { success: true, data: office };
        }
        catch (error) {
            return { success: false, reason: 'SYSTEM_ERROR' };
        }
    }
    async getActiveTenure(userId) {
        return this.prisma.tenure.findFirst({
            where: {
                userId: userId,
                status: 'ACTIVE',
                OR: [
                    { endDate: null },
                    { endDate: { gt: new Date() } }
                ]
            },
            include: { office: { include: { departments: true } } }
        });
    }
    async getHierarchy(officeId) {
        try {
            const office = await this.prisma.office.findUnique({
                where: { id: officeId },
                include: { departments: true }
            });
            if (!office)
                return { success: false, reason: 'NOT_FOUND' };
            return { success: true, data: office };
        }
        catch (error) {
            return { success: false, reason: 'SYSTEM_ERROR' };
        }
    }
    async create(data) {
        try {
            if (data.authorityLine === '1st' && data.deptIds && data.deptIds.length > 0) {
                const existingFirst = await this.prisma.office.findFirst({
                    where: {
                        departments: { some: { id: { in: data.deptIds } } },
                        authorityLine: '1st'
                    }
                });
                if (existingFirst) {
                    return { success: false, reason: 'SYSTEM_ERROR', message: 'A 1st Line Head already exists for one of the selected units.' };
                }
            }
            let officeCode = data.code;
            if (!officeCode) {
                const slug = data.name.toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                const randomSuffix = Math.floor(1000 + Math.random() * 9000);
                officeCode = `${slug}-${randomSuffix}`;
            }
            const office = await this.prisma.office.create({
                data: {
                    code: officeCode,
                    name: data.name,
                    tier: data.tier,
                    departments: data.deptIds ? {
                        connect: data.deptIds.map(id => ({ id }))
                    } : undefined,
                    vetoPower: data.vetoPower ?? false,
                    authorityLine: data.authorityLine || '1st'
                }
            });
            return { success: true, data: office };
        }
        catch (error) {
            console.error('Office Create Error', error);
            return { success: false, reason: 'SYSTEM_ERROR' };
        }
    }
    async update(id, data) {
        try {
            if (data.authorityLine === '1st' && data.deptIds && data.deptIds.length > 0) {
                const existingFirst = await this.prisma.office.findFirst({
                    where: {
                        departments: { some: { id: { in: data.deptIds } } },
                        authorityLine: '1st',
                        NOT: { id }
                    }
                });
                if (existingFirst) {
                    return { success: false, reason: 'SYSTEM_ERROR', message: 'A 1st Line Head already exists for one of the selected units.' };
                }
            }
            if (data.code === '') {
                const slug = data.name.toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                const randomSuffix = Math.floor(1000 + Math.random() * 9000);
                data.code = `${slug}-${randomSuffix}`;
            }
            const { deptIds, ...updateData } = data;
            const office = await this.prisma.office.update({
                where: { id },
                data: {
                    ...updateData,
                    departments: deptIds ? {
                        set: deptIds.map((id) => ({ id }))
                    } : undefined
                }
            });
            return { success: true, data: office };
        }
        catch (error) {
            console.error('Office Update Error', error);
            return { success: false, reason: 'SYSTEM_ERROR' };
        }
    }
    async delete(id) {
        try {
            const activeTenures = await this.prisma.tenure.count({
                where: { officeId: id, status: 'ACTIVE' }
            });
            if (activeTenures > 0) {
                return { success: false, reason: 'HAS_ACTIVE_OCCUPANTS' };
            }
            await this.prisma.office.delete({ where: { id } });
            return { success: true };
        }
        catch (error) {
            return { success: false, reason: 'SYSTEM_ERROR' };
        }
    }
};
exports.OfficeService = OfficeService;
exports.OfficeService = OfficeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OfficeService);
//# sourceMappingURL=office.service.js.map