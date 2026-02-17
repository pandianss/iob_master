import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Governance Contexts...');

    // 1. Create Decision Types
    const types = [
        { code: 'HV-DD', name: 'High Value DD Approval', category: 'ADMIN' },
        { code: 'CSR-REC', name: 'CSR Recommendation', category: 'ADMIN' },
        { code: 'EXPENSE', name: 'General Administrative Expenses', category: 'ADMIN' },
        { code: 'AR9', name: 'AR9 - Asset Recovery', category: 'CREDIT' },
        { code: 'CAF', name: 'CAF - Credit Appraisal', category: 'CREDIT' },
        { code: 'BPI', name: 'Broken Period Interest Waiver', category: 'CREDIT' },
        { code: 'INT-TBL', name: 'Change in Interest Table', category: 'ADMIN' },
        { code: 'CR-SANCTION', name: 'Credit Sanction (Standard)', category: 'CREDIT' },
    ];

    for (const type of types) {
        await prisma.decisionType.upsert({
            where: { code: type.code },
            update: {},
            create: type,
        });
    }

    // 2. Create Functional Scopes
    const scopes = [
        { code: 'DOM-OPS', name: 'Domestic Operations' },
        { code: 'INTL-BNK', name: 'International Banking' },
        { code: 'TREASURY', name: 'Treasury & Investment' },
        { code: 'CSR-SCOPE', name: 'CSR & Sustainability' },
    ];

    for (const scope of scopes) {
        await prisma.functionalScope.upsert({
            where: { code: scope.code },
            update: {},
            create: scope,
        });
    }

    // 3. Map Availabilities (Example: Regional Office (RO))
    const roType = await prisma.decisionType.findUnique({ where: { code: 'HV-DD' } });
    const domScope = await prisma.functionalScope.findUnique({ where: { code: 'DOM-OPS' } });

    // Seed RO specific availabilities
    const roContexts = [
        { typeCode: 'HV-DD', scopeCode: 'DOM-OPS' },
        { typeCode: 'CSR-REC', scopeCode: 'CSR-SCOPE' },
        { typeCode: 'EXPENSE', scopeCode: 'DOM-OPS' },
        { typeCode: 'AR9', scopeCode: 'DOM-OPS' },
        { typeCode: 'CAF', scopeCode: 'DOM-OPS' },
        { typeCode: 'BPI', scopeCode: 'DOM-OPS' },
        { typeCode: 'INT-TBL', scopeCode: 'DOM-OPS' },
    ];

    for (const context of roContexts) {
        const dt = await prisma.decisionType.findUnique({ where: { code: context.typeCode } });
        const fs = await prisma.functionalScope.findUnique({ where: { code: context.scopeCode } });

        if (dt && fs) {
            await prisma.unitAvailability.upsert({
                where: {
                    deptId_unitType_decisionTypeId_functionalScopeId: {
                        deptId: null as any, // Null for generic unit type mapping
                        unitType: 'RO',
                        decisionTypeId: dt.id,
                        functionalScopeId: fs.id,
                    }
                },
                update: {},
                create: {
                    unitType: 'RO',
                    decisionTypeId: dt.id,
                    functionalScopeId: fs.id,
                }
            });
        }
    }

    console.log('Seed Completed Successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
