import { Injectable, Logger } from '@nestjs/common';
import { TemplateService } from './template.service';
import { PdfService } from '../pdf-worker/pdf.service';
import { MotifEngine } from './motif.engine';
import { PressContext } from './interfaces/press-context.interface';
import { DocumentData } from './interfaces/document-data.interface';

@Injectable()
export class PressService {
    private readonly logger = new Logger(PressService.name);

    constructor(
        private readonly templateService: TemplateService,
        private readonly pdfService: PdfService,
        private readonly motifEngine: MotifEngine,
    ) { }

    /**
     * Orchestrates the document generation pipeline.
     * 1. Resolve Motif (Branding)
     * 2. Merge Data + Motif
     * 3. Render HTML (via TemplateService)
     * 4. Print PDF (via PdfService)
     */
    async publish(data: DocumentData, context: PressContext): Promise<Buffer> {
        this.logger.log(`Publishing document [${context.templateName}] Ref: ${data.refNumber}`);

        // 1. Resolve Motif
        const motif = this.motifEngine.resolveMotif(context);

        // 2. Prepare Render Context
        const renderContext = {
            ...data,
            motif, // layout.hbs should use {{motif.header}}, {{motif.watermark}} etc.
            meta: {
                generatedAt: new Date().toLocaleDateString('en-IN'),
                classification: context.classification,
                isDraft: context.isDraft
            }
        };

        // 3. Render HTML
        const html = await this.templateService.render(context.templateName, renderContext);

        // 4. Generate PDF
        return this.pdfService.generatePdf(html);
    }
}
