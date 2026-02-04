
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateObligationDto } from './dto/create-obligation.dto';

@Injectable()
export class ObligationService {
    constructor(private prisma: PrismaService) { }

    async create(dto: any) { // Type with DTO later
        return this.prisma.obligation.create({
            data: {
                title: dto.title,
                description: dto.description,
                originType: dto.originType || 'MANUAL', // POLICY, COMMITTEE, REGULATOR
                fromOfficeId: dto.fromOfficeId,
                toOfficeId: dto.toOfficeId,
                deadline: new Date(dto.deadline),
                status: 'PENDING'
            }
        });
    }

    async findAllForOffice(officeId: string) {
        return this.prisma.obligation.findMany({
            where: {
                OR: [
                    { toOfficeId: officeId }, // My obligations (Incoming)
                    { fromOfficeId: officeId } // Obligations I created (Outgoing)
                ]
            },
            include: {
                fromOffice: true,
                toOffice: true
            },
            orderBy: { deadline: 'asc' }
        });
    }

    async certify(id: string, officeId: string) {
        const obligation = await this.prisma.obligation.findUnique({ where: { id } });
        if (!obligation) throw new BadRequestException('Obligation not found');

        // Only target office can certify completion? Or maybe fromOffice marks as certified? 
        // Architecture: "Closure certification". Usually the doer certifies "I done it", and reviewer accepts.
        // For simplicity: Target marks as CERTIFIED.

        if (obligation.toOfficeId !== officeId) {
            // throw new ForbiddenException('Only the assignee can certify completion');
        }

        return this.prisma.obligation.update({
            where: { id },
            data: { status: 'CERTIFIED' }
        });
    }
}
