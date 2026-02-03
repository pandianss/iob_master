import { OnModuleInit } from '@nestjs/common';
export declare class TemplateService implements OnModuleInit {
    private templates;
    private layoutTemplate;
    private readonly templateDir;
    onModuleInit(): Promise<void>;
    private loadLayout;
    private loadTemplates;
    render(templateName: string, data: any): Promise<string>;
}
