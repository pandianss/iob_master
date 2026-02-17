import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { PressService } from './press.service';
import { DocumentData } from './interfaces/document-data.interface';
import { PressContext } from './interfaces/press-context.interface';

@Injectable()
export class DocumentService {
    constructor(
        private prisma: PrismaService,
        private pressService: PressService,
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

        // 3. Document Classification
        const instrumentTypeMap: Record<string, string> = {
            'APPROVAL': 'Note for Approval',
            'RATIFICATION': 'Note for Ratification / Ex-Post Facto',
            'SANCTION': 'Sanction Order (Administrative)',
            'CIRCULAR': 'Governance Circular',
            'INFORMATION': 'Note for Information'
        };

        // 4. Prepare Data Payload
        const data: DocumentData = {
            // Core
            instrumentType: instrumentTypeMap[outcome.instrumentType] || 'ADMINISTRATIVE PROPOSAL',
            subject: outcome?.subject || 'Administrative Proposal',
            date: new Date().toLocaleDateString('en-IN'),
            refNumber: `IOB/GOV/${new Date().getFullYear()}/${decision.id.substring(0, 8).toUpperCase()}`,

            // Financials
            amount: outcome?.amount ? `INR ${Number(outcome.amount).toLocaleString('en-IN')}` : 'N/A',

            // Content
            justification: outcome?.justification,
            circulars: outcome?.circulars || [],

            // Stakeholders
            initiatorName: decision.initiatorPosting.user.name,
            initiatorDesignation: decision.initiatorPosting.designation.title,
            authorityBody: decision.authRule?.authorityBodyType || outcome.targetCommittee || 'Standard Authority',
            status: decision.status,

            // Reviewer/Approver (If applicable)
            reviewerName: reviewerOffice?.name || 'Designated Reviewer',
            reviewerCode: reviewerOffice?.code || 'REV-AUTH',
            approverName: approverOffice?.name || 'Sanctioning Authority',
            approverCode: approverOffice?.code || 'SANC-AUTH',

            // Quality
            expectedImpact: outcome?.expectedImpact || 'N/A',
            correctiveAction: outcome?.correctiveAction || 'None specified',
            gapAnalysis: outcome?.gapAnalysis || 'Policy compliant'
        };

        // 5. Prepare Press Context
        const office = decision.initiatorPosting.user.tenures?.[0]?.office;

        const context: PressContext = {
            templateName: 'office-note',
            classification: 'INTERNAL', // Default to Internal
            isDraft: decision.status !== 'APPROVED',
            showLogo: true,
            showWatermark: true,

            // Identity
            officeName: office?.name || 'Administrative Unit',
            officeAddress: '763, Anna Salai, Chennai - 600002', // Ideally fetched from Office entity
        };

        // 6. Publish via PRESS Engine
        return this.pressService.publish(data, context);
    }
}
