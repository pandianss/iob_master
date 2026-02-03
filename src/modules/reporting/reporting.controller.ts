import { Controller, Get, Param, Query } from '@nestjs/common';
import { ReportingService } from './reporting.service';

@Controller('reporting')
export class ReportingController {
    constructor(private readonly reportingService: ReportingService) { }

    @Get('inbox/:identityRef')
    async getInbox(@Param('identityRef') identityRef: string) {
        return this.reportingService.getPendingApprovals(identityRef);
    }

    @Get('doa-breaches')
    async getDoABreaches() {
        return this.reportingService.getDoABreachStats();
    }

    @Get('compliance/:deptCode')
    async getDeptCompliance(@Param('deptCode') deptCode: string) {
        return this.reportingService.getComplianceScore(deptCode);
    }
}
