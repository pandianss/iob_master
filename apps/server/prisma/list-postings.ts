import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const postings = await prisma.posting.findMany({
        include: {
            user: true,
            department: true,
            region: true,
            designation: true
        }
    });

    console.log('--- ALL ACTIVE POSTINGS ---');
    postings.forEach(p => {
        console.log(`ID: ${p.id} | User: ${p.user.name} | Dept: ${p.department.name} (${p.department.type}) | Region: ${p.region.name}`);
    });
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
