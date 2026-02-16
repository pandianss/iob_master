import { PrismaService } from '../../common/prisma.service';
export interface ObligationResult {
    success: boolean;
    reason?: 'NOT_FOUND' | 'UNAUTHORIZED' | 'ALREADY_COMPLETED' | 'SYSTEM_ERROR';
    data?: any;
}
export declare class ObligationService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: {
        title: string;
        description: string;
        originType: string;
        fromOfficeId: string;
        toOfficeId: string;
        deadline: Date | string;
    }): Promise<{
        success: boolean;
        data: {
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
        };
        reason?: undefined;
    } | {
        success: boolean;
        reason: string;
        data?: undefined;
    }>;
    findAllForOffice(officeId: string): Promise<({
        fromOffice: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            code: string | null;
            tier: import(".prisma/client").$Enums.OfficeTier;
            authorityLine: string;
            vetoPower: boolean;
        };
        toOffice: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            code: string | null;
            tier: import(".prisma/client").$Enums.OfficeTier;
            authorityLine: string;
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
    certify(id: string, officeId: string): Promise<ObligationResult>;
}
