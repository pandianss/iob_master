import { Module } from '@nestjs/common';
import { DecisionService } from './decision.service';
import { DecisionController } from './decision.controller';
import { GovernanceModule } from '../governance/governance.module';

@Module({
    imports: [GovernanceModule],
    providers: [DecisionService],
    controllers: [DecisionController],
})
export class DecisionModule { }
