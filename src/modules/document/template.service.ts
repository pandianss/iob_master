import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as Handlebars from 'handlebars';

@Injectable()
export class TemplateService implements OnModuleInit {
    private templates: Map<string, Handlebars.TemplateDelegate> = new Map();
    private layoutTemplate: Handlebars.TemplateDelegate;
    private readonly templateDir = path.join(process.cwd(), 'src', 'templates');

    async onModuleInit() {
        await this.loadTemplates();
        await this.loadLayout();
    }

    private async loadLayout() {
        try {
            const layoutPath = path.join(this.templateDir, 'base-layout.hbs');
            const source = await fs.readFile(layoutPath, 'utf-8');
            this.layoutTemplate = Handlebars.compile(source);
        } catch (error) {
            console.warn('Base layout not found. Documents will be generated without layout.');
        }
    }

    private async loadTemplates() {
        // Dynamic loading can be implemented here.
        // For now, we will compile on demand or pre-load specific ones.
    }

    async render(templateName: string, data: any): Promise<string> {
        // 1. Resolve Template Path
        const templatePath = path.join(this.templateDir, `${templateName}.hbs`);

        let templateDelegate = this.templates.get(templateName);
        if (!templateDelegate) {
            try {
                const source = await fs.readFile(templatePath, 'utf-8');
                templateDelegate = Handlebars.compile(source);
                this.templates.set(templateName, templateDelegate);
            } catch (error) {
                throw new Error(`Template ${templateName} not found at ${templatePath}`);
            }
        }

        // 2. Render Body
        const body = templateDelegate(data);

        // 3. Wrap in Layout
        if (this.layoutTemplate) {
            return this.layoutTemplate({
                ...data, // Pass metadata like refNumber, officeName to layout
                body,    // The actual content
                // Mock Logo for now - normally read from file
                logoBase64: '', // TODO: Load actual SVG/PNG
                generatedAt: new Date().toLocaleString(),
            });
        }

        return body;
    }
}
