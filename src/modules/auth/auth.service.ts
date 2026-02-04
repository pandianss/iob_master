
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
                        department: true
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

        // 2. Admin Check
        // Hardcoded admin identity for demo purposes
        if (identity === 'EMP00000') {
            if (!password || password !== 'admin123') {
                throw new UnauthorizedException('Invalid Admin Password');
            }
            return {
                status: 'SUCCESS',
                user: user,
                role: 'ADMIN'
            };
        }

        // 3. Domain User (Implicit Trust in Dev/Intranet Env)
        return {
            status: 'SUCCESS',
            user: user,
            role: 'USER'
        };
    }
}
