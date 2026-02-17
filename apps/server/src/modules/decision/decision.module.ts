import { Module } from '@nestjs/common';
import { DecisionService } from './decision.service';
import { DecisionController } from './decision.controller';
import { GovernanceCoreModule } from '../governance/governance-core/governance.module';

@Module({
    imports: [GovernanceCoreModule],
    providers: [DecisionService],
    controllers: [DecisionController],
})
export class DecisionModule { }
