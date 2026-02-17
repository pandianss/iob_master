import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function inspect() {
    console.log('Inspecting "Financial Inclusion Department"...');

    // Find the department
    const dept = await prisma.department.findFirst({
        where: { name: { contains: 'Financial Inclusion' } },
        include: { parent: true }
    });

    if (!dept) {
        console.log('Department not found!');
        return;
    }

    console.log('Department Found:');
    console.log(`- ID: ${dept.id}`);
    console.log(`- Name: ${dept.name}`);
    console.log(`- Parent ID: ${dept.parentId}`);
    if (dept.parent) {
        console.log(`- Parent Name: ${dept.parent.name}`);
        console.log(`- Parent Code: ${dept.parent.code}`);
    } else {
        console.log('- Parent Relation: NULL');
    }

    // Also check the RO
    const ro = await prisma.department.findFirst({
        where: { subType: 'RO' }
    });
    if (ro) {
        console.log('\nRegional Office (Potential Parent):');
        console.log(`- ID: ${ro.id}`);
        console.log(`- Name: ${ro.name}`);
        console.log(`- Code: ${ro.code}`);
    }
}

inspect()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
