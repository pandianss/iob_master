import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { Decision, Prisma } from '@prisma/client';
import { DoAService } from '../governance/governance-core/doa.service';

export enum DecisionStatus {
    DRAFT = 'DRAFT',
    PENDING_APPROVAL = 'PENDING_APPROVAL',
    QUERY_RAISED = 'QUERY_RAISED',
    APPROVED = 'APPROVED',
    SANCTIONED = 'SANCTIONED',
    REJECTED = 'REJECTED',
    ESCALATED = 'ESCALATED',
}

export enum ActionType {
    SUBMIT = 'SUBMIT',
    APPROVE = 'APPROVE',
    SANCTION = 'SANCTION',
    REJECT = 'REJECT',
    ESCALATE = 'ESCALATE',
    QUERY = 'QUERY',
    RESPOND = 'RESPOND',
}

@Injectable()
export class DecisionService {
    constructor(
        private prisma: PrismaService,
        private doaService: DoAService,
    ) { }

    async create(initiatorPostingId: string, data: any, deptContextId: string, regionContextId: string, decisionTypeId?: string, functionalScopeId?: string) {
        // 1. Verify initiator posting is active
        const targetPostingId = initiatorPostingId;

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
            if (rule.found) authRuleId = rule.ruleId;
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
            case ActionType.SUBMIT:
                return this.handleSubmit(decision as any, actor, notes || '');
            case ActionType.APPROVE:
                return this.handleApprove(decision as any, actor, notes || '');
            case ActionType.SANCTION:
                return this.handleSanction(decision as any, actor, notes || '');
            case ActionType.REJECT:
                return this.handleReject(decision as any, actor, notes || '');
            case ActionType.ESCALATE:
                return this.handleEscalate(decision as any, actor, notes || '');
            case ActionType.QUERY:
                return this.handleQuery(decision as any, actor, notes || '');
            case ActionType.RESPOND:
                return this.handleRespond(decision as any, actor, notes || '');
            default:
                throw new BadRequestException('Unsupported action');
        }
    }

    private async handleSubmit(decision: any, actor: any, notes: string) {
        if (decision.status !== DecisionStatus.DRAFT) {
            throw new BadRequestException('Can only submit from DRAFT');
        }
        return this.updateState(decision.id, actor.id, DecisionStatus.PENDING_APPROVAL, { notes });
    }

    private async handleSanction(decision: any, actor: any, notes: string) {
        if (decision.status !== DecisionStatus.PENDING_APPROVAL) {
            throw new BadRequestException('Can only sanction if PENDING_APPROVAL');
        }
        return this.updateState(decision.id, actor.id, DecisionStatus.SANCTIONED, { notes });
    }

    private async handleReject(decision: any, actor: any, notes: string) {
        if (decision.status !== DecisionStatus.PENDING_APPROVAL && decision.status !== DecisionStatus.QUERY_RAISED) {
            throw new BadRequestException('Invalid state for rejection');
        }
        return this.updateState(decision.id, actor.id, DecisionStatus.REJECTED, { notes });
    }

    private async handleQuery(decision: any, actor: any, notes: string) {
        if (decision.status !== DecisionStatus.PENDING_APPROVAL) {
            throw new BadRequestException('Can only raise query on pending proposals');
        }
        return this.updateState(decision.id, actor.id, DecisionStatus.QUERY_RAISED, { notes });
    }

    private async handleRespond(decision: any, actor: any, notes: string) {
        if (decision.status !== DecisionStatus.QUERY_RAISED) {
            throw new BadRequestException('Can only respond to active queries');
        }
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
                    metadata: metadata,
                }
            });

            return decision;
        });
    }

    async findOne(id: string) {
        const decision = await this.prisma.decision.findUnique({
            where: { id },
            include: {
                initiatorPosting: {
                    include: {
                        user: true,
                        designation: true,
                    }
                },
                authRule: {
                    include: {
                        decisionType: true,
                        functionalScope: true
                    }
                },
                auditLogs: {
                    include: {
                        actorPosting: {
                            include: {
                                user: true,
                                designation: true
                            }
                        }
                    },
                    orderBy: { timestamp: 'desc' }
                },
                evidence: true
            }
        });

        if (!decision) throw new BadRequestException('Decision not found');
        return decision;
    }

    async findAll(officeId?: string) {
        return this.prisma.decision.findMany({
            where: officeId ? {
                initiatorPosting: {
                    user: {
                        tenures: {
                            some: {
                                officeId: officeId,
                                status: 'ACTIVE'
                            }
                        }
                    }
                }
            } : {},
            include: {
                initiatorPosting: {
                    include: {
                        user: true,
                        designation: true,
                    }
                },
                authRule: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }
}
