import { Module } from '@nestjs/common';
import { GovernanceController } from './governance.controller';
import { OfficeController } from './office.controller';
import { ObligationController } from './obligation.controller';
import { GovernanceService } from './governance.service';
import { DoAService } from './doa.service';
import { OfficeService } from './office.service';
import { ObligationService } from './obligation.service';
import { PrismaService } from '../../common/prisma.service';

@Module({
    controllers: [GovernanceController, OfficeController, ObligationController],
    providers: [GovernanceService, DoAService, OfficeService, ObligationService, PrismaService],
    exports: [GovernanceService, DoAService, OfficeService, ObligationService],
})
export class GovernanceModule { }
