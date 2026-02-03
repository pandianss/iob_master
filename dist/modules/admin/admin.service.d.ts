import { PrismaService } from '../../common/prisma.service';
export declare class AdminService {
    private prisma;
    constructor(prisma: PrismaService);
    createDepartment(data: {
        code: string;
        name: string;
        type: string;
        subType?: string;
        parentId?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        status: string;
        code: string;
        type: string;
        subType: string | null;
        parentId: string | null;
    }>;
    getDepartments(): Promise<({
        parent: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            status: string;
            code: string;
            type: string;
            subType: string | null;
            parentId: string | null;
        } | null;
        children: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            status: string;
            code: string;
            type: string;
            subType: string | null;
            parentId: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        status: string;
        code: string;
        type: string;
        subType: string | null;
        parentId: string | null;
    })[]>;
    updateDepartment(id: string, data: Partial<{
        name: string;
        status: string;
        parentId: string;
        subType: string;
    }>): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        status: string;
        code: string;
        type: string;
        subType: string | null;
        parentId: string | null;
    }>;
    createDesignation(data: {
        title: string;
        rank: number;
        roleAbstraction: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        rank: number;
        roleAbstraction: string;
    }>;
    getDesignations(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        rank: number;
        roleAbstraction: string;
    }[]>;
    createUser(data: {
        identityRef: string;
        name: string;
        email: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        identityRef: string;
        email: string;
    }>;
    assignPosting(data: {
        userId: string;
        deptId: string;
        regionId: string;
        designationId: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        deptId: string;
        regionId: string;
        designationId: string;
        validFrom: Date;
        validTo: Date | null;
        status: string;
    }>;
    createDoARule(data: {
        authorityBodyType: 'DESIGNATION' | 'COMMITTEE';
        authorityBodyId: string;
        decisionTypeId: string;
        functionalScopeId: string;
        limitMin?: number;
        limitMax?: number;
    }): Promise<{
        id: string;
        authorityBodyType: string;
        authorityBodyId: string;
        decisionTypeId: string;
        functionalScopeId: string;
        limitMin: import("@prisma/client/runtime/library").Decimal | null;
        limitMax: import("@prisma/client/runtime/library").Decimal | null;
        currency: string;
        requiresEvidence: boolean;
        isEscalationMandatory: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
