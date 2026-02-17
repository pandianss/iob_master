import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
    const batches = await prisma.ingestionBatch.findMany({
        orderBy: { uploadedAt: 'desc' },
        take: 5,
        include: { records: { take: 1 } }
    });

    console.log('Recent Batches:');
    for (const batch of batches) {
        console.log(`- ID: ${batch.id}`);
        console.log(`  File: ${batch.fileName}`);
        console.log(`  Type: ${batch.fileType}`);
        console.log(`  Rows: ${batch.rowCount}`);
        if (batch.records.length > 0) {
            const data = batch.records[0].data as any;
            const keys = Object.keys(data);
            console.log(`  Data Keys Count: ${keys.length}`);
            console.log(`  Keys: ${keys.slice(0, 5).join(', ')}...`);
        } else {
            console.log(`  No Records found.`);
        }
        console.log('-------------------');
    }
}

run()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
