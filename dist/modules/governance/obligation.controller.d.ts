import { ObligationService } from './obligation.service';
import { CreateObligationDto } from './dto/create-obligation.dto';
export declare class ObligationController {
    private readonly obligationService;
    constructor(obligationService: ObligationService);
    create(dto: CreateObligationDto): Promise<{
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
    findAll(officeId: string): Promise<({
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
    certify(id: string, officeId: string): Promise<import("./obligation.service").ObligationResult>;
}
