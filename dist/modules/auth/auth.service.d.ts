import { PrismaService } from '../../common/prisma.service';
export declare class AuthService {
    private prisma;
    constructor(prisma: PrismaService);
    login(identity: string, password?: string): Promise<{
        status: string;
        user: {
            postings: ({
                designation: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    title: string;
                    rank: number;
                    roleAbstraction: string;
                };
                department: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    status: string;
                    code: string;
                    type: string;
                    subType: string | null;
                    parentId: string | null;
                    statutoryBasis: string | null;
                    establishmentOrderRef: string | null;
                    dateOfEstablishment: Date | null;
                    geographicalScope: string | null;
                    peerGroupCode: string | null;
                    reportingChain: import("@prisma/client/runtime/library").JsonValue | null;
                    mandateStatement: string | null;
                    delegationRef: string | null;
                    powers: string[];
                    decisionRights: import("@prisma/client/runtime/library").JsonValue | null;
                    vetoRights: import("@prisma/client/runtime/library").JsonValue | null;
                    restrictions: import("@prisma/client/runtime/library").JsonValue | null;
                    policiesOwned: string[];
                    processesOwned: string[];
                    metricsAccountableFor: string[];
                    certificationResponsibility: import("@prisma/client/runtime/library").JsonValue | null;
                    dataRoles: string[];
                    sourceSystems: string[];
                    misFrequency: string | null;
                    misSla: string | null;
                    dataFreezeTime: string | null;
                    revisionPolicy: string | null;
                    riskCategory: string | null;
                    inspectionCycle: string | null;
                    lastInspectionDate: Date | null;
                    openObservationsCount: number;
                    vigilanceSensitivity: string | null;
                    regulatoryTouchpoints: import("@prisma/client/runtime/library").JsonValue | null;
                    linkedCommittees: import("@prisma/client/runtime/library").JsonValue | null;
                    escalationPath: import("@prisma/client/runtime/library").JsonValue | null;
                    exceptionThresholds: import("@prisma/client/runtime/library").JsonValue | null;
                    canReceiveObligations: boolean;
                    canIssueObligations: boolean;
                    obligationCategories: string[];
                    defaultConsequence: import("@prisma/client/runtime/library").JsonValue | null;
                    decisionLogRetentionYears: number;
                    documentRetentionPolicy: string | null;
                    auditTrailEnabled: boolean;
                    inspectionReplayCapable: boolean;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: string;
                userId: string;
                deptId: string;
                regionId: string;
                designationId: string;
                validFrom: Date;
                validTo: Date | null;
            })[];
            tenures: ({
                office: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    code: string;
                    tier: import(".prisma/client").$Enums.OfficeTier;
                    departmentId: string | null;
                    vetoPower: boolean;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: string;
                userId: string;
                officeId: string;
                startDate: Date;
                endDate: Date | null;
            })[];
        } & {
            id: string;
            identityRef: string;
            name: string;
            email: string;
            createdAt: Date;
            updatedAt: Date;
        };
        role: string;
    }>;
}
