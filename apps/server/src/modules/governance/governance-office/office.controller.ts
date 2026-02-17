
import { Controller, Get, Param, Query, Post, Body, Put, Delete } from '@nestjs/common';
import { OfficeService } from './office.service';

@Controller('governance/offices')
export class OfficeController {
    constructor(private readonly officeService: OfficeService) { }

    @Get()
    findAll() {
        return this.officeService.findAll();
    }

    @Post()
    create(@Body() body: any) {
        return this.officeService.create(body);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() body: any) {
        return this.officeService.update(id, body);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.officeService.delete(id);
    }

    @Get(':code')
    findByCode(@Param('code') code: string) {
        return this.officeService.findByCode(code);
    }

    @Get('tenure/active')
    getActiveTenure(@Query('userId') userId: string) {
        return this.officeService.getActiveTenure(userId);
    }
}
