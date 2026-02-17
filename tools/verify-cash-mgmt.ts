import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { IngestionService, IngestionType } from './src/modules/ingestion/ingestion.service';
import { PrismaService } from './src/common/prisma.service';
import { readFileSync } from 'fs';
import { join } from 'path';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const ingestionService = app.get(IngestionService);
    const prisma = app.get(PrismaService);

    console.log('--- Starting Cash Management Verification ---');

    const csvFile = join(process.cwd(), 'mis_template', 'BODTemplate.csv');
    const buffer = readFileSync(csvFile);
    const fileName = 'BODTemplate.csv';
    const userId = 'VERIFY_BOT';

    try {
        console.log('1. Ingesting Cash Management CSV...');
        const result = await ingestionService.ingestFile(
            buffer,
            fileName,
            IngestionType.CASH_MANAGEMENT,
            userId
        );
        console.log('   Ingestion Result:', result);

        // 2. Verify DB
        console.log('2. Verifying Database Records...');
        const batch = await prisma.ingestionBatch.findFirst({
            where: { id: (result as any).batchId },
            include: { records: { take: 1 } }
        });

        if (!batch) {
            console.error('FAILED: Batch not found');
            process.exit(1);
        }

        const data = batch.records[0].data as any;
        const keys = Object.keys(data);
        console.log('Stored Keys Count:', keys.length);
        console.log('Stored Keys:', keys);

        const expectedKeys = [
            'Branch Code',
            'Cash on Hand',
            'ATM Cash',
            'Cash with BC',
            'Bulk Note Acceptance',
            'Total Cash',
            'Cash Retention Limit',
            'Excess Cash',
            'Region Code'
        ];

        const missing = expectedKeys.filter(k => !keys.includes(k));
        const extra = keys.filter(k => !expectedKeys.includes(k));

        if (missing.length === 0 && extra.length === 0) {
            console.log('SUCCESS: Cash Management ingestion verified!');
        } else {
            if (missing.length > 0) console.error('FAILED: Missing expected keys:', missing);
            if (extra.length > 0) console.error('FAILED: Found unexpected extra keys:', extra);
            process.exit(1);
        }

        // Cleanup
        console.log('3. Cleaning up test data...');
        // await prisma.ingestionBatch.delete({ where: { id: batch.id } }); // Keep for now so user can see it in UI history
        console.log('   Test data preserved for UI verification.');

    } catch (error) {
        console.error('VERIFICATION FAILED:', error);
    } finally {
        await app.close();
    }
}

bootstrap();
