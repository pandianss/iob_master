import { Module } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { TemplateService } from './template.service';
import { DocumentController } from './document.controller';

import { DocumentService } from './document.service';

@Module({
    controllers: [DocumentController],
    providers: [PdfService, TemplateService, DocumentService],
    exports: [PdfService, TemplateService, DocumentService],
})
export class DocumentModule { }
