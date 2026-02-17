import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyBackfill() {
    console.log('🚀 Verifying Office Backfill...');

    const departments = await prisma.department.findMany({
        where: { subType: { in: ['RO', 'BRANCH', 'DEPT', 'LPC'] } },
        include: { offices: true }
    });

    let passCount = 0;
    let failCount = 0;

    for (const dept of departments) {
        const headOffice = dept.offices.find(o => o.authorityLine === '1st');
        const status = headOffice ? '✅ PASS' : '❌ FAIL';
        if (headOffice) passCount++;
        else failCount++;

        console.log(`[${status}] Unit: ${dept.name} (${dept.code}) -> Head: ${headOffice ? headOffice.name : 'MISSING'}`);
    }

    console.log(`\nResults: ${passCount} Passed, ${failCount} Failed`);

    if (failCount === 0) {
        console.log('🎉 Verification Successful! All relevant units have head offices.');
    } else {
        console.error('⚠️ Verification Failed. Some units are missing offices.');
    }
}

verifyBackfill()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
