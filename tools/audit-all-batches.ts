import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
    console.log('--- Batch Schema Audit ---');
    const batches = await prisma.ingestionBatch.findMany({
        include: { records: { take: 1 } }
    });

    for (const batch of batches) {
        if (batch.records.length > 0) {
            const keys = Object.keys(batch.records[0].data as any);
            console.log(`Batch: ${batch.fileName} | Type: ${batch.fileType} | Keys: ${keys.length}`);
            if (keys.length > 20) {
                console.log(`  [!] UNFILTERED: ${keys.slice(0, 5).join(', ')}...`);
            }
        }
    }
}

run()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
