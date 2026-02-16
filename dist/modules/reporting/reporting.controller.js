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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportingController = void 0;
const common_1 = require("@nestjs/common");
const reporting_service_1 = require("./reporting.service");
let ReportingController = class ReportingController {
    reportingService;
    constructor(reportingService) {
        this.reportingService = reportingService;
    }
    async getInbox(identityRef) {
        return this.reportingService.getPendingApprovals(identityRef);
    }
    async getInboxStats(identityRef) {
        return this.reportingService.getInboxStats(identityRef);
    }
    async getDoABreaches() {
        return this.reportingService.getDoABreachStats();
    }
    async getDeptCompliance(deptCode) {
        return this.reportingService.getComplianceScore(deptCode);
    }
    async getSnapshot(date) {
        return this.reportingService.getBusinessSnapshot(date ? new Date(date) : undefined);
    }
    async getComparison(t, tMinus1, monthEnd, fyEnd, fyStart) {
        return this.reportingService.getComparisonSnapshot({
            t: new Date(t),
            tMinus1: new Date(tMinus1),
            monthEnd: new Date(monthEnd),
            fyEnd: new Date(fyEnd),
            fyStart: new Date(fyStart)
        });
    }
    async saveTarget(data) {
        return this.reportingService.saveTarget({
            ...data,
            targetDate: new Date(data.targetDate)
        });
    }
};
exports.ReportingController = ReportingController;
__decorate([
    (0, common_1.Get)('inbox/:identityRef'),
    __param(0, (0, common_1.Param)('identityRef')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportingController.prototype, "getInbox", null);
__decorate([
    (0, common_1.Get)('inbox/:identityRef/stats'),
    __param(0, (0, common_1.Param)('identityRef')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportingController.prototype, "getInboxStats", null);
__decorate([
    (0, common_1.Get)('doa-breaches'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReportingController.prototype, "getDoABreaches", null);
__decorate([
    (0, common_1.Get)('compliance/:deptCode'),
    __param(0, (0, common_1.Param)('deptCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportingController.prototype, "getDeptCompliance", null);
__decorate([
    (0, common_1.Get)('business-snapshot'),
    __param(0, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportingController.prototype, "getSnapshot", null);
__decorate([
    (0, common_1.Get)('business-snapshot/comparison'),
    __param(0, (0, common_1.Query)('t')),
    __param(1, (0, common_1.Query)('tMinus1')),
    __param(2, (0, common_1.Query)('monthEnd')),
    __param(3, (0, common_1.Query)('fyEnd')),
    __param(4, (0, common_1.Query)('fyStart')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ReportingController.prototype, "getComparison", null);
__decorate([
    (0, common_1.Post)('business-snapshot/targets'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportingController.prototype, "saveTarget", null);
exports.ReportingController = ReportingController = __decorate([
    (0, common_1.Controller)('reporting'),
    __metadata("design:paramtypes", [reporting_service_1.ReportingService])
], ReportingController);
//# sourceMappingURL=reporting.controller.js.map