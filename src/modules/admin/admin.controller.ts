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

    @Put('designations/:id')
    updateDesg(@Param('id') id: string, @Body() body: any) {
        return this.adminService.updateDesignation(id, body);
    }

    @Delete('designations/:id')
    deleteDesg(@Param('id') id: string) {
        return this.adminService.deleteDesignation(id);
    }

    // Regions
    @Get('regions')
    getRegions() {
        return this.adminService.getRegions();
    }

    @Post('regions')
    createRegion(@Body() body: any) {
        return this.adminService.createRegion(body);
    }

    @Put('regions/:id')
    updateRegion(@Param('id') id: string, @Body() body: any) {
        return this.adminService.updateRegion(id, body);
    }

    @Delete('regions/:id')
    deleteRegion(@Param('id') id: string) {
        return this.adminService.deleteRegion(id);
    }

    // Users
    @Post('users')
    createUser(@Body() body: any) {
        return this.adminService.createUser(body);
    }

    @Put('users/:id')
    updateUser(@Param('id') id: string, @Body() body: any) {
        return this.adminService.updateUser(id, body);
    }

    @Post('users/:id/cleanup')
    cleanupUserRoles(@Param('id') id: string) {
        return this.adminService.cleanupUserRoles(id);
    }

    @Delete('users/:id')
    deleteUser(@Param('id') id: string) {
        return this.adminService.deleteUser(id);
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

    @Delete('postings/:id')
    deletePosting(@Param('id') id: string) {
        return this.adminService.deletePosting(id);
    }

    @Delete('tenures/:id')
    deleteTenure(@Param('id') id: string) {
        return this.adminService.deleteTenure(id);
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
