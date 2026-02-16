import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

export interface ObligationResult {
    success: boolean;
    reason?: 'NOT_FOUND' | 'UNAUTHORIZED' | 'ALREADY_COMPLETED' | 'SYSTEM_ERROR';
    data?: any;
}

@Injectable()
export class ObligationService {
    constructor(private prisma: PrismaService) { }

    async create(dto: {
        title: string;
        description: string;
        originType: string;
        fromOfficeId: string;
        toOfficeId: string;
        deadline: Date | string;
    }) {
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
        } catch (error) {
            console.error('Obligation Creation Error', error);
            return { success: false, reason: 'SYSTEM_ERROR' };
        }
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

    async certify(id: string, officeId: string): Promise<ObligationResult> {
        try {
            const obligation = await this.prisma.obligation.findUnique({ where: { id } });

            if (!obligation) {
                return { success: false, reason: 'NOT_FOUND' };
            }

            // Strict Authority Check: Only the assignee (toOffice) can certify completion
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
        } catch (error) {
            console.error('Obligation Certification Error', error);
            return { success: false, reason: 'SYSTEM_ERROR' };
        }
    }
}
