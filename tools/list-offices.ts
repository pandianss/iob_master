import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const offices = await prisma.office.findMany({ select: { id: true, name: true, code: true } });
    console.log(JSON.stringify(offices, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
