"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
const template_service_1 = require("./template.service");
const pdf_service_1 = require("./pdf.service");
let DocumentService = class DocumentService {
    prisma;
    templateService;
    pdfService;
    constructor(prisma, templateService, pdfService) {
        this.prisma = prisma;
        this.templateService = templateService;
        this.pdfService = pdfService;
    }
    async generateDecisionInstrument(decisionId) {
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
        if (!decision)
            throw new common_1.NotFoundException('Decision instrument record not found');
        const outcome = decision.outcomeData;
        const reviewerOffice = outcome.reviewerId ? await this.prisma.office.findUnique({ where: { id: outcome.reviewerId } }) : null;
        const approverOffice = outcome.approverId ? await this.prisma.office.findUnique({ where: { id: outcome.approverId } }) : null;
        const office = decision.initiatorPosting.user.tenures[0]?.office;
        const meta = {
            officeName: office?.name || 'Administrative Unit',
            officePhone: '+91 44 2851 9123',
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
        const instrumentTypeMap = {
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
            reviewerName: reviewerOffice?.name || 'Designated Reviewer',
            reviewerCode: reviewerOffice?.code || 'REV-AUTH',
            approverName: approverOffice?.name || 'Sanctioning Authority',
            approverCode: approverOffice?.code || 'SANC-AUTH',
            expectedImpact: outcome?.expectedImpact || 'N/A',
            correctiveAction: outcome?.correctiveAction || 'None specified',
            gapAnalysis: outcome?.gapAnalysis || 'Policy compliant'
        };
        const html = await this.templateService.render('office-note', data);
        return this.pdfService.generatePdf(html);
    }
};
exports.DocumentService = DocumentService;
exports.DocumentService = DocumentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        template_service_1.TemplateService,
        pdf_service_1.PdfService])
], DocumentService);
//# sourceMappingURL=document.service.js.map