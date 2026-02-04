import { PrismaService } from '../../common/prisma.service';
export declare class ComplianceService {
    private prisma;
    constructor(prisma: PrismaService);
    createControl(data: {
        description: string;
        ownerDeptId: string;
        executorRoleId: string;
        reviewerRoleId: string;
        evidenceReq: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        ownerDeptId: string;
        executorRoleId: string;
        reviewerRoleId: string;
        evidenceReq: string;
    }>;
    triggerObservation(controlId: string, triggerEvent: string, status: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        escalationLevel: number;
        controlId: string;
        triggerEvent: string;
    }>;
    escalateObservation(observationId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        escalationLevel: number;
        controlId: string;
        triggerEvent: string;
    }>;
    resolveObservation(observationId: string, resolutionData: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        escalationLevel: number;
        controlId: string;
        triggerEvent: string;
    }>;
}
