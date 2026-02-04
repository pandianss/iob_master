import { Controller, Post, Body, Param, Get, Query } from '@nestjs/common';
import { DecisionService, ActionType } from './decision.service';

@Controller('decisions')
export class DecisionController {
    constructor(private readonly decisionService: DecisionService) { }

    @Post()
    async create(@Body() body: {
        initiatorPostingId: string,
        data: any,
        deptContextId: string,
        regionContextId: string,
        decisionTypeId?: string,
        functionalScopeId?: string
    }) {
        return this.decisionService.create(
            body.initiatorPostingId,
            body.data,
            body.deptContextId,
            body.regionContextId,
            body.decisionTypeId,
            body.functionalScopeId
        );
    }

    @Post(':id/action')
    async performAction(
        @Param('id') id: string,
        @Body() body: { actorPostingId: string, action: ActionType, notes?: string, evidenceRefs?: any[] }
    ) {
        return this.decisionService.performAction(id, body.actorPostingId, body.action, body.notes, body.evidenceRefs);
    }

    @Get()
    async findAll(@Query('officeId') officeId?: string) {
        return this.decisionService.findAll(officeId);
    }
}
