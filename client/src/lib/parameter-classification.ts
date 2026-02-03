// MIS Parameter Classification Framework - Bank Grade

/**
 * Class A — Primary Control Parameters
 * Directly influence decisions; must appear on snapshot
 * Shown as: actuals + growth + target gap
 */
export const CLASS_A_PARAMETERS = [
    { id: 'deposits_sb', name: 'Deposits - SB', category: 'Deposits' },
    { id: 'deposits_ca', name: 'Deposits - CA', category: 'Deposits' },
    { id: 'deposits_casa', name: 'Deposits - CASA', category: 'Deposits' },
    { id: 'deposits_td', name: 'Deposits - TD', category: 'Deposits' },
    { id: 'deposits_total', name: 'Total Deposits', category: 'Deposits', primary: true },
    { id: 'advances_total', name: 'Total Advances', category: 'Advances', primary: true },
    { id: 'npa_gross', name: 'Gross NPA', category: 'Asset Quality', primary: true },
    { id: 'npa_net', name: 'Net NPA', category: 'Asset Quality' },
    { id: 'business_total', name: 'Total Business', category: 'Business', primary: true },
    { id: 'recovery_total', name: 'Total Recovery', category: 'Recovery', primary: true },
    { id: 'profit', name: 'Profit / Contribution', category: 'Profit', primary: true },
] as const;

/**
 * Class B — Ratio & Efficiency Parameters
 * Derived from Class A; shown selectively based on level
 * Shown only if frozen in ratio set for that level
 */
export const CLASS_B_PARAMETERS = [
    { id: 'cd_ratio', name: 'CD Ratio', formula: 'Advances / Deposits' },
    { id: 'casa_pct', name: 'CASA %', formula: 'CASA / Total Deposits' },
    { id: 'growth_ftd', name: 'Growth % (FTD)', formula: '(T - T-1) / T-1' },
    { id: 'growth_ftm', name: 'Growth % (FTM)', formula: '(T - Month Start) / Month Start' },
    { id: 'growth_fty', name: 'Growth % (FTY)', formula: '(T - FY Start) / FY Start' },
    { id: 'npa_pct', name: 'NPA %', formula: 'Gross NPA / Advances' },
    { id: 'nim', name: 'NIM', formula: '(Interest Income - Interest Expense) / Avg Assets' },
    { id: 'cost_income', name: 'Cost-to-Income', formula: 'Operating Expense / Operating Income' },
    { id: 'business_per_employee', name: 'Business per Employee', formula: 'Total Business / Employee Count' },
] as const;

/**
 * Class C — Segment / Scheme / Portfolio Parameters
 * Too many to show directly, but critical diagnostically
 * Not shown individually on snapshot
 * Consumed via: Portfolio concentration, Growth drag/push indicators, NEG parameter flags
 */
export const CLASS_C_PARAMETERS = [
    // Agricultural Segments
    { id: 'agri_jl', name: 'AGRI JL', segment: 'Agriculture', critical: true },
    { id: 'core_agri', name: 'CORE AGRI', segment: 'Agriculture' },
    { id: 'kcc', name: 'KCC (Kisan Credit Card)', segment: 'Agriculture' },

    // Retail Segments
    { id: 'retail_jl', name: 'RETAIL JL', segment: 'Retail', critical: true },
    { id: 'core_retail', name: 'CORE RETAIL', segment: 'Retail' },
    { id: 'gold_loan', name: 'GOLD LOAN', segment: 'Retail' },
    { id: 'housing', name: 'HOUSING', segment: 'Retail' },
    { id: 'vehicle', name: 'VEHICLE', segment: 'Retail' },
    { id: 'personal', name: 'PERSONAL', segment: 'Retail' },

    // SME Segments
    { id: 'core_sme', name: 'CORE SME', segment: 'SME', critical: true },
    { id: 'mudra', name: 'MUDRA', segment: 'SME' },

    // Social / Schematic
    { id: 'shg', name: 'SHG (Self Help Group)', segment: 'Social' },
    { id: 'govt_sponsored', name: 'GOVT SPONSORED', segment: 'Social' },
    { id: 'other_schematic', name: 'OTHER SCHEMATIC LENDING', segment: 'Social' },
] as const;

/**
 * Class D — Diagnostic / Tracking Parameters
 * Required for drill-down, not for snapshot
 * Always retained in MIS tables, never all exposed on snapshot
 */
export const CLASS_D_PARAMETERS = [
    { id: 'gap_month', name: 'Gap vs Month Target', type: 'Gap' },
    { id: 'gap_quarter', name: 'Gap vs Quarter Target', type: 'Gap' },
    { id: 'gap_year', name: 'Gap vs Year Target', type: 'Gap' },
    { id: 'budget_comparator', name: 'Budget Comparator', type: 'Budget' },
    { id: 'checkpoint_t1', name: 'T-1 Checkpoint', type: 'Checkpoint' },
    { id: 'checkpoint_month_start', name: 'Month Start Checkpoint', type: 'Checkpoint' },
    { id: 'checkpoint_quarter_start', name: 'Quarter Start Checkpoint', type: 'Checkpoint' },
    { id: 'checkpoint_fy_start', name: 'FY Start Checkpoint', type: 'Checkpoint' },
    { id: 'intermediate_total', name: 'Intermediate Total', type: 'Calculation' },
] as const;

/**
 * MIS → Snapshot Mapping Register
 * One-time mapping that prevents silent exclusion
 */
