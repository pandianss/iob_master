import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding initial data...');

    // --- 1. Organization Masters ---
    console.log('Creating Organization Hierarchy...');

    // Level 1: Regional Office (Root Unit for the entire platform)
    const unitROChennai = await prisma.department.upsert({
        where: { code: 'RO-CHENNAI' },
        update: {
            parentId: null, // Root
            geographicalScope: 'REGIONAL',
            mandateStatement: 'Supreme administrative authority for the region. Coordination between policy and execution.',
            powers: ['EXECUTE', 'MONITOR', 'SANCTION_REGIONAL'],
            inspectionCycle: 'RISK_BASED'
        },
        create: {
            code: 'RO-CHENNAI',
            name: 'Regional Office - Chennai',
            type: 'ADMINISTRATIVE',
            subType: 'RO',
            parentId: null,
            mandateStatement: 'Supervision of branches in Chennai region.'
        },
    });

    // Level 3: RO Functional Departments (Under RO Chennai)
    const roDepts = [
        { code: 'RO-CH-CREDIT', name: 'RO Chennai - Credit', subType: 'DEPT' },
        { code: 'RO-CH-RECOVERY', name: 'RO Chennai - Recovery & NPA', subType: 'DEPT' },
        { code: 'RO-CH-RETAIL', name: 'RO Chennai - Retail & MSME', subType: 'DEPT' },
        { code: 'RO-CH-AGRI', name: 'RO Chennai - Agri & FI', subType: 'DEPT' },
        { code: 'RO-CH-PLANNING', name: 'RO Chennai - Planning & Development', subType: 'DEPT' },
        { code: 'RO-CH-INSPECTION', name: 'RO Chennai - Inspection & Audit', subType: 'DEPT' },
        { code: 'RO-CH-HR', name: 'RO Chennai - HR & Admin', subType: 'DEPT' },
        { code: 'RO-CH-IT', name: 'RO Chennai - IT & Digital', subType: 'DEPT' },
    ];

    for (const dept of roDepts) {
        await prisma.department.upsert({
            where: { code: dept.code },
            update: { parentId: unitROChennai.id },
            create: {
                ...dept,
                type: 'FUNCTIONAL',
                parentId: unitROChennai.id
            }
        });
    }

    // Level 3: Branch (Administrative Unit under RO)
    const unitBranchAdyar = await prisma.department.upsert({
        where: { code: 'BR-ADYAR' },
        update: { parentId: unitROChennai.id },
        create: { code: 'BR-ADYAR', name: 'Adyar Branch', type: 'EXECUTIVE', subType: 'BRANCH', parentId: unitROChennai.id },
    });

    // Facilities (Mapped to RO for consistency)
    const deptAdmin = await prisma.department.upsert({
        where: { code: 'ADMIN' },
        update: { name: 'Facilities Management', parentId: unitROChennai.id },
        create: { code: 'ADMIN', name: 'Facilities Management', type: 'FUNCTIONAL', subType: 'DEPT', parentId: unitROChennai.id },
    });

    console.log('Creating Region Master Pivot...');
    const regPrimary = await prisma.region.upsert({
        where: { code: 'RO-CH' },
        update: { updatedAt: new Date() },
        create: {
            code: 'RO-CH',
            name: 'Chennai Regional Office',
            nameHindi: 'चेन्नई क्षेत्रीय कार्यालय',
            nameTamil: 'சென்னை மண்டல அலுவலகம்',
            status: 'ACTIVE'
        },
    });

    // --- 2. Designations ---
    console.log('Creating Designations...');
    const desGM = await prisma.designation.upsert({
        where: { title_rank: { title: 'General Manager', rank: 1 } },
        update: {},
        create: { title: 'General Manager', rank: 1 },
    });

    const desDGM = await prisma.designation.upsert({
        where: { title_rank: { title: 'Deputy General Manager', rank: 2 } },
        update: {},
        create: { title: 'Deputy General Manager', rank: 2 },
    });

    const desAGM = await prisma.designation.upsert({
        where: { title_rank: { title: 'Asst. General Manager', rank: 3 } },
        update: {},
        create: { title: 'Asst. General Manager', rank: 3 },
    });

    const desCM = await prisma.designation.upsert({
        where: { title_rank: { title: 'Chief Manager', rank: 4 } },
        update: {},
        create: { title: 'Chief Manager', rank: 4 },
    });

    const desMgr = await prisma.designation.upsert({
        where: { title_rank: { title: 'Manager', rank: 5 } },
        update: {},
        create: { title: 'Manager', rank: 5 },
    });

    // --- 3. Functional Scopes (Standardized to Departments) ---
    console.log('Creating Functional Scopes...');
    const scopes = [
        { code: 'CREDIT_SANCTION', name: 'Credit & Sanctions' },
        { code: 'RECOVERY_NPA', name: 'Recovery & Monitoring' },
        { code: 'RETAIL_MSME', name: 'Retail Lending' },
        { code: 'AGRI_FI', name: 'Agri & Financial Inclusion' },
        { code: 'PLANNING_STRATEGY', name: 'Planning & Strategy' },
        { code: 'HR_ADMIN', name: 'Human Resources & Admin' },
        { code: 'IT_DIGITAL', name: 'IT & Digital Banking' },
        { code: 'INSPECTION_AUDIT', name: 'Inspection & Audit' }
    ];

    const scopeMap: any = {};
    for (const s of scopes) {
        scopeMap[s.code] = await prisma.functionalScope.upsert({
            where: { code: s.code },
            update: { name: s.name },
            create: s,
        });
    }

    // --- 4. Users & Postings (Including Super User) ---
    console.log('Creating Users...');

    // Super User
    const superUser = await prisma.user.upsert({
        where: { identityRef: 'EMP00000' },
        update: { updatedAt: new Date() },
        create: { identityRef: 'EMP00000', name: 'System Administrator', email: 'admin@iob.in' },
    });
    // Give Super User a posting in ADMIN-HO as GM
    await prisma.posting.create({
        data: {
            userId: superUser.id,
            deptId: deptAdmin.id,
            regionId: regPrimary.id,
            designationId: desGM.id,
            status: 'ACTIVE'
        }
    });

    // Executive (GM Credit) - Now Focalized on RO
    const userGM = await prisma.user.upsert({
        where: { identityRef: 'EMP10001' },
        update: { updatedAt: new Date() },
        create: { identityRef: 'EMP10001', name: 'Rajiv Malhotra', email: 'gm.credit@iob.in' },
    });

    const roCredit = await prisma.department.findUnique({ where: { code: 'RO-CH-CREDIT' } });

    await prisma.posting.create({
        data: {
            userId: userGM.id,
            deptId: roCredit!.id,
            regionId: regPrimary.id,
            designationId: desGM.id,
            status: 'ACTIVE'
        }
    });

    // Operational (CM Credit) - Now Focalized on RO
    const userCM = await prisma.user.upsert({
        where: { identityRef: 'EMP20005' },
        update: { updatedAt: new Date() },
        create: { identityRef: 'EMP20005', name: 'Anita Desai', email: 'cm.credit.ho@iob.in' },
    });
    await prisma.posting.create({
        data: {
            userId: userCM.id,
            deptId: roCredit!.id,
            regionId: regPrimary.id,
            designationId: desCM.id,
            status: 'ACTIVE'
        }
    });

    // --- 7. Governance & Offices Refactor ---
    console.log('Seeding Governance Entities...');

    // 7.1 Committees
    const commRO = await prisma.governanceCommittee.upsert({
        where: { id: 'COMMITTEE-RO' },
        update: { updatedAt: new Date() },
        create: { id: 'COMMITTEE-RO', name: 'Regional Management Committee', mandate: 'Regional Oversight & Decisioning' },
    });

    // 7.0 System Administrator (Tier 0)
    const officeSysAdmin = await prisma.office.upsert({
        where: { code: 'SYS-ADMIN' },
        update: { updatedAt: new Date() },
        create: { code: 'SYS-ADMIN', name: 'System Administrator', tier: 'TIER_0_SYSTEM', vetoPower: true }
    });


    // 7.4 Offices (Tier 3 - Execution: RO and Branches)
    const officeRMChennai = await prisma.office.upsert({
        where: { code: 'RO-CHENNAI-HEAD' },
        update: { updatedAt: new Date() },
        create: {
            code: 'RO-CHENNAI-HEAD',
            name: 'Regional Head - Chennai',
            tier: 'TIER_3_EXECUTION',
            departmentId: unitROChennai.id
        }
    });

    const officeGMCredit = await prisma.office.upsert({
        where: { code: 'GM-CREDIT' },
        update: { updatedAt: new Date() },
        create: {
            code: 'GM-CREDIT',
            name: 'General Manager (Credit)',
            tier: 'TIER_2_EXECUTIVE',
            departmentId: roCredit!.id
        }
    });

    const officeBMAdyar = await prisma.office.upsert({
        where: { code: 'BM-ADYAR' },
        update: { updatedAt: new Date() },
        create: {
            code: 'BM-ADYAR',
            name: 'Branch Manager - Adyar',
            tier: 'TIER_3_EXECUTION',
            departmentId: unitBranchAdyar.id
        }
    });

    // 7.5 Tenures (Mapping Users to Offices)
    // Map Rajiv Malhotra (GM) to Regional Head Office for demo
    await prisma.tenure.create({
        data: {
            officeId: officeRMChennai.id,
            userId: userGM.id,
            startDate: new Date(),
            status: 'ACTIVE'
        }
    });



    console.log('Resetting DoA Rules...');
    await prisma.doARule.deleteMany({});

    console.log('Creating DoA Rules...');

    // Decision Types
    const typeSanc = await prisma.decisionType.upsert({
        where: { code: 'ADMIN_SANC' },
        update: { updatedAt: new Date() },
        create: { code: 'ADMIN_SANC', name: 'Administrative Sanction', category: 'ADMIN' },
    });

    const typeFin = await prisma.decisionType.upsert({
        where: { code: 'FIN_CONC' },
        update: { updatedAt: new Date() },
        create: { code: 'FIN_CONC', name: 'Financial Concession', category: 'FINANCIAL' },
    });

    const typeDev = await prisma.decisionType.upsert({
        where: { code: 'POLICY_DEV' },
        update: { updatedAt: new Date() },
        create: { code: 'POLICY_DEV', name: 'Policy Deviation', category: 'POLICY' },
    });

    const typeExp = await prisma.decisionType.upsert({
        where: { code: 'SPEC_EXP' },
        update: { updatedAt: new Date() },
        create: { code: 'SPEC_EXP', name: 'Special Expenditure', category: 'ADMIN' },
    });

    const typeHR = await prisma.decisionType.upsert({
        where: { code: 'HR_ACTION' },
        update: { updatedAt: new Date() },
        create: { code: 'HR_ACTION', name: 'Human Resource Action', category: 'HR' },
    });

    // CM Credit can Sanction up to 1 Crore
    await prisma.doARule.create({
        data: {
            authorityBodyType: 'DESIGNATION',
            authorityBodyId: desCM.id,
            decisionTypeId: typeSanc.id,
            functionalScopeId: scopeMap['CREDIT_SANCTION'].id,
            limitMin: 0,
            limitMax: 10000000, // 1 Crore
        }
    });

    // GM Credit can Sanction up to 10 Crores
    await prisma.doARule.create({
        data: {
            authorityBodyType: 'DESIGNATION',
            authorityBodyId: desGM.id,
            decisionTypeId: typeSanc.id,
            functionalScopeId: scopeMap['CREDIT_SANCTION'].id,
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
            update: { updatedAt: new Date() },
            create: p,
        });
    }

    // --- 7. Automated Office Backfill ---
    // Ensure all departments (especially functional ones) have a Head Office
    console.log('Ensuring all departments have Governance Offices...');
    const allDepts = await prisma.department.findMany({ include: { offices: true } });

    for (const dept of allDepts) {
        // Skip if 1st Line Head exists
        if (dept.offices.some(o => o.authorityLine === '1st')) continue;

        let officeName = `Head of ${dept.name}`;
        let officeCode = `HEAD-${dept.code}`;
        const tier = 'TIER_3_EXECUTION';

        if (dept.type === 'BRANCH') {
            officeName = `Branch Manager - ${dept.name}`;
            officeCode = `BM-${dept.code}`;
        } else if (dept.name.toUpperCase().includes('LPC') || dept.subType === 'LPC') {
            officeName = `Head - ${dept.name}`;
            officeCode = `LPC-${dept.code}`;
        } else if (dept.type === 'FUNCTIONAL') {
            officeName = dept.name.endsWith(' Department') ? `Head of ${dept.name}` : `Head of ${dept.name} Department`;
            officeCode = `DEPT-${dept.code}`;
        } else if (dept.subType === 'RO' && dept.parentId === null) {
            // Root RO
            officeName = `Regional Head - ${dept.name.replace('Regional Office - ', '')}`;
            officeCode = `RH-${dept.code.replace('RO-', '')}`;
        }

        // Create missing office
        const newOffice = await prisma.office.upsert({
            where: { code: officeCode },
            update: {
                name: officeName,
                tier: tier,
                departmentId: dept.id,
                authorityLine: '1st',
                vetoPower: true
            },
            create: {
                code: officeCode,
                name: officeName,
                tier: tier,
                departmentId: dept.id,
                authorityLine: '1st',
                vetoPower: true
            }
        });
        console.log(`[SEED-AUTO] Ensured ${officeName} for ${dept.code}`);
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
