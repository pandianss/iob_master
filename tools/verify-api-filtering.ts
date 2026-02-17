import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import FormData from 'form-data';
import fetch from 'node-fetch';

const prisma = new PrismaClient();

async function verifyApi() {
    console.log('Verifying API Filtering...');

    // 1. Create a dummy CSV file
    const csvContent =
        `Region Name,Branch Code,Branch Name,Period,Deposits,Savings Bank,Current Deposits,Term Deposits,Advances,Business,Number of Branches
North,999,API Test Branch,20260203,100,50.5,10.2,20.1,30.3,200,1`;

    const filePath = path.join(__dirname, 'api-test.csv');
    fs.writeFileSync(filePath, csvContent);

    // 2. Upload via API
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    formData.append('type', 'KEY_BUSINESS_PARAM'); // Matches IngestionType enum
    formData.append('userId', 'API_TESTER');
    formData.append('snapshotDate', new Date().toISOString());

    console.log('Uploading file...');
    const res = await fetch('http://localhost:3000/ingestion/upload', {
        method: 'POST',
        body: formData
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Upload failed: ${res.status} ${text}`);
    }

    const result = await res.json();
    console.log('Upload Result:', result);

    // 3. Check DB
    const batch = await prisma.ingestionBatch.findUnique({
        where: { id: (result as any).id }, // result is the batch object
        include: { records: true }
    });

    if (!batch) throw new Error('Batch not found');

    const recordData = batch.records[0].data as any;
    console.log('Stored Data Keys:', Object.keys(recordData));
    console.log('Stored Data:', JSON.stringify(recordData, null, 2));

    // 4. Assertions
    const keys = Object.keys(recordData);
    const allowed = ['Branch Code', 'Savings Bank', 'Current Deposits', 'Term Deposits', 'Advances'];

    const hasExtras = keys.some(k => !allowed.includes(k));
    const hasRequired = allowed.every(k => keys.includes(k));

    if (!hasExtras && hasRequired) {
        console.log('SUCCESS: Only allowed columns were stored via API.');
    } else {
        console.error('FAILURE: Filtering failed via API.');
        console.log('Keys found:', keys);
    }

    // Cleanup
    await prisma.ingestionBatch.delete({ where: { id: batch.id } });
    fs.unlinkSync(filePath);
}

verifyApi()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
