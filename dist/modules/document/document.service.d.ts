import { PrismaService } from '../../common/prisma.service';
import { TemplateService } from './template.service';
import { PdfService } from './pdf.service';
export declare class DocumentService {
    private prisma;
    private templateService;
    private pdfService;
    constructor(prisma: PrismaService, templateService: TemplateService, pdfService: PdfService);
    generateDecisionInstrument(decisionId: string): Promise<Buffer<ArrayBufferLike>>;
}
