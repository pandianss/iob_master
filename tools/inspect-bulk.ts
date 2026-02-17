import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
    console.log('Inspecting latest Bulk Deposit batch...');

    const batch = await prisma.ingestionBatch.findFirst({
        where: { fileType: 'BULK_DEPOSIT' },
        orderBy: { uploadedAt: 'desc' },
        include: { records: { take: 1 } }
    });

    if (!batch) {
        console.log('No Bulk Deposit batch found.');
        return;
    }

    console.log(`Batch ID: ${batch.id}`);
    console.log(`File Name: ${batch.fileName}`);
    console.log(`Data Sample: ${JSON.stringify(batch.records[0]?.data, null, 2)}`);
}

check()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
