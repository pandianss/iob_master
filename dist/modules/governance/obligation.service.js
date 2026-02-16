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
exports.ObligationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
let ObligationService = class ObligationService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        try {
            const data = await this.prisma.obligation.create({
                data: {
                    title: dto.title,
                    description: dto.description,
                    originType: dto.originType || 'MANUAL',
                    fromOfficeId: dto.fromOfficeId,
                    toOfficeId: dto.toOfficeId,
                    deadline: new Date(dto.deadline),
                    status: 'PENDING'
                }
            });
            return { success: true, data };
        }
        catch (error) {
            console.error('Obligation Creation Error', error);
            return { success: false, reason: 'SYSTEM_ERROR' };
        }
    }
    async findAllForOffice(officeId) {
        return this.prisma.obligation.findMany({
            where: {
                OR: [
                    { toOfficeId: officeId },
                    { fromOfficeId: officeId }
                ]
            },
            include: {
                fromOffice: true,
                toOffice: true
            },
            orderBy: { deadline: 'asc' }
        });
    }
    async certify(id, officeId) {
        try {
            const obligation = await this.prisma.obligation.findUnique({ where: { id } });
            if (!obligation) {
                return { success: false, reason: 'NOT_FOUND' };
            }
            if (obligation.toOfficeId !== officeId) {
                return { success: false, reason: 'UNAUTHORIZED' };
            }
            if (obligation.status === 'CERTIFIED') {
                return { success: false, reason: 'ALREADY_COMPLETED' };
            }
            const updated = await this.prisma.obligation.update({
                where: { id },
                data: { status: 'CERTIFIED' }
            });
            return { success: true, data: updated };
        }
        catch (error) {
            console.error('Obligation Certification Error', error);
            return { success: false, reason: 'SYSTEM_ERROR' };
        }
    }
};
exports.ObligationService = ObligationService;
exports.ObligationService = ObligationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ObligationService);
//# sourceMappingURL=obligation.service.js.map