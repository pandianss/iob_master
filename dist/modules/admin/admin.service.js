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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
let AdminService = class AdminService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createDepartment(data) {
        return this.prisma.department.create({ data });
    }
    async getDepartments() {
        return this.prisma.department.findMany({
            orderBy: { name: 'asc' },
            include: { parent: true, children: true }
        });
    }
    async updateDepartment(id, data) {
        return this.prisma.department.update({ where: { id }, data });
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
    async assignPosting(data) {
        return this.prisma.posting.create({
            data: {
                ...data,
                status: 'ACTIVE'
            }
        });
    }
    async createDoARule(data) {
        return this.prisma.doARule.create({
            data: {
                ...data,
                limitMin: data.limitMin ? Number(data.limitMin) : undefined,
                limitMax: data.limitMax ? Number(data.limitMax) : undefined,
            }
        });
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map