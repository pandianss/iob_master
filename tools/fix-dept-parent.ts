import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fix() {
    console.log('Fixing "Financial Inclusion Department" parent link...');

    // 1. Find the RO
    const ro = await prisma.department.findFirst({
        where: { subType: 'RO' }
    });

    if (!ro) {
        console.error('Regional Office not found! Cannot link.');
        return;
    }
    console.log(`Found RO: ${ro.name} (${ro.id})`);

    // 2. Find the Department
    const dept = await prisma.department.findFirst({
        where: { name: { contains: 'Financial Inclusion' } }
    });

    if (!dept) {
        console.error('Department not found!');
        return;
    }
    console.log(`Found Dept: ${dept.name} (Current Parent: ${dept.parentId})`);

    // 3. Update
    if (dept.parentId === ro.id) {
        console.log('Already linked correctly.');
    } else {
        await prisma.department.update({
            where: { id: dept.id },
            data: { parentId: ro.id }
        });
        console.log('SUCCESS: Linked to RO.');
    }
}

fix()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
