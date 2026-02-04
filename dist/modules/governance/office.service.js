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
            include: { department: true }
        });
    }
    async findByCode(code) {
        return this.prisma.office.findUnique({
            where: { code },
            include: { department: true }
        });
    }
    async getActiveTenure(userId) {
        const tenure = await this.prisma.tenure.findFirst({
            where: {
                userId: userId,
                status: 'ACTIVE',
                OR: [
                    { endDate: null },
                    { endDate: { gt: new Date() } }
                ]
            },
            include: { office: { include: { department: true } } }
        });
        return tenure;
    }
    async getHierarchy(officeId) {
        const office = await this.prisma.office.findUnique({
            where: { id: officeId },
            include: { department: true }
        });
        if (!office)
            throw new common_1.NotFoundException('Office not found');
        return office;
    }
    async create(data) {
        return this.prisma.office.create({ data });
    }
    async update(id, data) {
        return this.prisma.office.update({ where: { id }, data });
    }
    async delete(id) {
        const activeTenures = await this.prisma.tenure.count({
            where: { officeId: id, status: 'ACTIVE' }
        });
        if (activeTenures > 0) {
            throw new Error('Cannot delete office with active occupants. Reassign or end tenures first.');
        }
        return this.prisma.office.delete({ where: { id } });
    }
};
exports.OfficeService = OfficeService;
exports.OfficeService = OfficeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OfficeService);
//# sourceMappingURL=office.service.js.map