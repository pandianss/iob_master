import { Module } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { TemplateService } from './template.service';
import { DocumentController } from './document.controller';

@Module({
    controllers: [DocumentController],
    providers: [PdfService, TemplateService],
    exports: [PdfService, TemplateService],
})
export class DocumentModule { }
