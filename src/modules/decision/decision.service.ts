import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { Decision, Prisma } from '@prisma/client';
import { DoAService } from '../governance/doa.service';

export enum DecisionStatus {
    DRAFT = 'DRAFT',
    PENDING_REVIEW = 'PENDING_REVIEW',
    PENDING_APPROVAL = 'PENDING_APPROVAL',
    APPROVED = 'APPROVED',
    ESCALATED = 'ESCALATED',
    REJECTED = 'REJECTED',
}

export enum ActionType {
    RECOMMEND = 'RECOMMEND',
    REVIEW = 'REVIEW',
    APPROVE = 'APPROVE',
    RATIFY = 'RATIFY',
    ESCALATE = 'ESCALATE',
    QUERY = 'QUERY',
}

@Injectable()
export class DecisionService {
    constructor(
        private prisma: PrismaService,
        private doaService: DoAService,
    ) { }

    async create(initiatorPostingId: string, data: any, deptContextId: string, regionContextId: string, decisionTypeId?: string, functionalScopeId?: string) {
        // 1. Verify initiator posting is active
        // DEV: Handle mock posting ID
        let targetPostingId = initiatorPostingId;
        if (initiatorPostingId === 'mock-ro-posting') {
            const firstPosting = await this.prisma.posting.findFirst({
                where: { status: 'ACTIVE' }
            });
            if (firstPosting) targetPostingId = firstPosting.id;
        }

        const posting = await this.prisma.posting.findUnique({
            where: { id: targetPostingId },
            include: { designation: true }
        });

        if (!posting || posting.status !== 'ACTIVE') {
            throw new ForbiddenException('Invalid or inactive posting');
        }

        // 2. Resolve authority rule if classification is provided
        let authRuleId: string | undefined;
        if (decisionTypeId && functionalScopeId) {
            const amount = data?.amount || 0;
            const rule = await this.doaService.resolveAuthorityBody(decisionTypeId, functionalScopeId, amount);
            if (rule) authRuleId = rule.id;
        }

        // 3. Create decision in DRAFT
        return this.prisma.decision.create({
            data: {
                initiatorPostingId: targetPostingId,
                deptContextId,
                regionContextId,
                status: DecisionStatus.DRAFT,
                outcomeData: data,
                authRuleId,
            }
        });
    }

    async performAction(decisionId: string, actorPostingId: string, action: ActionType, notes?: string, evidenceRefs?: any[]) {
        const decision = await this.prisma.decision.findUnique({
            where: { id: decisionId },
            include: { authRule: true }
        });

        if (!decision) throw new BadRequestException('Decision not found');

        const actor = await this.prisma.posting.findUnique({
            where: { id: actorPostingId },
            include: { designation: true }
        });

        if (!actor || actor.status !== 'ACTIVE') throw new ForbiddenException('Invalid actor posting');

        // State machine logic
        switch (action) {
            case ActionType.RECOMMEND:
                return this.handleRecommend(decision as any, actor, notes || '');
            case ActionType.REVIEW:
                return this.handleReview(decision as any, actor, notes || '');
            case ActionType.APPROVE:
                return this.handleApprove(decision as any, actor, notes || '');
            case ActionType.ESCALATE:
                return this.handleEscalate(decision as any, actor, notes || '');
            default:
                throw new BadRequestException('Unsupported action');
        }
    }

    private async handleRecommend(decision: any, actor: any, notes: string) {
        if (decision.status !== DecisionStatus.DRAFT) {
            throw new BadRequestException('Can only recommend from DRAFT');
        }

        return this.updateState(decision.id, actor.id, DecisionStatus.PENDING_REVIEW, { notes });
    }

    private async handleReview(decision: any, actor: any, notes: string) {
        if (decision.status !== DecisionStatus.PENDING_REVIEW) {
            throw new BadRequestException('Can only review if PENDING_REVIEW');
        }

        // logic to check if actor has Review authority for this scope (mocked for now)
        return this.updateState(decision.id, actor.id, DecisionStatus.PENDING_APPROVAL, { notes });
    }

    private async handleApprove(decision: any, actor: any, notes: string) {
        if (decision.status !== DecisionStatus.PENDING_APPROVAL) {
            throw new BadRequestException('Can only approve if PENDING_APPROVAL');
        }

        // 1. Check DoA limits
        if (decision.authRuleId) {
            const amount = (decision.outcomeData as any)?.amount || 0;
            const validation = await this.doaService.validateAuthority(
                'DESIGNATION', // Could also be COMMITTEE
                actor.designationId,
                decision.authRule.decisionTypeId,
                decision.authRule.functionalScopeId,
                amount
            );

            if (!validation.valid) {
                throw new ForbiddenException(`Decision exceeds authority limits: ${validation.reason}`);
            }
        }

        return this.updateState(decision.id, actor.id, DecisionStatus.APPROVED, { notes });
    }

    private async handleEscalate(decision: any, actor: any, notes: string) {
        // Escalation creates a child decision or moves current decision to higher authority
        return this.updateState(decision.id, actor.id, DecisionStatus.ESCALATED, { notes });
    }

    private async updateState(decisionId: string, actorPostingId: string, nextStatus: string, metadata: any) {
        return this.prisma.$transaction(async (tx) => {
            const prevDecision = await tx.decision.findUnique({ where: { id: decisionId } });

            const decision = await tx.decision.update({
                where: { id: decisionId },
                data: { status: nextStatus }
            });

            await tx.decisionAudit.create({
                data: {
                    decisionId,
                    actorPostingId,
                    actionType: 'STATE_CHANGE',
                    prevState: prevDecision?.status as any,
                    newState: nextStatus as any,
                }
            });

            return decision;
        });
    }

    async findAll() {
        return this.prisma.decision.findMany({
            include: {
                initiatorPosting: {
                    include: {
                        user: true,
                        designation: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
}
