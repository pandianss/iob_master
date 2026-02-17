import { Controller, Get, Param, Query, Post, Body } from '@nestjs/common';
import { ReportingService } from './reporting.service';

@Controller('reporting')
export class ReportingController {
    constructor(private readonly reportingService: ReportingService) { }

    @Get('inbox/:identityRef')
    async getInbox(@Param('identityRef') identityRef: string) {
        return this.reportingService.getPendingApprovals(identityRef);
    }

    @Get('inbox/:identityRef/stats')
    async getInboxStats(@Param('identityRef') identityRef: string) {
        return this.reportingService.getInboxStats(identityRef);
    }

    @Get('doa-breaches')
    async getDoABreaches() {
        return this.reportingService.getDoABreachStats();
    }

    @Get('compliance/:deptCode')
    async getDeptCompliance(@Param('deptCode') deptCode: string) {
        return this.reportingService.getComplianceScore(deptCode);
    }

    @Get('mis-summary')
    async getGlobalMISSummary() {
        return this.reportingService.getGlobalMISSummary();
    }

    @Get('business-snapshot')
    async getSnapshot(@Query('date') date?: string) {
        return this.reportingService.getBusinessSnapshot(date ? new Date(date) : undefined);
    }

    @Get('business-snapshot/comparison')
    async getComparison(
        @Query('t') t: string,
        @Query('tMinus1') tMinus1: string,
        @Query('monthEnd') monthEnd: string,
        @Query('fyEnd') fyEnd: string,
        @Query('fyStart') fyStart: string
    ) {
        return this.reportingService.getComparisonSnapshot({
            t: new Date(t),
            tMinus1: new Date(tMinus1),
            monthEnd: new Date(monthEnd),
            fyEnd: new Date(fyEnd),
            fyStart: new Date(fyStart)
        });
    }

    @Post('business-snapshot/targets')
    async saveTarget(@Body() data: { metric: string, timeframe: string, targetValue: number, targetDate: string }) {
        return this.reportingService.saveTarget({
            ...data,
            targetDate: new Date(data.targetDate)
        });
    }
}
