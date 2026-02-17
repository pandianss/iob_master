import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { IngestionService, IngestionType } from './src/modules/ingestion/ingestion.service';
import { PrismaService } from './src/common/prisma.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const ingestionService = app.get(IngestionService);
    const prisma = app.get(PrismaService);

    console.log('--- Starting Ingestion Verification ---');

    // MOCK CSV Content
    const csvContent = `Branch Code,Savings Bank,Current Deposits,Term Deposits,Advances
3549,10000000,5000000,2000000,15000000
3347,20000000,10000000,5000000,25000000
2287,15000000,7500000,3000000,20000000`;

    const buffer = Buffer.from(csvContent);
    const fileName = 'test_snapshot.csv';
    const userId = 'VERIFICATION_BOT';

    try {
        // 1. Ingest
        console.log('1. Calling ingestFile...');
        const result = await ingestionService.ingestFile(
            buffer,
            fileName,
            IngestionType.KEY_BUSINESS_PARAM,
            userId
        );
        console.log('   Ingestion Result:', result);

        // 2. Verify DB
        console.log('2. Verifying Database...');

        // Check Batch
        const batch = await prisma.ingestionBatch.findFirst({
            where: { id: (result as any).batchId },
            include: { records: true }
        });

        if (!batch) {
            console.error('FAILED: Batch not found in DB');
            process.exit(1);
        }

        console.log(`   Batch Found: ${batch.status}, Records: ${batch.records.length}`);

        if (batch.status === 'COMPLETED' && batch.records.length === 3) {
            console.log('SUCCESS: Ingestion verified successfully!');

            // Inspect a record
            console.log('   Sample Record:', batch.records[0].data);
        } else {
            console.error('FAILED: Status or count mismatch');
        }

    } catch (error) {
        console.error('Result: FAILED', error);
    } finally {
        await app.close();
    }
}

bootstrap();
