import type { Response } from 'express';
import { PdfService } from './pdf.service';
import { TemplateService } from './template.service';
export declare class DocumentController {
    private readonly pdfService;
    private readonly templateService;
    constructor(pdfService: PdfService, templateService: TemplateService);
    previewDocument(body: any, res: Response): Promise<void>;
}
