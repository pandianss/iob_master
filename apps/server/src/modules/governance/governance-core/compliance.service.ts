import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';

@Injectable()
export class ComplianceService {
    constructor(private prisma: PrismaService) { }

    async createControl(data: {
        description: string;
        ownerDeptId: string;
        executorRoleId: string;
        reviewerRoleId: string;
        evidenceReq: string;
    }) {
        return this.prisma.control.create({ data });
    }

    async triggerObservation(controlId: string, triggerEvent: string, status: string) {
        const control = await this.prisma.control.findUnique({ where: { id: controlId } });
        if (!control) throw new BadRequestException('Control not found');

        return this.prisma.observation.create({
            data: {
                controlId,
                triggerEvent,
                status,
                escalationLevel: 0,
            },
        });
    }

    async escalateObservation(observationId: string) {
        const observation = await this.prisma.observation.findUnique({
            where: { id: observationId },
            include: { control: true },
        });

        if (!observation) throw new BadRequestException('Observation not found');

        const nextLevel = observation.escalationLevel + 1;

        // Logic to notify owner department or higher authority could go here

        return this.prisma.observation.update({
            where: { id: observationId },
            data: { escalationLevel: nextLevel },
        });
    }

    async resolveObservation(observationId: string, resolutionData: any) {
        return this.prisma.observation.update({
            where: { id: observationId },
            data: { status: 'RESOLVED' },
        });
    }
}
