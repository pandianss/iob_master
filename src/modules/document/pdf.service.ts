import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

@Injectable()
export class PdfService implements OnModuleInit, OnModuleDestroy {
    private browser: puppeteer.Browser;

    async onModuleInit() {
        // Lazy load browser on demand instead of startup
    }

    async onModuleDestroy() {
        if (this.browser) {
            await this.browser.close();
        }
    }

    private async launchBrowser() {
        if (this.browser) return; // double-check
        this.browser = await puppeteer.launch({
            headless: true, // New Headless mode
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
        });
    }

    async generatePdf(htmlContent: string): Promise<Buffer> {
        if (!this.browser) await this.launchBrowser();

        const page = await this.browser.newPage();

        try {
            await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

            // Use 'screen' media type to ensure CSS matches what we see
            await page.emulateMediaType('screen');

            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '0mm', // Margins handled by CSS @page
                    right: '0mm',
                    bottom: '0mm',
                    left: '0mm',
                },
                displayHeaderFooter: false, // We use HTML/CSS for headers/footers
            });

            return Buffer.from(pdfBuffer);
        } finally {
            await page.close();
        }
    }
}
