import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { IngestionService, IngestionType } from './src/modules/ingestion/ingestion.service';
import { PrismaService } from './src/common/prisma.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const ingestionService = app.get(IngestionService);
    const prisma = app.get(PrismaService);

    console.log('--- Starting Performance Ingestion Verification (10,000 Rows) ---');

    // Generate 10k rows
    let csvContent = `Branch Code,Savings Bank,Current Deposits,Term Deposits,Advances\n`;
    for (let i = 0; i < 10000; i++) {
        csvContent += `${1000 + i},${1000000 + i},${500000 + i},${200000 + i},${1500000 + i}\n`;
    }

    const buffer = Buffer.from(csvContent);
    const fileName = 'perf_test_10k.csv';
    const userId = 'PERF_BOT';

    try {
        const start = Date.now();
        console.log('1. Calling ingestFile for 10k rows...');
        const result = await ingestionService.ingestFile(
            buffer,
            fileName,
            IngestionType.KEY_BUSINESS_PARAM,
            userId
        );
        const duration = (Date.now() - start) / 1000;
        console.log(`   Ingestion Completed in ${duration}s. Result:`, result);

        // 2. Verify DB
        console.log('2. Verifying Database...');
        const batch = await prisma.ingestionBatch.findUnique({
            where: { id: (result as any).batchId },
            include: { _count: { select: { records: true } } }
        });

        if (!batch) {
            console.error('FAILED: Batch not found in DB');
            process.exit(1);
        }

        console.log(`   Batch Found: ${batch.status}, Records Count: ${batch._count.records}`);

        if (batch.status === 'COMPLETED' && batch._count.records === 10000) {
            console.log('SUCCESS: Performance ingestion verified successfully!');
        } else {
            console.error('FAILED: Status or count mismatch');
            process.exit(1);
        }

    } catch (error) {
        console.error('Result: FAILED', error);
    } finally {
        await app.close();
    }
}

bootstrap();
