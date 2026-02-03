"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const Handlebars = __importStar(require("handlebars"));
let TemplateService = class TemplateService {
    templates = new Map();
    layoutTemplate;
    templateDir = path.join(process.cwd(), 'src', 'templates');
    async onModuleInit() {
        await this.loadTemplates();
        await this.loadLayout();
    }
    async loadLayout() {
        try {
            const layoutPath = path.join(this.templateDir, 'base-layout.hbs');
            const source = await fs.readFile(layoutPath, 'utf-8');
            this.layoutTemplate = Handlebars.compile(source);
        }
        catch (error) {
            console.warn('Base layout not found. Documents will be generated without layout.');
        }
    }
    async loadTemplates() {
    }
    async render(templateName, data) {
        const templatePath = path.join(this.templateDir, `${templateName}.hbs`);
        let templateDelegate = this.templates.get(templateName);
        if (!templateDelegate) {
            try {
                const source = await fs.readFile(templatePath, 'utf-8');
                templateDelegate = Handlebars.compile(source);
                this.templates.set(templateName, templateDelegate);
            }
            catch (error) {
                throw new Error(`Template ${templateName} not found at ${templatePath}`);
            }
        }
        const body = templateDelegate(data);
        if (this.layoutTemplate) {
            return this.layoutTemplate({
                ...data,
                body,
                logoBase64: '',
                generatedAt: new Date().toLocaleString(),
            });
        }
        return body;
    }
};
exports.TemplateService = TemplateService;
exports.TemplateService = TemplateService = __decorate([
    (0, common_1.Injectable)()
], TemplateService);
//# sourceMappingURL=template.service.js.map