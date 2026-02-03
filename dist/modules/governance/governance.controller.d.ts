import { GovernanceService } from './governance.service';
export declare class GovernanceController {
    private readonly governanceService;
    constructor(governanceService: GovernanceService);
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
    createParameter(body: any): Promise<{
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
    updateParameter(id: string, body: any): Promise<{
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
