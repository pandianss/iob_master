import { PrismaClient } from '@prisma/client';
import { AdminService } from './src/modules/admin/admin.service';

const prisma = new PrismaClient();
const adminService = new AdminService(prisma as any);

async function verifyOfficeAutomation() {
    console.log('🚀 Starting Office Automation Verification...');

    try {
        // 1. Verify Regional Head Creation (Mocking a new Region)
        // Note: AdminService.createRegion is protected by singleton check, so we'll test syncRootRO logic directly strictly if possible, 
        // or simulating a department creation that LOOKS like a root RO (subtype 'RO', parentId null).
        // Actually, let's test the standardize createDepartment path first.

        // 2. Test Branch Manager Creation
        console.log('\n--- Testing Branch Office Creation ---');
        const branchData = {
            name: 'Test Automation Branch',
            code: 'TEST-BR-001',
            type: 'BRANCH',
            subType: 'BRANCH',
            parentId: null // Root for test simplicity
        };
        const branch = await adminService.createDepartment(branchData);
        const branchOffice = await prisma.office.findFirst({
            where: { departmentId: branch.id }
        });
        console.log(`Unit: ${branch.name} (${branch.code})`);
        console.log(`Office Created: ${branchOffice?.name} (${branchOffice?.code})`);
        console.log(`Status: ${branchOffice?.name === 'Branch Manager - Test Automation Branch' ? '✅ PASS' : '❌ FAIL'}`);

        // 3. Test Department Head Creation
        console.log('\n--- Testing Functional Department Head Creation ---');
        const deptData = {
            name: 'Test Automation Dept',
            code: 'TEST-DEPT-001',
            type: 'FUNCTIONAL',
            subType: 'DEPT',
            parentId: null
        };
        const dept = await adminService.createDepartment(deptData);
        const deptOffice = await prisma.office.findFirst({
            where: { departmentId: dept.id }
        });
        console.log(`Unit: ${dept.name} (${dept.code})`);
        console.log(`Office Created: ${deptOffice?.name} (${deptOffice?.code})`);
        console.log(`Status: ${deptOffice?.name === 'Head of Test Automation Dept Department' ? '✅ PASS' : '❌ FAIL'}`);

        // 4. Test LPC Head Creation
        console.log('\n--- Testing LPC Head Creation ---');
        const lpcData = {
            name: 'Test Automation LPC',
            code: 'TEST-LPC-001',
            type: 'BRANCH', // LPCs are often modeled as back-office branches or functional units
            subType: 'LPC',
            parentId: null
        };
        const lpc = await adminService.createDepartment(lpcData);
        const lpcOffice = await prisma.office.findFirst({
            where: { departmentId: lpc.id }
        });
        console.log(`Unit: ${lpc.name} (${lpc.code})`);
        console.log(`Office Created: ${lpcOffice?.name} (${lpcOffice?.code})`);
        console.log(`Status: ${lpcOffice?.name === 'Head - Test Automation LPC' ? '✅ PASS' : '❌ FAIL'}`);

        // Cleanup
        console.log('\n--- Cleaning Up Test Data ---');
        await adminService.deleteDepartment(branch.id);
        await adminService.deleteDepartment(dept.id);
        await adminService.deleteDepartment(lpc.id);
        console.log('Cleanup Complete.');

    } catch (error) {
        console.error('Verify Failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verifyOfficeAutomation();
