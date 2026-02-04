
import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { GovernanceService } from './governance.service';

@Controller('governance')
export class GovernanceController {
    constructor(private readonly governanceService: GovernanceService) { }

    @Get('parameters')
    getParameters() {
        return this.governanceService.getParameters();
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
}
