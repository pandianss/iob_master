import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';

@Injectable()
export class MeetingService {
    constructor(private prisma: PrismaService) { }

    async scheduleMeeting(committeeId: string, scheduledAt: Date, venue?: string, description?: string) {
        return this.prisma.committeeMeeting.create({
            data: {
                committeeId,
                scheduledAt,
                venue,
                description,
                status: 'SCHEDULED'
            }
        });
    }

    async addToAgenda(meetingId: string, decisionId: string, order: number) {
        const meeting = await this.prisma.committeeMeeting.findUnique({ where: { id: meetingId } });
        if (!meeting) throw new NotFoundException('Meeting not found');

        return this.prisma.agendaItem.create({
            data: {
                meetingId,
                decisionId,
                order,
                outcome: 'PENDING'
            }
        });
    }

    async recordAttendance(meetingId: string, attendance: { designationId: string; isPresent: boolean }[]) {
        const meeting = await this.prisma.committeeMeeting.findUnique({ where: { id: meetingId } });
        if (!meeting) throw new NotFoundException('Meeting not found');

        // Delete existing attendance records if any
        await this.prisma.meetingAttendance.deleteMany({ where: { meetingId } });

        return this.prisma.meetingAttendance.createMany({
            data: attendance.map(a => ({
                meetingId,
                designationId: a.designationId,
                isPresent: a.isPresent
            }))
        });
    }

    async updateAgendaOutcome(agendaItemId: string, outcome: string, outcomeNotes?: string) {
        const agendaItem = await this.prisma.agendaItem.findUnique({
            where: { id: agendaItemId },
            include: { decision: true }
        });
        if (!agendaItem) throw new NotFoundException('Agenda item not found');

        // Update the agenda item outcome
        const updatedItem = await this.prisma.agendaItem.update({
            where: { id: agendaItemId },
            data: { outcome, outcomeNotes }
        });

        // If outcome is APPROVED or DECLINED, update the underlying decision status
        if (outcome === 'APPROVED') {
            await this.prisma.decision.update({
                where: { id: agendaItem.decisionId },
                data: { status: 'APPROVED' }
            });
        } else if (outcome === 'DECLINED') {
            await this.prisma.decision.update({
                where: { id: agendaItem.decisionId },
                data: { status: 'DECLINED' }
            });
        }

        return updatedItem;
    }

    async finalizeMeeting(meetingId: string, minutesUrl?: string, minutesHash?: string) {
        const meeting = await this.prisma.committeeMeeting.findUnique({
            where: { id: meetingId },
            include: { agendaItems: true }
        });
        if (!meeting) throw new NotFoundException('Meeting not found');

        const allOutcomesRecorded = meeting.agendaItems.every(item => item.outcome !== 'PENDING');
        if (!allOutcomesRecorded) {
            throw new BadRequestException('Cannot finalize meeting: some agenda items have pending outcomes');
        }

        return this.prisma.committeeMeeting.update({
            where: { id: meetingId },
            data: {
                status: 'CONCLUDED',
                minutesUrl,
                minutesHash
            }
        });
    }

    async getMeetingsByCommittee(committeeId: string) {
        return this.prisma.committeeMeeting.findMany({
            where: { committeeId },
            include: {
                agendaItems: {
                    include: { decision: true }
                },
                attendance: {
                    include: { designation: true }
                }
            },
            orderBy: { scheduledAt: 'desc' }
        });
    }
}
