import { PrismaService } from '../../common/prisma.service';
export declare class GovernanceService {
    private prisma;
    constructor(prisma: PrismaService);
    getParameters(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        category: string;
        segment: string | null;
        unitLevel: string;
        departmentId: string | null;
    }[]>;
    createParameter(data: {
        code: string;
        name: string;
        category: string;
        segment?: string;
        unitLevel: string;
        departmentId?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        category: string;
        segment: string | null;
        unitLevel: string;
        departmentId: string | null;
    }>;
    updateParameter(id: string, data: Partial<{
        name: string;
        category: string;
        segment: string;
        unitLevel: string;
        departmentId: string;
    }>): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        category: string;
        segment: string | null;
        unitLevel: string;
        departmentId: string | null;
    }>;
    deleteParameter(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        category: string;
        segment: string | null;
        unitLevel: string;
        departmentId: string | null;
    }>;
}
