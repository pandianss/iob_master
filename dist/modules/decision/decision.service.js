"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecisionService = exports.ActionType = exports.DecisionStatus = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
const doa_service_1 = require("../governance/doa.service");
var DecisionStatus;
(function (DecisionStatus) {
    DecisionStatus["DRAFT"] = "DRAFT";
    DecisionStatus["PENDING_APPROVAL"] = "PENDING_APPROVAL";
    DecisionStatus["QUERY_RAISED"] = "QUERY_RAISED";
    DecisionStatus["APPROVED"] = "APPROVED";
    DecisionStatus["SANCTIONED"] = "SANCTIONED";
    DecisionStatus["REJECTED"] = "REJECTED";
    DecisionStatus["ESCALATED"] = "ESCALATED";
})(DecisionStatus || (exports.DecisionStatus = DecisionStatus = {}));
var ActionType;
(function (ActionType) {
    ActionType["SUBMIT"] = "SUBMIT";
    ActionType["APPROVE"] = "APPROVE";
    ActionType["SANCTION"] = "SANCTION";
    ActionType["REJECT"] = "REJECT";
    ActionType["ESCALATE"] = "ESCALATE";
    ActionType["QUERY"] = "QUERY";
    ActionType["RESPOND"] = "RESPOND";
})(ActionType || (exports.ActionType = ActionType = {}));
let DecisionService = class DecisionService {
    prisma;
    doaService;
    constructor(prisma, doaService) {
        this.prisma = prisma;
        this.doaService = doaService;
    }
    async create(initiatorPostingId, data, deptContextId, regionContextId, decisionTypeId, functionalScopeId) {
        const targetPostingId = initiatorPostingId;
        const posting = await this.prisma.posting.findUnique({
            where: { id: targetPostingId },
            include: { designation: true }
        });
        if (!posting || posting.status !== 'ACTIVE') {
            throw new common_1.ForbiddenException('Invalid or inactive posting');
        }
        let authRuleId;
        if (decisionTypeId && functionalScopeId) {
            const amount = data?.amount || 0;
            const rule = await this.doaService.resolveAuthorityBody(decisionTypeId, functionalScopeId, amount);
            if (rule.found)
                authRuleId = rule.ruleId;
        }
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
    async performAction(decisionId, actorPostingId, action, notes, evidenceRefs) {
        const decision = await this.prisma.decision.findUnique({
            where: { id: decisionId },
            include: { authRule: true }
        });
        if (!decision)
            throw new common_1.BadRequestException('Decision not found');
        const actor = await this.prisma.posting.findUnique({
            where: { id: actorPostingId },
            include: { designation: true }
        });
        if (!actor || actor.status !== 'ACTIVE')
            throw new common_1.ForbiddenException('Invalid actor posting');
        switch (action) {
            case ActionType.SUBMIT:
                return this.handleSubmit(decision, actor, notes || '');
            case ActionType.APPROVE:
                return this.handleApprove(decision, actor, notes || '');
            case ActionType.SANCTION:
                return this.handleSanction(decision, actor, notes || '');
            case ActionType.REJECT:
                return this.handleReject(decision, actor, notes || '');
            case ActionType.ESCALATE:
                return this.handleEscalate(decision, actor, notes || '');
            case ActionType.QUERY:
                return this.handleQuery(decision, actor, notes || '');
            case ActionType.RESPOND:
                return this.handleRespond(decision, actor, notes || '');
            default:
                throw new common_1.BadRequestException('Unsupported action');
        }
    }
    async handleSubmit(decision, actor, notes) {
        if (decision.status !== DecisionStatus.DRAFT) {
            throw new common_1.BadRequestException('Can only submit from DRAFT');
        }
        return this.updateState(decision.id, actor.id, DecisionStatus.PENDING_APPROVAL, { notes });
    }
    async handleSanction(decision, actor, notes) {
        if (decision.status !== DecisionStatus.PENDING_APPROVAL) {
            throw new common_1.BadRequestException('Can only sanction if PENDING_APPROVAL');
        }
        return this.updateState(decision.id, actor.id, DecisionStatus.SANCTIONED, { notes });
    }
    async handleReject(decision, actor, notes) {
        if (decision.status !== DecisionStatus.PENDING_APPROVAL && decision.status !== DecisionStatus.QUERY_RAISED) {
            throw new common_1.BadRequestException('Invalid state for rejection');
        }
        return this.updateState(decision.id, actor.id, DecisionStatus.REJECTED, { notes });
    }
    async handleQuery(decision, actor, notes) {
        if (decision.status !== DecisionStatus.PENDING_APPROVAL) {
            throw new common_1.BadRequestException('Can only raise query on pending proposals');
        }
        return this.updateState(decision.id, actor.id, DecisionStatus.QUERY_RAISED, { notes });
    }
    async handleRespond(decision, actor, notes) {
        if (decision.status !== DecisionStatus.QUERY_RAISED) {
            throw new common_1.BadRequestException('Can only respond to active queries');
        }
        return this.updateState(decision.id, actor.id, DecisionStatus.PENDING_APPROVAL, { notes });
    }
    async handleApprove(decision, actor, notes) {
        if (decision.status !== DecisionStatus.PENDING_APPROVAL) {
            throw new common_1.BadRequestException('Can only approve if PENDING_APPROVAL');
        }
        if (decision.authRuleId) {
            const amount = decision.outcomeData?.amount || 0;
            const validation = await this.doaService.validateAuthority('DESIGNATION', actor.designationId, decision.authRule.decisionTypeId, decision.authRule.functionalScopeId, amount);
            if (!validation.valid) {
                throw new common_1.ForbiddenException(`Decision exceeds authority limits: ${validation.reason}`);
            }
        }
        return this.updateState(decision.id, actor.id, DecisionStatus.APPROVED, { notes });
    }
    async handleEscalate(decision, actor, notes) {
        return this.updateState(decision.id, actor.id, DecisionStatus.ESCALATED, { notes });
    }
    async updateState(decisionId, actorPostingId, nextStatus, metadata) {
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
                    prevState: prevDecision?.status,
                    newState: nextStatus,
                    metadata: metadata,
                }
            });
            return decision;
        });
    }
    async findOne(id) {
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
        if (!decision)
            throw new common_1.BadRequestException('Decision not found');
        return decision;
    }
    async findAll(officeId) {
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
};
exports.DecisionService = DecisionService;
exports.DecisionService = DecisionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        doa_service_1.DoAService])
], DecisionService);
//# sourceMappingURL=decision.service.js.map