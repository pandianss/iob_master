
async function main() {
    const urls = [
        'http://localhost:3000/api/admin/departments',
        'http://127.0.0.1:3000/api/admin/departments',
        'http://[::1]:3000/api/admin/departments'
    ];

    for (const url of urls) {
        try {
            console.log(`Fetching ${url}...`);
            const response = await fetch(url);
            console.log(`Status for ${url}:`, response.status);
            if (response.ok) {
                const data = await response.json() as any[];
                console.log('Departments Count:', data.length);
                console.log('Sample:', JSON.stringify(data[0], null, 2));
                return; // Success
            } else {
                console.error(`Failed ${url}:`, await response.text());
            }
        } catch (error) {
            console.error(`Error ${url}:`, error.message);
        }
    }
}

main();
