import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DecisionModule } from './modules/decision/decision.module';

import { CommonModule } from './common/common.module';
import { ReportingModule } from './modules/reporting/reporting.module';
import { AdminModule } from './modules/admin/admin.module';
import { DocumentModule } from './modules/document/document.module';
import { AuthModule } from './modules/auth/auth.module';
import { IngestionModule } from './modules/ingestion/ingestion.module';
import { GovernanceCoreModule } from './modules/governance/governance-core/governance.module';
import { GovernanceObligationModule } from './modules/governance/governance-obligation/obligation.module';
import { GovernanceOfficeModule } from './modules/governance/governance-office/office.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CommonModule,
    DecisionModule,
    GovernanceCoreModule,
    GovernanceObligationModule,
    GovernanceOfficeModule,
    ReportingModule,
    AdminModule,
    DocumentModule,
    AuthModule,
    IngestionModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
