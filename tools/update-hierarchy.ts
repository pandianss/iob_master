import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const designations = [
    { title: 'DGM', rank: 580, titleHindi: 'उप महाप्रबंधक', titleTamil: 'துணை பொது மேலாளர்' },
    { title: 'AGM', rank: 570, titleHindi: 'सहायक महाप्रबंधक', titleTamil: 'உதவி பொது மேலாளர்' },
    { title: 'RO Chief Manager', rank: 560, titleHindi: 'मुख्य प्रबंधक (RO)', titleTamil: 'முதன்மை மேலாளர் (RO)' },
    { title: 'Branch AGM', rank: 410, titleHindi: 'शाखा एजीएम', titleTamil: 'கிளை உதவி பொது மேலாளர்' },
    { title: 'Branch Chief Manager', rank: 300, titleHindi: 'शाखा मुख्य प्रबंधक', titleTamil: 'கிளை முதன்மை மேலாளர்' },
    { title: 'Senior Manager', rank: 200, titleHindi: 'वरिष्ठ प्रबंधक', titleTamil: 'முதுநிலை மேலாளர்' },
    { title: 'Manager', rank: 150, titleHindi: 'प्रबंधक', titleTamil: 'மேலாளர்' },
    { title: 'Assistant Manager', rank: 100, titleHindi: 'सहायक प्रबंधक', titleTamil: 'உதவி மேலாளர்' },
    { title: 'Probationary Officer', rank: 70, titleHindi: 'परिवीक्षाधीन अधिकारी', titleTamil: null },
    { title: 'Senior Customer Service Associate', rank: 61, titleHindi: 'वरिष्ठ ग्राहक सेवा एसोसिएट', titleTamil: null },
    { title: 'Customer Service Associate', rank: 60, titleHindi: 'ग्राहक सेवा एसोसिएट', titleTamil: null },
    { title: 'General Manager', rank: 600, titleHindi: 'महाप्रबंधक', titleTamil: 'பொது மேலாளர்' } // Added as top level from screenshot
];

async function main() {
    console.log('Updating Hierarchy Ranks...');

    for (const d of designations) {
        await prisma.designation.upsert({
            where: {
                title_rank: {
                    title: d.title,
                    rank: d.rank
                }
            },
            update: {
                titleHindi: d.titleHindi,
                titleTamil: d.titleTamil
            },
            create: {
                title: d.title,
                rank: d.rank,
                titleHindi: d.titleHindi,
                titleTamil: d.titleTamil
            }
        });
        console.log(`Upserted: ${d.title} (Rank: ${d.rank})`);
    }

    // Update Admin User Role
    console.log('\nUpdating Admin User Role...');
    const adminUser = await prisma.user.findFirst({
        where: { email: 'admin@iob.in' } // Assuming this is the admin
    });

    if (adminUser) {
        await prisma.user.update({
            where: { id: adminUser.id },
            data: { role: 'ADMIN' }
        });
        console.log(`Updated user ${adminUser.name} to role ADMIN.`);
    } else {
        console.log('Admin user not found, skipping role update.');
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
