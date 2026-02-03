import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    createDept(body: any): Promise<{
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
    getDepts(): Promise<({
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
    updateDept(id: string, body: any): Promise<{
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
    createDesg(body: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        rank: number;
        roleAbstraction: string;
    }>;
    getDesgs(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        rank: number;
        roleAbstraction: string;
    }[]>;
    createUser(body: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        identityRef: string;
        email: string;
    }>;
    assignPosting(body: any): Promise<{
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
    createRule(body: any): Promise<{
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
