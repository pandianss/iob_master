import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function diagnosePdf() {
    console.log('--- PDF GENERATION DIAGNOSTIC ---');

    // 1. Find a sample decision
    const decision = await prisma.decision.findFirst({
        orderBy: { createdAt: 'desc' },
        include: { initiatorPosting: true }
    });

    if (!decision) {
        console.error('No decisions found in DB. Please create one first.');
        return;
    }

    console.log(`Testing with Decision ID: ${decision.id}`);

    try {
        // 2. Call the download endpoint
        const url = `http://localhost:3001/api/documents/download/${decision.id}`;
        console.log(`Requesting PDF from: ${url}`);

        const response = await axios.get(url, { responseType: 'arraybuffer' });

        if (response.status === 200) {
            const fileName = `TEST-INSTRUMENT-${decision.id.substring(0, 8)}.pdf`;
            const filePath = path.join(process.cwd(), fileName);
            fs.writeFileSync(filePath, response.data);
            console.log(`SUCCESS: PDF generated and saved to ${filePath}`);
            console.log(`Content-Type: ${response.headers['content-type']}`);
            console.log(`File Size: ${response.data.byteLength} bytes`);
        } else {
            console.error(`FAILED: Server returned status ${response.status}`);
        }
    } catch (error) {
        console.error('DIAGNOSTIC FAILED:', error.message);
        if (error.response) {
            console.error('Error Response:', Buffer.from(error.response.data).toString());
        }
    } finally {
        await prisma.$disconnect();
    }
}

diagnosePdf();
