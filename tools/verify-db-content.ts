import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
    console.log('Checking latest batch...');

    const batch = await prisma.ingestionBatch.findFirst({
        where: { fileName: 'curl-test.csv' },
        orderBy: { uploadedAt: 'desc' },
        include: { records: true }
    });

    if (!batch) {
        console.log('No batch found.');
        return;
    }

    console.log(`Checking Batch: ${batch.fileName} (${batch.id})`);

    if (batch.records.length === 0) {
        console.log('No records in batch.');
        return;
    }

    const data = batch.records[0].data as any;
    const keys = Object.keys(data);

    console.log('Stored Keys:', keys);
    console.log('Data:', JSON.stringify(data, null, 2));

    const allowed = ['Branch Code', 'Savings Bank', 'Current Deposits', 'Term Deposits', 'Advances'];
    const invalid = keys.filter(k => !allowed.includes(k));

    if (invalid.length === 0) {
        console.log('SUCCESS: Filtering worked!');
    } else {
        console.error('FAILURE: Found invalid keys:', invalid);
    }

    // Cleanup
    if (batch.fileName === 'curl-test.csv') {
        console.log('Cleaning up test batch...');
        await prisma.ingestionBatch.delete({ where: { id: batch.id } });
    }
}

check()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
