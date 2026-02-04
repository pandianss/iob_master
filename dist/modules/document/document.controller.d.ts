import { DocumentService } from './document.service';
import type { Response } from 'express';
import { PdfService } from './pdf.service';
import { TemplateService } from './template.service';
export declare class DocumentController {
    private readonly pdfService;
    private readonly templateService;
    private readonly documentService;
    constructor(pdfService: PdfService, templateService: TemplateService, documentService: DocumentService);
    downloadDecision(id: string, res: Response): Promise<void>;
    previewDocument(body: any, res: Response): Promise<void>;
}
