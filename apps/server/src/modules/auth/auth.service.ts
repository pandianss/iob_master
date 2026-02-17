
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService) { }

    async login(identity: string, password?: string) {
        // 1. Identify User
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
            throw new UnauthorizedException('User not found in system');
        }

        // 2. Password Check (Enforce iob@123 for all users as per request)
        // Note: EMP00000 can use either its legacy password or the new global default
        const isGlobalDefault = password === 'iob@123';
        const isLegacyAdmin = identity === 'EMP00000' && password === 'admin123';

        if (!isGlobalDefault && !isLegacyAdmin) {
            throw new UnauthorizedException('Invalid Password');
        }

        // 3. Return dynamic role from database (Defaults to STAFF if not set)
        return {
            status: 'SUCCESS',
            user: user,
            role: user.role || 'STAFF'
        };
    }
}
