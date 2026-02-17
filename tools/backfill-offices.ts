import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function backfillOffices() {
    console.log('🚀 Starting Office Backfill & Correction...');

    const departments = await prisma.department.findMany({
        include: { offices: true }
    });

    console.log(`Found ${departments.length} departments to check.`);

    for (const dept of departments) {
        // 1. Correct "Department Department" duplications in existing offices
        const badOffice = dept.offices.find(o => o.name.endsWith(' Department Department'));
        if (badOffice) {
            const correctedName = badOffice.name.replace(' Department Department', ' Department');
            await prisma.office.update({
                where: { id: badOffice.id },
                data: { name: correctedName }
            });
            console.log(`[FIX] Renamed "${badOffice.name}" to "${correctedName}"`);
        }

        // 2. Check if a 1st Line Head exists
        const existingHead = dept.offices.find(o => o.authorityLine === '1st');

        if (existingHead) {
            // Already handled above if it was bad, so skip creation
            continue;
        }

        // Determine Office Details
        let officeName = `Head of ${dept.name}`;
        let officeCode = `HEAD-${dept.code}`;
        const tier = 'TIER_3_EXECUTION'; // Default

        if (dept.type === 'BRANCH') {
            officeName = `Branch Manager - ${dept.name}`;
            officeCode = `BM-${dept.code}`;
        } else if (dept.name.toUpperCase().includes('LPC') || dept.subType === 'LPC') {
            officeName = `Head - ${dept.name}`;
            officeCode = `LPC-${dept.code}`;
        } else if (dept.type === 'FUNCTIONAL') {
            officeName = dept.name.endsWith(' Department') ? `Head of ${dept.name}` : `Head of ${dept.name} Department`;
            officeCode = `DEPT-${dept.code}`;
        } else if (dept.subType === 'RO' && dept.parentId === null) {
            // Root RO
            officeName = `Regional Head - ${dept.name.replace('Regional Office - ', '')}`;
            officeCode = `RH-${dept.code.replace('RO-', '')}`;
        }

        // Create the Office
        try {
            const newOffice = await prisma.office.create({
                data: {
                    code: officeCode,
                    name: officeName,
                    tier: tier,
                    departmentId: dept.id,
                    authorityLine: '1st',
                    vetoPower: true
                }
            });
            console.log(`[CREATE] Created ${newOffice.name} (${newOffice.code}) for ${dept.name}`);
        } catch (error) {
            console.error(`[ERROR] Failed to create office for ${dept.name}:`, error);
        }
    }

    console.log('✅ Backfill Complete.');
}

backfillOffices()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
