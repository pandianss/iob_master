import { Module } from '@nestjs/common';
import { ObligationController } from './obligation.controller';
import { ObligationService } from './obligation.service';
import { PrismaService } from '../../../common/prisma.service';

@Module({
    controllers: [ObligationController],
    providers: [ObligationService, PrismaService],
    exports: [ObligationService],
})
export class GovernanceObligationModule { }
