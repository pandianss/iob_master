
import { Module } from '@nestjs/common';
import { GovernanceController } from './governance.controller';
import { GovernanceService } from './governance.service';
import { DoAService } from './doa.service';
import { PrismaService } from '../../common/prisma.service';

@Module({
    controllers: [GovernanceController],
    providers: [GovernanceService, DoAService, PrismaService],
    exports: [GovernanceService, DoAService],
})
export class GovernanceModule { }
