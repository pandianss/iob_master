import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const count = await prisma.department.count();
    console.log(`Total Departments: ${count}`);
    if (count > 0) {
        const depts = await prisma.department.findMany({ take: 5 });
        console.log('Sample Departments:', depts);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
