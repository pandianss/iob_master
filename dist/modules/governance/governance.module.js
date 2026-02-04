"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GovernanceModule = void 0;
const common_1 = require("@nestjs/common");
const governance_controller_1 = require("./governance.controller");
const office_controller_1 = require("./office.controller");
const obligation_controller_1 = require("./obligation.controller");
const governance_service_1 = require("./governance.service");
const doa_service_1 = require("./doa.service");
const office_service_1 = require("./office.service");
const obligation_service_1 = require("./obligation.service");
const prisma_service_1 = require("../../common/prisma.service");
let GovernanceModule = class GovernanceModule {
};
exports.GovernanceModule = GovernanceModule;
exports.GovernanceModule = GovernanceModule = __decorate([
    (0, common_1.Module)({
        controllers: [governance_controller_1.GovernanceController, office_controller_1.OfficeController, obligation_controller_1.ObligationController],
        providers: [governance_service_1.GovernanceService, doa_service_1.DoAService, office_service_1.OfficeService, obligation_service_1.ObligationService, prisma_service_1.PrismaService],
        exports: [governance_service_1.GovernanceService, doa_service_1.DoAService, office_service_1.OfficeService, obligation_service_1.ObligationService],
    })
], GovernanceModule);
//# sourceMappingURL=governance.module.js.map