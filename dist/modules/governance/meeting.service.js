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
exports.MeetingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
let MeetingService = class MeetingService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async scheduleMeeting(committeeId, scheduledAt, venue, description) {
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
    async addToAgenda(meetingId, decisionId, order) {
        const meeting = await this.prisma.committeeMeeting.findUnique({ where: { id: meetingId } });
        if (!meeting)
            throw new common_1.NotFoundException('Meeting not found');
        return this.prisma.agendaItem.create({
            data: {
                meetingId,
                decisionId,
                order,
                outcome: 'PENDING'
            }
        });
    }
    async recordAttendance(meetingId, attendance) {
        const meeting = await this.prisma.committeeMeeting.findUnique({ where: { id: meetingId } });
        if (!meeting)
            throw new common_1.NotFoundException('Meeting not found');
        await this.prisma.meetingAttendance.deleteMany({ where: { meetingId } });
        return this.prisma.meetingAttendance.createMany({
            data: attendance.map(a => ({
                meetingId,
                designationId: a.designationId,
                isPresent: a.isPresent
            }))
        });
    }
    async updateAgendaOutcome(agendaItemId, outcome, outcomeNotes) {
        const agendaItem = await this.prisma.agendaItem.findUnique({
            where: { id: agendaItemId },
            include: { decision: true }
        });
        if (!agendaItem)
            throw new common_1.NotFoundException('Agenda item not found');
        const updatedItem = await this.prisma.agendaItem.update({
            where: { id: agendaItemId },
            data: { outcome, outcomeNotes }
        });
        if (outcome === 'APPROVED') {
            await this.prisma.decision.update({
                where: { id: agendaItem.decisionId },
                data: { status: 'APPROVED' }
            });
        }
        else if (outcome === 'DECLINED') {
            await this.prisma.decision.update({
                where: { id: agendaItem.decisionId },
                data: { status: 'DECLINED' }
            });
        }
        return updatedItem;
    }
    async finalizeMeeting(meetingId, minutesUrl, minutesHash) {
        const meeting = await this.prisma.committeeMeeting.findUnique({
            where: { id: meetingId },
            include: { agendaItems: true }
        });
        if (!meeting)
            throw new common_1.NotFoundException('Meeting not found');
        const allOutcomesRecorded = meeting.agendaItems.every(item => item.outcome !== 'PENDING');
        if (!allOutcomesRecorded) {
            throw new common_1.BadRequestException('Cannot finalize meeting: some agenda items have pending outcomes');
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
    async getMeetingsByCommittee(committeeId) {
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
};
exports.MeetingService = MeetingService;
exports.MeetingService = MeetingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MeetingService);
//# sourceMappingURL=meeting.service.js.map