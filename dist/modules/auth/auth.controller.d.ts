import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(body: {
        identity: string;
        password?: string;
    }): Promise<{
        status: string;
        user: {
            postings: ({
                designation: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    title: string;
                    titleHindi: string | null;
                    titleTamil: string | null;
                    rank: number;
                };
                departments: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    status: string;
                    code: string;
                    nameHindi: string | null;
                    nameTamil: string | null;
                    type: string;
                    subType: string | null;
                    populationGroup: string | null;
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
                }[];
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                regionId: string;
                designationId: string;
                validFrom: Date;
                validTo: Date | null;
                status: string;
            })[];
            tenures: ({
                office: {
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
                userId: string;
                status: string;
                officeId: string;
                startDate: Date;
                endDate: Date | null;
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            nameHindi: string | null;
            nameTamil: string | null;
            identityRef: string;
            email: string;
            mobile: string | null;
            dob: Date | null;
            gender: string | null;
            role: string;
        };
        role: string;
    }>;
}
