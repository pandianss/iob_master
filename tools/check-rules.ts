
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const rules = await prisma.doARule.findMany({
        include: {
            decisionType: true,
            functionalScope: true
        }
    });

    console.log(`Found ${rules.length} DoA Rules.`);
    if (rules.length > 0) {
        console.log('Sample Rule:', JSON.stringify(rules[0], null, 2));
    } else {
        // Check DecisionType and FunctionalScope count
        const dTypes = await prisma.decisionType.count();
        const fScopes = await prisma.functionalScope.count();
        console.log(`DecisionTypes: ${dTypes}, FunctionalScopes: ${fScopes}`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
