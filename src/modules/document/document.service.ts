import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TemplateService } from './template.service';
import { PdfService } from './pdf.service';

@Injectable()
export class DocumentService {
    constructor(
        private prisma: PrismaService,
        private templateService: TemplateService,
        private pdfService: PdfService,
    ) { }

    async generateDecisionInstrument(decisionId: string) {
        // 1. Fetch Decision with user and active tenure to resolve Office
        const decision = await this.prisma.decision.findUnique({
            where: { id: decisionId },
            include: {
                initiatorPosting: {
                    include: {
                        user: {
                            include: {
                                tenures: {
                                    where: { status: 'ACTIVE' },
                                    include: { office: true },
                                    orderBy: { startDate: 'desc' },
                                    take: 1
                                }
                            }
                        },
                        designation: true,
                    }
                },
                authRule: true,
            }
        });

        if (!decision) throw new NotFoundException('Decision instrument record not found');

        const outcome = decision.outcomeData as any;

        // 2. Resolve Stakeholders (Reviewers/Approvers)
        const reviewerOffice = outcome.reviewerId ? await this.prisma.office.findUnique({ where: { id: outcome.reviewerId } }) : null;
        const approverOffice = outcome.approverId ? await this.prisma.office.findUnique({ where: { id: outcome.approverId } }) : null;

        // 3. Prepare Institutional Metadata
        const office = decision.initiatorPosting.user.tenures[0]?.office;
        const meta = {
            officeName: office?.name || 'Administrative Unit',
            officePhone: '+91 44 2851 9123', // Demo IOB HQ
            officeEmail: 'governance@iob.in',
            officeAddress: '763, Anna Salai, Chennai - 600002, Tamil Nadu, India',
            refNumber: `IOB/GOV/${new Date().getFullYear()}/${decision.id.substring(0, 8).toUpperCase()}`,
            generatedAt: new Date().toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            }),
            isDraft: decision.status !== 'APPROVED',
        };

        // 4. Document Classification
        const instrumentTypeMap: Record<string, string> = {
            'APPROVAL': 'Note for Approval',
            'RATIFICATION': 'Note for Ratification / Ex-Post Facto',
            'SANCTION': 'Sanction Order (Administrative)',
            'CIRCULAR': 'Governance Circular',
            'INFORMATION': 'Note for Information'
        };

        const data = {
            ...meta,
            instrumentType: instrumentTypeMap[outcome.instrumentType] || 'ADMINISTRATIVE PROPOSAL',
            subject: outcome?.subject || 'Administrative Proposal',
            amount: outcome?.amount ? `INR ${Number(outcome.amount).toLocaleString('en-IN')}` : 'N/A',
            justification: outcome?.justification,
            circulars: outcome?.circulars || [],
            initiatorName: decision.initiatorPosting.user.name,
            initiatorDesignation: decision.initiatorPosting.designation.title,
            authorityBody: decision.authRule?.authorityBodyType || outcome.targetCommittee || 'Standard Authority',
            status: decision.status,

            // Stakeholders (Reviewers/Approvers)
            reviewerName: reviewerOffice?.name || 'Designated Reviewer',
            reviewerCode: reviewerOffice?.code || 'REV-AUTH',
            approverName: approverOffice?.name || 'Sanctioning Authority',
            approverCode: approverOffice?.code || 'SANC-AUTH',

            // Quality Test Fields
            expectedImpact: outcome?.expectedImpact || 'N/A',
            correctiveAction: outcome?.correctiveAction || 'None specified',
            gapAnalysis: outcome?.gapAnalysis || 'Policy compliant'
        };

        // 5. Render HTML
        const html = await this.templateService.render('office-note', data);

        // 6. Generate PDF
        return this.pdfService.generatePdf(html);
    }
}
