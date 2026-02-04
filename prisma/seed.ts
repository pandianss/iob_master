import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding initial data...');

    // --- 1. Organization Masters ---
    console.log('Creating Organization Hierarchy...');

    // Level 1: Central Office (Root)
    const unitCO = await prisma.department.upsert({
        where: { code: 'CO' },
        update: {
            statutoryBasis: 'Banking Regulation Act, 1949',
            mandateStatement: 'Supreme administrative and policy-making body of Indian Overseas Bank. Responsible for pan-India operations and regulatory compliance.',
            geographicalScope: 'PAN_INDIA',
            powers: ['POLICY_FORMULATION', 'EXECUTIVE_OVERSIGHT', 'BUDGET_APPROVAL'],
            dataRoles: ['GOVERNANCE_OWNER', 'AGGREGATOR'],
            riskCategory: 'SYSTEMIC',
            inspectionCycle: 'ANNUAL',
            auditTrailEnabled: true
        },
        create: {
            code: 'CO',
            name: 'Central Office',
            type: 'ADMINISTRATIVE',
            subType: 'CO',
            statutoryBasis: 'Banking Regulation Act, 1949',
            mandateStatement: 'Supreme administrative and policy-making body of Indian Overseas Bank.',
            geographicalScope: 'PAN_INDIA',
            powers: ['POLICY_FORMULATION', 'EXECUTIVE_OVERSIGHT']
        },
    });

    // Level 2: Functional Departments under CO
    const deptCredit = await prisma.department.upsert({
        where: { code: 'CREDIT' },
        update: {
            parentId: unitCO.id,
            mandateStatement: 'Formulation of Credit Policy, Sanction of High-Value Loans, and Monitoring of Asset Quality.',
            powers: ['SANCTION', 'RECOMMEND', 'VETO'],
            policiesOwned: ['Loan Policy', 'NPA Management Framework'],
            riskCategory: 'HIGH',
            vigilanceSensitivity: 'CRITICAL'
        },
        create: {
            code: 'CREDIT',
            name: 'Credit Department',
            type: 'FUNCTIONAL',
            subType: 'DEPT',
            parentId: unitCO.id,
            mandateStatement: 'Formulation of Credit Policy and Sanction of High-Value Loans.',
            powers: ['SANCTION', 'RECOMMEND']
        },
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
        update: {
            parentId: unitCO.id,
            geographicalScope: 'REGIONAL',
            mandateStatement: 'Supervision of branches in Chennai region and execution of CO policies.',
            powers: ['EXECUTE', 'MONITOR'],
            inspectionCycle: 'RISK_BASED'
        },
        create: {
            code: 'RO-CHENNAI',
            name: 'Regional Office - Chennai',
            type: 'ADMINISTRATIVE',
            subType: 'RO',
            parentId: unitCO.id,
            mandateStatement: 'Supervision of branches in Chennai region.'
        },
    });

    // Level 3: Branch (Administrative Unit under RO)
    const unitBranchAdyar = await prisma.department.upsert({
        where: { code: 'BR-ADYAR' },
        update: { parentId: unitROChennai.id },
        create: { code: 'BR-ADYAR', name: 'Adyar Branch', type: 'EXECUTIVE', subType: 'BRANCH', parentId: unitROChennai.id },
    });

    // Dummy ADMIN dept -> Facilities
    const deptAdmin = await prisma.department.upsert({
        where: { code: 'ADMIN' },
        update: { name: 'Facilities Management' },
        create: { code: 'ADMIN', name: 'Facilities Management', type: 'FUNCTIONAL', subType: 'DEPT', parentId: unitCO.id },
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

    // --- 7. Governance & Offices Refactor ---
    console.log('Seeding Governance Entities...');

    // 7.1 Committees
    const commBoard = await prisma.governanceCommittee.upsert({
        where: { id: 'COMMITTEE-BOARD' }, // Using fixed IDs for ease of reference if possible, or upsert by name if unique field exists. Name not unique in schema? Schema has no unique on name. Creating usually.
        update: {},
        create: { name: 'Board of Directors', mandate: 'Supreme Governance Body' },
    });
    const commACB = await prisma.governanceCommittee.create({
        data: { name: 'Audit Committee of Board (ACB)', mandate: 'Financial Oversight' }
    });

    // 7.0 System Administrator (Tier 0)
    const officeSysAdmin = await prisma.office.upsert({
        where: { code: 'SYS-ADMIN' },
        update: {},
        create: { code: 'SYS-ADMIN', name: 'System Administrator', tier: 'TIER_0_SYSTEM', vetoPower: true }
    });

    // Map System Admin to SYS-ADMIN Office
    await prisma.tenure.create({
        data: {
            officeId: officeSysAdmin.id,
            userId: superUser.id,
            startDate: new Date(),
            status: 'ACTIVE'
        }
    });

    // 7.2 Offices (Tier 1 - Governance)
    const officeChair = await prisma.office.upsert({
        where: { code: 'CHAIRMAN' },
        update: {},
        create: { code: 'CHAIRMAN', name: 'Chairman of the Board', tier: 'TIER_1_GOVERNANCE', vetoPower: true }
    });

    // 7.3 Offices (Tier 2 - Executive)
    const officeMD = await prisma.office.upsert({
        where: { code: 'MD-CEO' },
        update: {},
        create: { code: 'MD-CEO', name: 'Managing Director & CEO', tier: 'TIER_2_EXECUTIVE', vetoPower: true }
    });

    const officeGMCredit = await prisma.office.upsert({
        where: { code: 'GM-CREDIT' },
        update: {},
        create: {
            code: 'GM-CREDIT',
            name: 'General Manager (Credit)',
            tier: 'TIER_2_EXECUTIVE',
            departmentId: deptCredit.id
        }
    });

    // 7.4 Offices (Tier 3 - Execution)
    const officeRMChennai = await prisma.office.upsert({
        where: { code: 'RM-CHENNAI' },
        update: {},
        create: {
            code: 'RM-CHENNAI',
            name: 'Regional Head - Chennai',
            tier: 'TIER_3_EXECUTION',
            departmentId: unitROChennai.id
        }
    });

    const officeBMAdyar = await prisma.office.upsert({
        where: { code: 'BM-ADYAR' },
        update: {},
        create: {
            code: 'BM-ADYAR',
            name: 'Branch Manager - Adyar',
            tier: 'TIER_3_EXECUTION',
            departmentId: unitBranchAdyar.id
        }
    });

    // 7.5 Tenures (Mapping Users to Offices)
    // Map Rajiv Malhotra (GM) to GM Credit Office
    await prisma.tenure.create({
        data: {
            officeId: officeGMCredit.id,
            userId: userGM.id,
            startDate: new Date(),
            status: 'ACTIVE'
        }
    });

    // Map System Admin to Chairman (for demo purposes) - or leave empty?
    // Let's map Admin to MD for now to give power.
    await prisma.tenure.create({
        data: {
            officeId: officeMD.id,
            userId: superUser.id,
            startDate: new Date(),
            status: 'ACTIVE'
        }
    });


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
