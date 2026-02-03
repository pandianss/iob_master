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
exports.CommitteeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
let CommitteeService = class CommitteeService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createMeeting(committeeId, scheduledAt) {
        return this.prisma.committeeMeeting.create({
            data: {
                committeeId,
                scheduledAt,
                status: 'SCHEDULED',
            }
        });
    }
    async validateQuorum(meetingId) {
        const meeting = await this.prisma.committeeMeeting.findUnique({
            where: { id: meetingId },
            include: {
                committee: {
                    include: { quorumRule: true, members: true }
                }
            }
        });
        if (!meeting)
            throw new common_1.BadRequestException('Meeting not found');
        const quorumRule = meeting.committee.quorumRule;
        if (!quorumRule)
            return true;
        const presentMembersCount = meeting.committee.members.length;
        const isQuorumMet = presentMembersCount >= quorumRule.minMembers;
        await this.prisma.committeeMeeting.update({
            where: { id: meetingId },
            data: { quorumSatisfied: isQuorumMet }
        });
        return isQuorumMet;
    }
    async finalizeDecision(meetingId, decisionData, initiatorPostingId) {
        const meeting = await this.prisma.committeeMeeting.findUnique({
            where: { id: meetingId },
            include: { committee: true }
        });
        if (!meeting || !meeting.quorumSatisfied) {
            throw new common_1.BadRequestException('Quorum not satisfied for this meeting');
        }
        return this.prisma.decision.create({
            data: {
                initiatorPostingId,
                deptContextId: meeting.committee.scopeAnchorCode || 'CENTRAL',
                regionContextId: meeting.committee.scopeAnchorCode || 'CO',
                status: 'APPROVED',
                outcomeData: {
                    ...decisionData,
                    committeeId: meeting.committeeId,
                    meetingId: meeting.id,
                },
            }
        });
    }
};
exports.CommitteeService = CommitteeService;
exports.CommitteeService = CommitteeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CommitteeService);
//# sourceMappingURL=committee.service.js.map