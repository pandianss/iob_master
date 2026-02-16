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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
let AuthService = class AuthService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async login(identity, password) {
        const user = await this.prisma.user.findFirst({
            where: { identityRef: identity },
            include: {
                postings: {
                    include: {
                        designation: true,
                        departments: true,
                    }
                },
                tenures: {
                    where: { status: 'ACTIVE' },
                    include: {
                        office: true
                    }
                }
            }
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found in system');
        }
        if (identity === 'EMP00000') {
            if (!password || password !== 'admin123') {
                throw new common_1.UnauthorizedException('Invalid Admin Password');
            }
            return {
                status: 'SUCCESS',
                user: user,
                role: 'ADMIN'
            };
        }
        return {
            status: 'SUCCESS',
            user: user,
            role: 'USER'
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map