import { Controller, Post, Body, Get, Put, Param, Delete } from '@nestjs/common';
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

    @Delete('departments/:id')
    deleteDept(@Param('id') id: string) {
        return this.adminService.deleteDepartment(id);
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

    @Get('users')
    getUsers() {
        return this.adminService.getUsers();
    }

    @Post('tenures')
    assignTenure(@Body() body: any) {
        return this.adminService.assignTenure(body);
    }

    // Rules
    @Post('doa-rules')
    createRule(@Body() body: any) {
        return this.adminService.createDoARule(body);
    }

    @Get('system-user')
    getSystemUser() {
        return this.adminService.getSystemUser();
    }
}
