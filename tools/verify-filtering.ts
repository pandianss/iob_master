import { PrismaClient } from '@prisma/client';
import { IngestionType, IngestionService } from './src/modules/ingestion/ingestion.service';
import { Logger } from '@nestjs/common';

const prisma = new PrismaClient();
// Mock service instance
const service = new IngestionService(prisma as any);

async function verify() {
    console.log('Verifying Column Filtering...');

    // 1. Create a dummy CSV buffer with extra columns
    const csvContent =
        `Region,Branch Code,Branch Name,Savings Bank,Random Column,Current Deposits,Term Deposits,Advances,Extra Data
North,101,Main Branch,50000,ShouldBeRemoved,12000,30000,15000,IgnoreMe`;

    const buffer = Buffer.from(csvContent);

    // 2. Ingest
    const result = await service.ingestFile(buffer, 'filter_test.csv', IngestionType.KEY_BUSINESS_PARAM, 'TEST_BOT', new Date());

    console.log('Ingestion Result:', result);

    // 3. Check DB
    const batch = await prisma.ingestionBatch.findUnique({
        where: { id: (result as any).batchId },
        include: { records: true }
    });

    if (!batch) throw new Error('Batch not found');

    const recordData = batch.records[0].data as any;
    console.log('Stored Data:', JSON.stringify(recordData, null, 2));

    // 4. Assertions
    const keys = Object.keys(recordData);
    const allowed = ['Branch Code', 'Savings Bank', 'Current Deposits', 'Term Deposits', 'Advances'];

    const hasExtras = keys.some(k => !allowed.includes(k));
    const hasRequired = allowed.every(k => keys.includes(k));

    if (!hasExtras && hasRequired) {
        console.log('SUCCESS: Only allowed columns were stored.');
    } else {
        console.error('FAILURE: Filtering failed.');
        console.log('Keys found:', keys);
    }

    await prisma.ingestionBatch.delete({ where: { id: batch.id } }); // Cleanup
}

verify()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
