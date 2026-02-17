import { Module } from '@nestjs/common';
import { PdfWorkerModule } from '../pdf-worker/pdf-worker.module';
import { TemplateService } from './template.service';
import { DocumentController } from './document.controller';
import { PressService } from './press.service';
import { MotifEngine } from './motif.engine';
import { DocumentService } from './document.service';

@Module({
    imports: [PdfWorkerModule],
    controllers: [DocumentController],
    providers: [TemplateService, DocumentService, PressService, MotifEngine],
    exports: [TemplateService, DocumentService, PressService, PdfWorkerModule],
})
export class DocumentModule { }
