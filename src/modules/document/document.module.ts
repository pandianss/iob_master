import { Module } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { TemplateService } from './template.service';
import { DocumentController } from './document.controller';
import { PressService } from './press.service';
import { MotifEngine } from './motif.engine';

import { DocumentService } from './document.service';

@Module({
    controllers: [DocumentController],
    providers: [PdfService, TemplateService, DocumentService, PressService, MotifEngine],
    exports: [PdfService, TemplateService, DocumentService, PressService],
})
export class DocumentModule { }
