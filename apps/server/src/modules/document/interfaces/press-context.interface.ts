export type SecurityClassification = 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'SECRET';

export interface PressContext {
    classification: SecurityClassification;
    isDraft: boolean;
    templateName: string;

    // Branding Overrides
    showLogo?: boolean;
    showWatermark?: boolean;

    // Layout Overrides
    paperSize?: 'A4' | 'Letter';

    // Dynamic Identity
    officeName?: string;
    officeAddress?: string;
    officePhone?: string;
    officeEmail?: string;
}
