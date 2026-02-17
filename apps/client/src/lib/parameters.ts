// Frozen Parameter Set - Bank Grade
export const CORE_PARAMETERS = [
    { id: 'business', name: 'Business', critical: false },
    { id: 'deposits', name: 'Deposits', critical: false },
    { id: 'advances', name: 'Advances', critical: true },
    { id: 'casa', name: 'CASA', critical: true },
    { id: 'profit', name: 'Profit', critical: true },
    { id: 'recovery', name: 'Recovery', critical: true },
    { id: 'assetQuality', name: 'Asset Quality', critical: true },
    { id: 'cost', name: 'Cost', critical: false },
    { id: 'dqi', name: 'DQI', critical: true },
] as const;

export type ParameterId = typeof CORE_PARAMETERS[number]['id'];

export type ParameterStatus = '+' | '–' | '0';

export interface UnitParameterStatus {
    unitId: string;
    unitName: string;
    unitType: 'CO' | 'ZONE' | 'REGION' | 'BRANCH';
    parameters: Record<ParameterId, ParameterStatus>;
    negativeCount: number;
    criticalNegativeCount: number;
    isNegativeUnit: boolean; // Derived: negativeCount >= threshold OR critical negative for N periods
}

export interface ParameterThreshold {
    parameterId: ParameterId;
    unitType: 'CO' | 'ZONE' | 'REGION' | 'BRANCH';
    minThreshold: number;
    maxThreshold: number;
    toleranceBand?: number; // For '0' status
}

// Negative Unit Classification Rules
export const NEG_UNIT_RULES = {
    negativeCountThreshold: 3, // Unit is NEG if ≥3 parameters are negative
    criticalNegativePeriods: 2, // Unit is NEG if any critical parameter negative for ≥2 periods
} as const;

// Helper to determine parameter status
export function getParameterStatus(
    actual: number,
    threshold: ParameterThreshold
): ParameterStatus {
    const { minThreshold, maxThreshold, toleranceBand = 0 } = threshold;

    if (actual >= maxThreshold) return '+';
    if (actual <= minThreshold) return '–';
    if (toleranceBand > 0 && actual >= minThreshold - toleranceBand && actual <= maxThreshold + toleranceBand) {
        return '0';
    }
    return '–';
}

// Calculate negative parameter counts
export function calculateNegativeCounts(
    parameters: Record<ParameterId, ParameterStatus>
): { negativeCount: number; criticalNegativeCount: number } {
    let negativeCount = 0;
    let criticalNegativeCount = 0;

    CORE_PARAMETERS.forEach((param) => {
        if (parameters[param.id] === '–') {
            negativeCount++;
            if (param.critical) {
                criticalNegativeCount++;
            }
        }
    });

    return { negativeCount, criticalNegativeCount };
}

// Determine if unit should be classified as NEG
export function isNegativeUnit(
    negativeCount: number,
    criticalNegativeCount: number,
    criticalNegativePeriods: number = 0
): boolean {
    return (
        negativeCount >= NEG_UNIT_RULES.negativeCountThreshold ||
        criticalNegativePeriods >= NEG_UNIT_RULES.criticalNegativePeriods
    );
}
