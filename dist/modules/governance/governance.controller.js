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
exports.GovernanceController = void 0;
const common_1 = require("@nestjs/common");
const governance_service_1 = require("./governance.service");
let GovernanceController = class GovernanceController {
    governanceService;
    constructor(governanceService) {
        this.governanceService = governanceService;
    }
    getParameters() {
        return this.governanceService.getParameters();
    }
    getAllowedContexts() {
        return this.governanceService.findAllowedContexts();
    }
    createParameter(body) {
        return this.governanceService.createParameter(body);
    }
    updateParameter(id, body) {
        return this.governanceService.updateParameter(id, body);
    }
    deleteParameter(id) {
        return this.governanceService.deleteParameter(id);
    }
};
exports.GovernanceController = GovernanceController;
__decorate([
    (0, common_1.Get)('parameters'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GovernanceController.prototype, "getParameters", null);
__decorate([
    (0, common_1.Get)('allowed-contexts'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GovernanceController.prototype, "getAllowedContexts", null);
__decorate([
    (0, common_1.Post)('parameters'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], GovernanceController.prototype, "createParameter", null);
__decorate([
    (0, common_1.Put)('parameters/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], GovernanceController.prototype, "updateParameter", null);
__decorate([
    (0, common_1.Delete)('parameters/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GovernanceController.prototype, "deleteParameter", null);
exports.GovernanceController = GovernanceController = __decorate([
    (0, common_1.Controller)('governance'),
    __metadata("design:paramtypes", [governance_service_1.GovernanceService])
], GovernanceController);
//# sourceMappingURL=governance.controller.js.map