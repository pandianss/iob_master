import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
    console.log('--- STARTING BACKEND VERIFICATION ---');

    // 1. Check Designations
    console.log('\nChecking Designations...');
    const desgs = await prisma.designation.findMany({ orderBy: { rank: 'asc' } });
    console.log(`Found ${desgs.length} designations.`);
    if (desgs.length > 0) {
        console.log('Sample Designation:', desgs[0].title);
    }

    // 2. Test Region to Department Sync (Trilingual)
    console.log('\nTesting Region-to-Department Trilingual Sync...');
    const testRegionCode = 'TEST-RO-' + Date.now();
    const region = await prisma.region.create({
        data: {
            code: testRegionCode,
            name: 'Test Regional Office',
            nameHindi: 'परीक्षण क्षेत्रीय कार्यालय',
            nameTamil: 'சோதனை மண்டல அலுவலகம்',
            status: 'ACTIVE'
        }
    });
    console.log('Created Region with Trilingual names.');

    // Wait bit for sync logic (though in the actual app it's awaited)
    // Actually, in the code I implemented, AdminService.createRegion calls syncRootRO.
    // I need to use the actual service if possible, or simulate the logic.
    // Since I can't easily instantiate the NestJS service here without complex setup, 
    // I will check if the synchronization logic I wrote in AdminService.ts is sound.

    // Let's check if the sync logic already triggered (if I were running the app)
    // But since this is a standalone script, I'll just verify the query that SHOULD be run.

    const rootRO = await prisma.department.findFirst({
        where: { subType: 'RO', parentId: null }
    });

    if (rootRO && rootRO.code === testRegionCode) {
        console.log('SUCCESS: Root RO synchronized correctly.');
        console.log('Trilingual check:', {
            hindi: rootRO.nameHindi === 'परीक्षण क्षेत्रीय कार्यालय',
            tamil: rootRO.nameTamil === 'சோதனை மண்டல அலுவலகம்'
        });
    } else {
        console.log('NOTE: Standalone script cannot trigger NestJS hooks. Sync logic needs service-layer verification.');
    }

    // 3. Check Office CRUD
    console.log('\nChecking Offices...');
    const offices = await prisma.office.findMany({ take: 5 });
    console.log(`Found ${offices.length} offices.`);

    // Cleanup test data
    await prisma.region.delete({ where: { id: region.id } });
    console.log('\nCleanup complete.');
    console.log('--- VERIFICATION FINISHED ---');
}

verify()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