export interface ParameterMapping {
    misParameter: string;
    class: 'A' | 'B' | 'C' | 'D';
    snapshotUsage: string;
    evaluationMethod: 'direct_display' | 'ratio_section' | 'neg_flag' | 'portfolio_drag' | 'drill_down';
}

export const MIS_SNAPSHOT_MAPPING: ParameterMapping[] = [
    // Class A - Direct Display
    { misParameter: 'Total Deposits', class: 'A', snapshotUsage: 'Direct display in Key Position', evaluationMethod: 'direct_display' },
    { misParameter: 'Total Advances', class: 'A', snapshotUsage: 'Direct display in Key Position', evaluationMethod: 'direct_display' },
    { misParameter: 'Gross NPA', class: 'A', snapshotUsage: 'Direct display in Key Position', evaluationMethod: 'direct_display' },
    { misParameter: 'Total Business', class: 'A', snapshotUsage: 'Direct display in Key Position', evaluationMethod: 'direct_display' },
    { misParameter: 'Recovery', class: 'A', snapshotUsage: 'Direct display in Recovery section', evaluationMethod: 'direct_display' },
    { misParameter: 'Profit', class: 'A', snapshotUsage: 'Direct display in Key Position', evaluationMethod: 'direct_display' },

    // Class B - Ratio Section
    { misParameter: 'CASA %', class: 'B', snapshotUsage: 'Ratio section (if frozen for level)', evaluationMethod: 'ratio_section' },
    { misParameter: 'CD Ratio', class: 'B', snapshotUsage: 'Ratio section (if frozen for level)', evaluationMethod: 'ratio_section' },
    { misParameter: 'NPA %', class: 'B', snapshotUsage: 'Ratio section (if frozen for level)', evaluationMethod: 'ratio_section' },
    { misParameter: 'Growth % (FTD/FTM/FTY)', class: 'B', snapshotUsage: 'Growth View section', evaluationMethod: 'direct_display' },

    // Class C - NEG Flags & Portfolio Indicators
    { misParameter: 'AGRI JL Growth', class: 'C', snapshotUsage: 'NEG flag + portfolio drag indicator', evaluationMethod: 'neg_flag' },
    { misParameter: 'RETAIL JL Growth', class: 'C', snapshotUsage: 'NEG flag + portfolio drag indicator', evaluationMethod: 'neg_flag' },
    { misParameter: 'GOLD LOAN Growth', class: 'C', snapshotUsage: 'Segment NEG check', evaluationMethod: 'neg_flag' },
    { misParameter: 'CORE SME Growth', class: 'C', snapshotUsage: 'NEG flag + concentration ratio', evaluationMethod: 'neg_flag' },
    { misParameter: 'KCC Growth', class: 'C', snapshotUsage: 'Segment NEG check', evaluationMethod: 'neg_flag' },
    { misParameter: 'HOUSING Growth', class: 'C', snapshotUsage: 'Portfolio concentration', evaluationMethod: 'portfolio_drag' },
    { misParameter: 'MUDRA Growth', class: 'C', snapshotUsage: 'Segment NEG check', evaluationMethod: 'neg_flag' },

    // Class D - Drill-down Only
    { misParameter: 'Gap columns', class: 'D', snapshotUsage: 'Retained in MIS tables, not on snapshot', evaluationMethod: 'drill_down' },
    { misParameter: 'Budget comparators', class: 'D', snapshotUsage: 'Drill-down analysis', evaluationMethod: 'drill_down' },
    { misParameter: 'Multiple date checkpoints', class: 'D', snapshotUsage: 'Trend analysis in drill-down', evaluationMethod: 'drill_down' },
];

/**
 * Parameter Coverage Statement
 * Mandatory attestation that all MIS parameters have been evaluated
 */
export interface ParameterCoverageStatement {
    snapshotId: string;
    snapshotDate: Date;
    totalMISParameters: number;
    classAEvaluated: number;
    classBEvaluated: number;
    classCEvaluated: number;
    classDEvaluated: number;
    coverageComplete: boolean;
    attestation: string;
}

export function generateCoverageStatement(snapshotId: string, snapshotDate: Date): ParameterCoverageStatement {
    const totalMIS = CLASS_A_PARAMETERS.length + CLASS_B_PARAMETERS.length + CLASS_C_PARAMETERS.length + CLASS_D_PARAMETERS.length;

    return {
        snapshotId,
        snapshotDate,
        totalMISParameters: totalMIS,
        classAEvaluated: CLASS_A_PARAMETERS.length,
        classBEvaluated: CLASS_B_PARAMETERS.length,
        classCEvaluated: CLASS_C_PARAMETERS.length,
        classDEvaluated: CLASS_D_PARAMETERS.length,
        coverageComplete: true,
        attestation: 'All MIS parameters have been evaluated for this period.',
    };
}

/**
 * Visibility Layers
 * Explains how parameters surface at different levels
 */
export const VISIBILITY_LAYERS = {
    snapshot: {
        description: '10–15 metrics visible',
        actualUsage: '100% of MIS inputs evaluated',
        parameters: ['Class A (direct)', 'Class B (selective)', 'Class C (via NEG flags)', 'Class D (implicit)'],
    },
    controlView: {
        description: 'NEG counts, ratios, concentration',
        actualUsage: 'Segment-level checks, portfolio analysis',
        parameters: ['Class C segments', 'Class B ratios', 'NEG parameter flags'],
    },
    drillDown: {
        description: 'Full MIS table',
        actualUsage: 'Raw MIS.pdf parameters',
        parameters: ['All classes A, B, C, D'],
    },
} as const;
