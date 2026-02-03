import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService) { }

    // --- Organization Masters ---
    async createDepartment(data: { code: string; name: string; type: string; subType?: string; parentId?: string }) {
        return this.prisma.department.create({ data });
    }

    async getDepartments() {
        return this.prisma.department.findMany({
            orderBy: { name: 'asc' },
            include: { parent: true, children: true }
        });
    }

    async updateDepartment(id: string, data: Partial<{ name: string; status: string; parentId: string; subType: string }>) {
        return this.prisma.department.update({ where: { id }, data });
    }

    // --- Designations ---
    async createDesignation(data: { title: string; rank: number; roleAbstraction: string }) {
        return this.prisma.designation.create({ data });
    }

    async getDesignations() {
        return this.prisma.designation.findMany({ orderBy: { rank: 'asc' } });
    }

    // --- Users & Postings ---
    async createUser(data: { identityRef: string; name: string; email: string }) {
        return this.prisma.user.create({ data });
    }

    async assignPosting(data: { userId: string; deptId: string; regionId: string; designationId: string }) {
        // Determine active status: A user can only have one active posting? 
        // For now, prompt says multiple allowed, but we might want to check constraints.
        return this.prisma.posting.create({
            data: {
                ...data,
                status: 'ACTIVE'
            }
        });
    }

    // --- DoA Rules ---
    async createDoARule(data: {
        authorityBodyType: 'DESIGNATION' | 'COMMITTEE';
        authorityBodyId: string;
        decisionTypeId: string;
        functionalScopeId: string;
        limitMin?: number;
        limitMax?: number;
    }) {
        return this.prisma.doARule.create({
            data: {
                ...data,
                limitMin: data.limitMin ? Number(data.limitMin) : undefined,
                limitMax: data.limitMax ? Number(data.limitMax) : undefined,
            }
        });
    }
}
