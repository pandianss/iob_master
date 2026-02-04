
const { Client } = require('pg');

async function testConnection(connectionString) {
    const client = new Client({ connectionString });
    try {
        console.log(`Testing: ${connectionString.replace(/:[^:@]*@/, ':****@')}`);
        await client.connect();
        console.log(`SUCCESS: Connected!`);
        await client.end();
        return true;
    } catch (err) {
        console.log(`FAILURE: ${err.message}`);
        return false;
    }
}

// encodeURIComponent('iob@123') -> 'iob%40123'
const url = "postgresql://postgres:iob%40123@127.0.0.1:5432/postgres?schema=public";
testConnection(url);
