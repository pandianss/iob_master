import { Controller, Post, Body, Res, BadRequestException } from '@nestjs/common';
import type { Response } from 'express';
import { PdfService } from './pdf.service';
import { TemplateService } from './template.service';

@Controller('documents')
export class DocumentController {
    constructor(
        private readonly pdfService: PdfService,
        private readonly templateService: TemplateService,
    ) { }

    @Post('preview')
    async previewDocument(@Body() body: any, @Res() res: Response) {
        const { templateName, data } = body;

        if (!templateName) {
            throw new BadRequestException('templateName is required');
        }

        try {
            // 1. Render HTML
            const html = await this.templateService.render(templateName, data);

            // 2. Generate PDF
            const pdfBuffer = await this.pdfService.generatePdf(html);

            // 3. Stream back
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="${templateName}.pdf"`,
                'Content-Length': pdfBuffer.length,
            });

            res.send(pdfBuffer);
        } catch (error) {
            console.error('PDF Generation Error:', error);
            res.status(500).json({ message: 'Failed to generate PDF', error: error.message });
        }
    }
}
