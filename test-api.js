const axios = require('axios');

async function test() {
    const baseUrl = 'http://localhost:3000/api/governance';
    const params = await axios.get(`${baseUrl}/parameters`);
    const depId = params.data.find(p => p.code === 'deposits_total')?.id;
    const advId = params.data.find(p => p.code === 'advances_total')?.id;

    console.log('Parameters found:', { depId, advId });

    if (depId) {
        console.log('Creating Risk mapping...');
        const res1 = await axios.post(`${baseUrl}/mappings`, {
            parameterId: depId,
            thresholdValue: '-5%',
            operator: '<',
            action: 'TRIGGER_OP_RISK',
            mappingType: 'RISK',
            frequency: 'DAILY',
            targetUnitType: 'BRANCH'
        });
        console.log('Risk Mapping created:', res1.data.id);
    }

    if (advId) {
        console.log('Creating Performance mapping...');
        const res2 = await axios.post(`${baseUrl}/mappings`, {
            parameterId: advId,
            thresholdValue: '10%',
            operator: '>',
            action: 'ISSUE_APPRECIATION',
            mappingType: 'PERFORMANCE',
            frequency: 'MONTHLY',
            targetUnitType: 'ALL'
        });
        console.log('Performance Mapping created:', res2.data.id);
    }

    const mappings = await axios.get(`${baseUrl}/mappings`);
    console.log('Total Mappings:', mappings.data.length);
    console.log('Mappings data:', JSON.stringify(mappings.data, null, 2));
}

test().catch(err => {
    console.error('Error testing API:', err.response?.data || err.message);
});
