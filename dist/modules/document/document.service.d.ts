import { PrismaService } from '../../common/prisma.service';
import { PressService } from './press.service';
export declare class DocumentService {
    private prisma;
    private pressService;
    constructor(prisma: PrismaService, pressService: PressService);
    generateDecisionInstrument(decisionId: string): Promise<Buffer<ArrayBufferLike>>;
}
