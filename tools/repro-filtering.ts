import { PrismaClient } from '@prisma/client';
import { IngestionType, IngestionService } from './src/modules/ingestion/ingestion.service';

const prisma = new PrismaClient();
const service = new IngestionService(prisma as any);

async function verify() {
    console.log('Verifying Real Template Filtering...');

    // Exact header from kbp-template.csv
    const csvContent =
        `Region Name,Branch Code,Branch Name,Period,Deposits,Savings Bank,Current Deposits,Term Deposits,Advances,Business,Number of Branches
Dindigul Region,376,Palani,20260203,185.98,79.30,8.47,98.21,96.17,282.16,1`;

    const buffer = Buffer.from(csvContent);

    console.log('Using Headers:', csvContent.split('\n')[0]);

    // 2. Ingest
    const result = await service.ingestFile(buffer, 'real_template_test.csv', IngestionType.KEY_BUSINESS_PARAM, 'TEST_BOT', new Date());

    // 3. Check DB
    const batch = await prisma.ingestionBatch.findUnique({
        where: { id: (result as any).batchId },
        include: { records: true }
    });

    if (!batch) throw new Error('Batch not found');

    const recordData = batch.records[0].data as any;
    console.log('Stored Data Keys:', Object.keys(recordData));
    console.log('Stored Data:', JSON.stringify(recordData, null, 2));

    await prisma.ingestionBatch.delete({ where: { id: batch.id } }); // Cleanup
}

verify()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
