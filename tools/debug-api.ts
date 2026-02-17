import axios from 'axios';

async function checkApi() {
    const baseUrl = 'http://localhost:3000';
    console.log(`Checking API at ${baseUrl}...`);

    try {
        // 1. Check Root/Health
        console.log('1. Pinging Root...');
        try {
            const res = await axios.get(baseUrl);
            console.log(`   Status: ${res.status}`);
        } catch (e) {
            console.log(`   Root Ping Failed: ${e.message}`);
        }

        // 2. Check Offices (Governance)
        console.log('\n2. Fetching Offices (/api/governance/offices)...');
        try {
            const res = await axios.get(`${baseUrl}/api/governance/offices`);
            console.log(`   Status: ${res.status}`);
            console.log(`   Data Length: ${Array.isArray(res.data) ? res.data.length : 'Not an array'}`);
            if (Array.isArray(res.data) && res.data.length > 0) {
                console.log('   Sample Office:', res.data[0]);
            }
        } catch (e) {
            console.log(`   Offices Fetch Failed: ${e.message}`);
            if (e.response) {
                console.log(`   Response Data: ${JSON.stringify(e.response.data)}`);
            }
        }

        // 3. Check Departments (Admin)
        console.log('\n3. Fetching Departments (/api/admin/departments)...');
        try {
            const res = await axios.get(`${baseUrl}/api/admin/departments`);
            console.log(`   Status: ${res.status}`);
            console.log(`   Data Length: ${Array.isArray(res.data) ? res.data.length : 'Not an array'}`);
        } catch (e) {
            console.log(`   Departments Fetch Failed: ${e.message}`);
        }

    } catch (e) {
        console.error('Unexpected error:', e);
    }
}

checkApi();
