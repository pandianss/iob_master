import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding initial data...');

    // --- 1. Organization Masters ---
    console.log('Creating Organization Hierarchy...');

    // Level 1: Central Office (Root)
    const unitCO = await prisma.department.upsert({
        where: { code: 'CO' },
        update: {},
        create: { code: 'CO', name: 'Central Office', type: 'ADMINISTRATIVE', subType: 'CO' },
    });

    // Level 2: Functional Departments under CO
    const deptCredit = await prisma.department.upsert({
        where: { code: 'CREDIT' },
        update: { parentId: unitCO.id },
        create: { code: 'CREDIT', name: 'Credit Department', type: 'FUNCTIONAL', subType: 'DEPT', parentId: unitCO.id },
    });

    const deptIT = await prisma.department.upsert({
        where: { code: 'IT' },
        update: { parentId: unitCO.id },
        create: { code: 'IT', name: 'Information Technology', type: 'FUNCTIONAL', subType: 'DEPT', parentId: unitCO.id },
    });

    const deptHR = await prisma.department.upsert({
        where: { code: 'HR' },
        update: { parentId: unitCO.id },
        create: { code: 'HR', name: 'Human Resources', type: 'FUNCTIONAL', subType: 'DEPT', parentId: unitCO.id },
    });

    // Level 2: Regional Office (Administrative Unit under CO)
    const unitROChennai = await prisma.department.upsert({
        where: { code: 'RO-CHENNAI' },
        update: { parentId: unitCO.id },
        create: { code: 'RO-CHENNAI', name: 'Regional Office - Chennai', type: 'ADMINISTRATIVE', subType: 'RO', parentId: unitCO.id },
    });

    // Level 3: Branch (Administrative Unit under RO)
    const unitBranchAdyar = await prisma.department.upsert({
        where: { code: 'BR-ADYAR' },
        update: { parentId: unitROChennai.id },
        create: { code: 'BR-ADYAR', name: 'Adyar Branch', type: 'EXECUTIVE', subType: 'BRANCH', parentId: unitROChennai.id },
    });

    // Dummy ADMIN dept for existing references (optional, can alias to CO)
    const deptAdmin = await prisma.department.upsert({
        where: { code: 'ADMIN' },
        update: { parentId: unitCO.id },
        create: { code: 'ADMIN', name: 'Administration', type: 'FUNCTIONAL', subType: 'DEPT', parentId: unitCO.id },
    });

    console.log('Creating Regions (Legacy/Geographic)...');
    const regHO = await prisma.region.upsert({
        where: { code: 'HO' },
        update: {},
        create: { code: 'HO', name: 'Head Office', status: 'ACTIVE' },
    });

    const regRODelhi = await prisma.region.upsert({
        where: { code: 'RO-DEL' },
        update: {},
        create: { code: 'RO-DEL', name: 'Regional Office - Delhi', status: 'ACTIVE' },
    });

    // --- 2. Designations ---
    console.log('Creating Designations...');
    const desGM = await prisma.designation.upsert({
        where: { title: 'General Manager' },
        update: {},
        create: { title: 'General Manager', rank: 1, roleAbstraction: 'EXECUTIVE' },
    });

    const desDGM = await prisma.designation.upsert({
        where: { title: 'Deputy General Manager' },
        update: {},
        create: { title: 'Deputy General Manager', rank: 2, roleAbstraction: 'SENIOR_MGMT' },
    });

    const desAGM = await prisma.designation.upsert({
        where: { title: 'Asst. General Manager' },
        update: {},
        create: { title: 'Asst. General Manager', rank: 3, roleAbstraction: 'MIDDLE_MGMT' },
    });

    const desCM = await prisma.designation.upsert({
        where: { title: 'Chief Manager' },
        update: {},
        create: { title: 'Chief Manager', rank: 4, roleAbstraction: 'OPERATIONAL' },
    });

    const desMgr = await prisma.designation.upsert({
        where: { title: 'Manager' },
        update: {},
        create: { title: 'Manager', rank: 5, roleAbstraction: 'OPERATIONAL' },
    });

    // --- 3. Functional Scopes ---
    console.log('Creating Functional Scopes...');
    const scopeCreditSanction = await prisma.functionalScope.upsert({
        where: { code: 'CREDIT_SANCTION' },
        update: {},
        create: { code: 'CREDIT_SANCTION', name: 'Credit Sanction' },
    });

    const scopeITProcure = await prisma.functionalScope.upsert({
        where: { code: 'IT_PROCURE' },
        update: {},
        create: { code: 'IT_PROCURE', name: 'IT Assets Procurement' },
    });

    // --- 4. Users & Postings (Including Super User) ---
    console.log('Creating Users...');

    // Super User
    const superUser = await prisma.user.upsert({
        where: { identityRef: 'EMP00000' },
        update: {},
        create: { identityRef: 'EMP00000', name: 'System Administrator', email: 'admin@iob.in' },
    });
    // Give Super User a posting in ADMIN-HO as GM
    await prisma.posting.create({
        data: {
            userId: superUser.id,
            deptId: deptAdmin.id,
            regionId: regHO.id,
            designationId: desGM.id,
            status: 'ACTIVE'
        }
    });

    // Executive (GM Credit)
    const userGM = await prisma.user.upsert({
        where: { identityRef: 'EMP10001' },
        update: {},
        create: { identityRef: 'EMP10001', name: 'Rajiv Malhotra', email: 'gm.credit@iob.in' },
    });
    await prisma.posting.create({
        data: {
            userId: userGM.id,
            deptId: deptCredit.id,
            regionId: regHO.id,
            designationId: desGM.id,
            status: 'ACTIVE'
        }
    });

    // Operational (CM Credit)
    const userCM = await prisma.user.upsert({
        where: { identityRef: 'EMP20005' },
        update: {},
        create: { identityRef: 'EMP20005', name: 'Anita Desai', email: 'cm.credit.ho@iob.in' },
    });
    await prisma.posting.create({
        data: {
            userId: userCM.id,
            deptId: deptCredit.id,
            regionId: regHO.id,
            designationId: desCM.id,
            status: 'ACTIVE'
        }
    });

    // --- 5. DoA Rules ---
    console.log('Creating DoA Rules...');

    // Create dummy Decision Type for seeding
    const decisionType = await prisma.decisionType.upsert({
        where: { code: 'APPROVE' },
        update: {},
        create: { code: 'APPROVE', name: 'Approval', category: 'ADMIN' },
    });

    // CM Credit can Sanction up to 1 Crore
    await prisma.doARule.create({
        data: {
            authorityBodyType: 'DESIGNATION',
            authorityBodyId: desCM.id,
            decisionTypeId: decisionType.id,
            functionalScopeId: scopeCreditSanction.id,
            limitMin: 0,
            limitMax: 10000000, // 1 Crore
        }
    });

    // GM Credit can Sanction up to 10 Crores
    await prisma.doARule.create({
        data: {
            authorityBodyType: 'DESIGNATION',
            authorityBodyId: desGM.id,
            decisionTypeId: decisionType.id,
            functionalScopeId: scopeCreditSanction.id,
            limitMin: 10000001,
            limitMax: 100000000, // 10 Crores
        }
    });

    // --- 6. Governance Parameters ---
    console.log('Seeding Governance Parameters...');
    const params = [
        // Class A
        { code: 'deposits_total', name: 'Total Deposits', category: 'CLASS_A', unitLevel: 'ALL' },
        { code: 'advances_total', name: 'Total Advances', category: 'CLASS_A', unitLevel: 'ALL' },
        { code: 'npa_gross', name: 'Gross NPA', category: 'CLASS_A', unitLevel: 'ALL' },
        { code: 'profit', name: 'Profit / Contribution', category: 'CLASS_A', unitLevel: 'ALL' },

        // Class B
        { code: 'cd_ratio', name: 'CD Ratio', category: 'CLASS_B', unitLevel: 'ALL' },
        { code: 'casa_pct', name: 'CASA %', category: 'CLASS_B', unitLevel: 'ALL' },

        // Class C
        { code: 'agri_jl', name: 'AGRI JL', category: 'CLASS_C', segment: 'Agriculture', unitLevel: 'BRANCH' },
        { code: 'retail_jl', name: 'RETAIL JL', category: 'CLASS_C', segment: 'Retail', unitLevel: 'BRANCH' },

        // Class D
        { code: 'gap_month', name: 'Gap vs Month Target', category: 'CLASS_D', unitLevel: 'ALL' },
    ];

    for (const p of params) {
        await prisma.governanceParameter.upsert({
            where: { code: p.code },
            update: {},
            create: p,
        });
    }

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
