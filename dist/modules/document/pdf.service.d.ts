import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
export declare class PdfService implements OnModuleInit, OnModuleDestroy {
    private browser;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    private launchBrowser;
    generatePdf(htmlContent: string): Promise<Buffer>;
}
