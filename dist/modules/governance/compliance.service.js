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
exports.ComplianceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
let ComplianceService = class ComplianceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createControl(data) {
        return this.prisma.control.create({ data });
    }
    async triggerObservation(controlId, triggerEvent, status) {
        const control = await this.prisma.control.findUnique({ where: { id: controlId } });
        if (!control)
            throw new common_1.BadRequestException('Control not found');
        return this.prisma.observation.create({
            data: {
                controlId,
                triggerEvent,
                status,
                escalationLevel: 0,
            },
        });
    }
    async escalateObservation(observationId) {
        const observation = await this.prisma.observation.findUnique({
            where: { id: observationId },
            include: { control: true },
        });
        if (!observation)
            throw new common_1.BadRequestException('Observation not found');
        const nextLevel = observation.escalationLevel + 1;
        return this.prisma.observation.update({
            where: { id: observationId },
            data: { escalationLevel: nextLevel },
        });
    }
    async resolveObservation(observationId, resolutionData) {
        return this.prisma.observation.update({
            where: { id: observationId },
            data: { status: 'RESOLVED' },
        });
    }
};
exports.ComplianceService = ComplianceService;
exports.ComplianceService = ComplianceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ComplianceService);
//# sourceMappingURL=compliance.service.js.map