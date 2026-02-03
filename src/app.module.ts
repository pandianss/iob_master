import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DecisionModule } from './modules/decision/decision.module';

import { CommonModule } from './common/common.module';
import { GovernanceModule } from './modules/governance/governance.module';
import { ReportingModule } from './modules/reporting/reporting.module';
import { AdminModule } from './modules/admin/admin.module';
import { DocumentModule } from './modules/document/document.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CommonModule,
    DecisionModule,
    GovernanceModule,
    ReportingModule,
    AdminModule,
    DocumentModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
