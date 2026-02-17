import * as csv from 'fast-csv';
import * as fs from 'fs';
import * as path from 'path';

const filePath = 'c:\\Users\\Acer\\Videos\\iob\\mis_template\\kbp-template.csv';

async function verify() {
    console.log(`Reading ${filePath}...`);
    const stream = fs.createReadStream(filePath);
    const rows: any[] = [];

    stream
        .pipe(csv.parse({ headers: true, trim: true }))
        .on('error', error => console.error(error))
        .on('data', row => rows.push(row))
        .on('end', count => {
            console.log(`Parsed ${count} rows.`);
            if (count > 0) {
                console.log('Sample Row 0:', JSON.stringify(rows[0], null, 2));

                // Check for keys with spaces
                const keys = Object.keys(rows[0]);
                console.log('Headers detected:', keys);

                if (keys.includes('Branch Code') && keys.includes('Savings Bank')) {
                    console.log('SUCCESS: "Branch Code" and "Savings Bank" headers parsed correctly.');
                } else {
                    console.error('FAILURE: Expected headers not found.');
                }
            }
        });
}

verify();
