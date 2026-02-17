import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';

@Injectable()
export class CommitteeService {
    constructor(private prisma: PrismaService) { }

    async createMeeting(committeeId: string, scheduledAt: Date) {
        return this.prisma.committeeMeeting.create({
            data: {
                committeeId,
                scheduledAt,
                status: 'SCHEDULED',
            }
        });
    }

    async validateQuorum(meetingId: string) {
        const meeting = await this.prisma.committeeMeeting.findUnique({
            where: { id: meetingId },
            include: {
                committee: {
                    include: { quorumRule: true, members: true }
                }
            }
        });

        if (!meeting) throw new BadRequestException('Meeting not found');

        const quorumRule = meeting.committee.quorumRule;
        if (!quorumRule) return true; // Default to true if no specific rule

        // Mocking presence check (in a real system, this would look at Attendance records)
        const presentMembersCount = meeting.committee.members.length; // Placeholder

        const isQuorumMet = presentMembersCount >= quorumRule.minMembers;

        await this.prisma.committeeMeeting.update({
            where: { id: meetingId },
            data: { quorumSatisfied: isQuorumMet }
        });

        return isQuorumMet;
    }

    async finalizeDecision(meetingId: string, decisionData: any, initiatorPostingId: string) {
        const meeting = await this.prisma.committeeMeeting.findUnique({
            where: { id: meetingId },
            include: { committee: true }
        });

        if (!meeting || !meeting.quorumSatisfied) {
            throw new BadRequestException('Quorum not satisfied for this meeting');
        }

        // Create a official Decision object linked to the committee
        return this.prisma.decision.create({
            data: {
                initiatorPostingId,
                deptContextId: meeting.committee.scopeAnchorCode || 'CENTRAL', // Mapping
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
}
