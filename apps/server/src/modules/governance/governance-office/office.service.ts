import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';

export interface OfficeResult {
    success: boolean;
    reason?: 'NOT_FOUND' | 'HAS_ACTIVE_OCCUPANTS' | 'SYSTEM_ERROR';
    data?: any;
    message?: string;
}

@Injectable()
export class OfficeService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.office.findMany({
            include: { departments: true }
        });
    }

    async findByCode(code: string): Promise<OfficeResult> {
        try {
            const office = await this.prisma.office.findUnique({
                where: { code },
                include: { departments: true }
            });
            if (!office) return { success: false, reason: 'NOT_FOUND' };
            return { success: true, data: office };
        } catch (error) {
            return { success: false, reason: 'SYSTEM_ERROR' };
        }
    }

    async getActiveTenure(userId: string) {
        // Find the active tenure for a user
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

    async getHierarchy(officeId: string): Promise<OfficeResult> {
        try {
            const office = await this.prisma.office.findUnique({
                where: { id: officeId },
                include: { departments: true }
            });
            if (!office) return { success: false, reason: 'NOT_FOUND' };
            return { success: true, data: office };
        } catch (error) {
            return { success: false, reason: 'SYSTEM_ERROR' };
        }
    }

    async create(data: {
        code?: string;
        name: string;
        tier: any;
        deptIds?: string[];
        vetoPower?: boolean;
        authorityLine?: string;
    }) {
        try {
            // Singularity Validation for 1st Line
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

            // Code Generation Logic
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
        } catch (error) {
            console.error('Office Create Error', error);
            return { success: false, reason: 'SYSTEM_ERROR' };
        }
    }

    async update(id: string, data: any): Promise<OfficeResult> {
        try {
            // Singularity Validation for 1st Line
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

            // Code Generation Logic if empty string provided
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
                        set: deptIds.map((id: string) => ({ id }))
                    } : undefined
                }
            });
            return { success: true, data: office };
        } catch (error) {
            console.error('Office Update Error', error);
            return { success: false, reason: 'SYSTEM_ERROR' };
        }
    }

    async delete(id: string): Promise<OfficeResult> {
        try {
            // Check for active tenures
            const activeTenures = await this.prisma.tenure.count({
                where: { officeId: id, status: 'ACTIVE' }
            });
            if (activeTenures > 0) {
                return { success: false, reason: 'HAS_ACTIVE_OCCUPANTS' };
            }

            await this.prisma.office.delete({ where: { id } });
            return { success: true };
        } catch (error) {
            return { success: false, reason: 'SYSTEM_ERROR' };
        }
    }
}

