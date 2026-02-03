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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentController = void 0;
const common_1 = require("@nestjs/common");
const pdf_service_1 = require("./pdf.service");
const template_service_1 = require("./template.service");
let DocumentController = class DocumentController {
    pdfService;
    templateService;
    constructor(pdfService, templateService) {
        this.pdfService = pdfService;
        this.templateService = templateService;
    }
    async previewDocument(body, res) {
        const { templateName, data } = body;
        if (!templateName) {
            throw new common_1.BadRequestException('templateName is required');
        }
        try {
            const html = await this.templateService.render(templateName, data);
            const pdfBuffer = await this.pdfService.generatePdf(html);
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="${templateName}.pdf"`,
                'Content-Length': pdfBuffer.length,
            });
            res.send(pdfBuffer);
        }
        catch (error) {
            console.error('PDF Generation Error:', error);
            res.status(500).json({ message: 'Failed to generate PDF', error: error.message });
        }
    }
};
exports.DocumentController = DocumentController;
__decorate([
    (0, common_1.Post)('preview'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "previewDocument", null);
exports.DocumentController = DocumentController = __decorate([
    (0, common_1.Controller)('documents'),
    __metadata("design:paramtypes", [pdf_service_1.PdfService,
        template_service_1.TemplateService])
], DocumentController);
//# sourceMappingURL=document.controller.js.map