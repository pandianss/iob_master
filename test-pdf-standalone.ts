
import { PdfService } from './src/modules/document/pdf.service';
import { TemplateService } from './src/modules/document/template.service';

async function run() {
    console.log('Initializing Services...');
    const pdfService = new PdfService();
    const templateService = new TemplateService();

    await templateService.onModuleInit();
    await pdfService.onModuleInit();

    const mockData = {
        toAuthority: "General Manager",
        fromDepartment: "IT Department",
        subject: "Approval for Standalone Test",
        proposalText: "Testing PDF generation without DB connection.",
        justificationText: "Need to verify layout engine.",
        expenseItem: "Software License",
        expenseAmount: "50,000",
        initiatorName: "Dev User",
        initiatorDesignation: "Developer",
        approverName: "Lead",
        approverDesignation: "Senior Manager"
    };

    console.log('Rendering Template...');
    const html = await templateService.render('office-note', mockData);

    console.log('Generating PDF...');
    const buffer = await pdfService.generatePdf(html);

    const fs = require('fs');
    fs.writeFileSync('standalone-test.pdf', buffer);
    console.log('PDF Generated: standalone-test.pdf');

    await pdfService.onModuleDestroy();
    process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
