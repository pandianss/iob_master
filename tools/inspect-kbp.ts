import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
    console.log('Searching for latest batches...');

    const batches = await prisma.ingestionBatch.findMany({
        orderBy: { uploadedAt: 'desc' },
        take: 3,
        include: { records: { take: 1 } }
    });

    batches.forEach(batch => {
        console.log(`\nBatch: ${batch.fileName} (${batch.id})`);
        console.log(`Uploaded: ${batch.uploadedAt.toISOString()}`);
        if (batch.records[0]) {
            console.log(`Data (Savings Bank): ${batch.records[0].data['Savings Bank']}`);
            console.log(`Full Data Sample: ${JSON.stringify(batch.records[0].data)}`);
        }
    });
}

check()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
