
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { Office, Tenure } from '@prisma/client';

@Injectable()
export class OfficeService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.office.findMany({
            include: { department: true }
        });
    }

    async findByCode(code: string) {
        return this.prisma.office.findUnique({
            where: { code },
            include: { department: true }
        });
    }

    async getActiveTenure(userId: string): Promise<Tenure & { office: Office } | null> {
        // Find the active tenure for a user
        // Logic: endDate is null OR endDate > Now
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

    async getHierarchy(officeId: string) {
        const office = await this.prisma.office.findUnique({
            where: { id: officeId },
            include: { department: true }
        });
        if (!office) throw new NotFoundException('Office not found');
        return office;
    }

    async create(data: { code: string; name: string; tier: any; departmentId?: string; vetoPower?: boolean }) {
        return this.prisma.office.create({ data });
    }

    async update(id: string, data: any) {
        return this.prisma.office.update({ where: { id }, data });
    }

    async delete(id: string) {
        // Check for active tenures
        const activeTenures = await this.prisma.tenure.count({
            where: { officeId: id, status: 'ACTIVE' }
        });
        if (activeTenures > 0) {
            throw new Error('Cannot delete office with active occupants. Reassign or end tenures first.');
        }

        return this.prisma.office.delete({ where: { id } });
    }
}
