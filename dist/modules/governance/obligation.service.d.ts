import { PrismaService } from '../../common/prisma.service';
export declare class ObligationService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        description: string;
        title: string;
        originType: string;
        originId: string | null;
        deadline: Date;
        escalationLevel: number;
        fromOfficeId: string;
        toOfficeId: string;
    }>;
    findAllForOffice(officeId: string): Promise<({
        fromOffice: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            code: string;
            departmentId: string | null;
            tier: import(".prisma/client").$Enums.OfficeTier;
            vetoPower: boolean;
        };
        toOffice: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            code: string;
            departmentId: string | null;
            tier: import(".prisma/client").$Enums.OfficeTier;
            vetoPower: boolean;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        description: string;
        title: string;
        originType: string;
        originId: string | null;
        deadline: Date;
        escalationLevel: number;
        fromOfficeId: string;
        toOfficeId: string;
    })[]>;
    certify(id: string, officeId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        description: string;
        title: string;
        originType: string;
        originId: string | null;
        deadline: Date;
        escalationLevel: number;
        fromOfficeId: string;
        toOfficeId: string;
    }>;
}
