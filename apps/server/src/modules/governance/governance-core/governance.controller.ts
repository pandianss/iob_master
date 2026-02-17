
import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { GovernanceService } from './governance.service';

@Controller('governance')
export class GovernanceController {
    constructor(private readonly governanceService: GovernanceService) {
        console.log('GovernanceController instantiated');
    }

    @Get('parameters')
    getParameters() {
        return this.governanceService.getParameters();
    }

    @Get('doa-rules')
    getDoARules() {
        return this.governanceService.getDoARules();
    }

    @Post('doa-rules')
    createDoARule(@Body() body: any) {
        return this.governanceService.createDoARule(body);
    }

    @Put('doa-rules/:id')
    updateDoARule(@Param('id') id: string, @Body() body: any) {
        return this.governanceService.updateDoARule(id, body);
    }

    @Delete('doa-rules/:id')
    deleteDoARule(@Param('id') id: string) {
        return this.governanceService.deleteDoARule(id);
    }

    @Get('allowed-contexts')
    getAllowedContexts() {
        return this.governanceService.findAllowedContexts();
    }

    @Post('parameters')
    createParameter(@Body() body: any) {
        return this.governanceService.createParameter(body);
    }

    @Put('parameters/:id')
    updateParameter(@Param('id') id: string, @Body() body: any) {
        return this.governanceService.updateParameter(id, body);
    }

    @Delete('parameters/:id')
    deleteParameter(@Param('id') id: string) {
        return this.governanceService.deleteParameter(id);
    }

    @Post('contexts')
    createContext(@Body() body: { decisionTypeName: string; functionalScopeName: string }) {
        return this.governanceService.createContext(body);
    }

    // Parameter Mappings
    @Get('mappings')
    getMappings() {
        return this.governanceService.getMappings();
    }

    @Post('mappings')
    createMapping(@Body() body: any) {
        return this.governanceService.createMapping(body);
    }

    @Put('mappings/:id')
    updateMapping(@Param('id') id: string, @Body() body: any) {
        return this.governanceService.updateMapping(id, body);
    }

    @Delete('mappings/:id')
    deleteMapping(@Param('id') id: string) {
        return this.governanceService.deleteMapping(id);
    }

    // Helpers
    @Get('decision-types')
    getDecisionTypes() {
        return this.governanceService.getDecisionTypes();
    }

    @Get('functional-scopes')
    getFunctionalScopes() {
        return this.governanceService.getFunctionalScopes();
    }

    @Get('designations')
    getDesignations() {
        return this.governanceService.getDesignations();
    }
}
