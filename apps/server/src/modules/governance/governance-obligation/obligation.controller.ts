
import { Controller, Get, Post, Body, Param, Patch, Query } from '@nestjs/common';
import { ObligationService } from './obligation.service';
import { CreateObligationDto } from './dto/create-obligation.dto';

@Controller('governance/obligations')
export class ObligationController {
    constructor(private readonly obligationService: ObligationService) { }

    @Post()
    create(@Body() dto: CreateObligationDto) {
        return this.obligationService.create(dto);
    }

    @Get()
    findAll(@Query('officeId') officeId: string) {
        return this.obligationService.findAllForOffice(officeId);
    }

    @Patch(':id/certify')
    certify(@Param('id') id: string, @Body('officeId') officeId: string) {
        return this.obligationService.certify(id, officeId);
    }
}
