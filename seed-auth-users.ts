
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const osUser = 'Acer'; // Your OS Username

    // Upsert user 'Acer'
    const user = await prisma.user.upsert({
        where: { identityRef: osUser },
        update: {},
        create: {
            identityRef: osUser,
            name: 'Acer System User',
            email: 'acer@iob.in',
        }
    });
    console.log(`Ensured user exists: ${user.identityRef}`);

    // Upsert admin 'EMP00000'
    const admin = await prisma.user.upsert({
        where: { identityRef: 'EMP00000' },
        update: {},
        create: {
            identityRef: 'EMP00000',
            name: 'System Administrator',
            email: 'admin@iob.in',
        }
    });
    console.log(`Ensured admin exists: ${admin.identityRef}`);

    // Ensure Office exists for Admin (to test Viewing As)
    const office = await prisma.office.upsert({
        where: { code: 'MD-CEO' },
        update: {},
        create: {
            code: 'MD-CEO',
            name: 'Managing Director & CEO',
            tier: 'TIER_2_EXECUTIVE'
        }
    });

    // Link Admin to Office
    await prisma.tenure.create({
        data: {
            officeId: office.id,
            userId: admin.id,
            startDate: new Date(),
            status: 'ACTIVE'
        }
    });
    console.log('Linked Admin to MD-CEO Office');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
