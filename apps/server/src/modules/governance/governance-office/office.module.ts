import { Module } from '@nestjs/common';
import { OfficeController } from './office.controller';
import { OfficeService } from './office.service';
import { PrismaService } from '../../../common/prisma.service';

@Module({
    controllers: [OfficeController],
    providers: [OfficeService, PrismaService],
    exports: [OfficeService],
})
export class GovernanceOfficeModule { }
