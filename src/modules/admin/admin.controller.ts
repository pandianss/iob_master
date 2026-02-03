import { Controller, Post, Body, Get, Put, Param } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    // Departments
    @Post('departments')
    createDept(@Body() body: any) {
        return this.adminService.createDepartment(body);
    }

    @Get('departments')
    async getDepts() {
        return this.adminService.getDepartments();
    }

    @Put('departments/:id')
    updateDept(@Param('id') id: string, @Body() body: any) {
        return this.adminService.updateDepartment(id, body);
    }

    // Designations
    @Post('designations')
    createDesg(@Body() body: any) {
        return this.adminService.createDesignation(body);
    }

    @Get('designations')
    getDesgs() {
        return this.adminService.getDesignations();
    }

    // Users
    @Post('users')
    createUser(@Body() body: any) {
        return this.adminService.createUser(body);
    }

    @Post('postings')
    assignPosting(@Body() body: any) {
        return this.adminService.assignPosting(body);
    }

    // Rules
    @Post('doa-rules')
    createRule(@Body() body: any) {
        return this.adminService.createDoARule(body);
    }
}
