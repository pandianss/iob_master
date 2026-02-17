import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
    console.log('Final Verification of scaling...');

    const batch = await prisma.ingestionBatch.findFirst({
        where: { fileName: 'curl-test.csv' },
        orderBy: { uploadedAt: 'desc' },
        include: { records: { take: 1 } }
    });

    if (!batch) {
        console.log('No curl-test.csv batch found.');
        return;
    }

    console.log(`\nBatch: ${batch.fileName}`);
    const data = batch.records[0]?.data as any;

    if (data) {
        console.log(`Savings Bank (Input was 50.5): ${data['Savings Bank']}`);
        if (data['Savings Bank'] === 505000000) {
            console.log('SUCCESS: Scaling is active (505,000,000)');
        } else {
            console.log(`FAILURE: Expected 505000000, got ${data['Savings Bank']}`);
        }
    }
}

check()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
