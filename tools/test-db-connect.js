
const { Client } = require('pg');

async function testConnection(connectionString) {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log(`Successfully connected to: ${connectionString.replace(/:[^:@]*@/, ':****@')}`);
        await client.end();
        return true;
    } catch (err) {
        console.log(`Failed to connect to: ${connectionString.replace(/:[^:@]*@/, ':****@')}`);
        console.log(`Error: ${err.message}`);
        return false;
    }
}

async function main() {
    const configs = [
        "postgresql://user:password@127.0.0.1:5432/iob_governance?schema=public",
        "postgresql://postgres:iob@123@127.0.0.1:5432/postgres?schema=public",
        "postgresql://postgres:postgres@127.0.0.1:5432/postgres?schema=public",
        "postgresql://user:password@127.0.0.1:5434/iob_governance?schema=public"
    ];

    for (const config of configs) {
        if (await testConnection(config)) {
            console.log(`FOUND WORKING CONFIG: ${config}`);
            break;
        }
    }
}

main();
