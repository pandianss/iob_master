import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
    const records = await prisma.ingestionRecord.findMany({
        where: { batch: { fileType: 'ADVANCES_VERTICAL' } },
        select: { data: true, batchId: true }
    });

    let maxKeys = 0;
    let maxBatchId = '';

    for (const record of records) {
        const keysCount = Object.keys(record.data as any).length;
        if (keysCount > maxKeys) {
            maxKeys = keysCount;
            maxBatchId = record.batchId;
        }
    }

    console.log(`Max Keys Found in ADVANCES_VERTICAL: ${maxKeys}`);
    console.log(`Batch ID for Max Keys: ${maxBatchId}`);

    if (maxKeys > 12) {
        const record = records.find(r => Object.keys(r.data as any).length === maxKeys);
        console.log('Sample Keys for Max Keys Batch:', Object.keys(record?.data as any).slice(0, 15));
    }
}

run()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
