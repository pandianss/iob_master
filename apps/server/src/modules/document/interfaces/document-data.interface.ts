export interface DocumentData {
    // Core Business Data
    subject: string;
    content?: string;

    // Financials
    amount?: string;

    // Stakeholders
    initiatorName: string;
    initiatorDesignation: string;

    reviewerName?: string;
    reviewerCode?: string;

    approverName?: string;
    approverCode?: string;

    // Metadata
    refNumber: string;
    date: string;

    // Dynamic Fields (for flexibility)
    [key: string]: any;
}
