import { useState, useEffect } from 'react';
import { ParameterStatusMatrix } from '../components/ui/ParameterStatusMatrix';
import type { UnitParameterStatus } from '../lib/parameters';
import { AlertTriangle, TrendingDown } from 'lucide-react';

export function NegativeParameterMIS() {
    const [units, setUnits] = useState<UnitParameterStatus[]>([]);

    useEffect(() => {
        // Mock data demonstrating the framework
        // In production, this would come from /api/reporting/parameter-status
        setUnits([
            {
                unitId: '1',
                unitName: 'Credit Department - HO',
                unitType: 'CO',
                parameters: {
                    business: '+',
                    deposits: '+',
                    advances: '+',
                    casa: '–',
                    profit: '+',
                    recovery: '–',
                    assetQuality: '+',
                    cost: '+',
                    dqi: '+',
                },
                negativeCount: 2,
                criticalNegativeCount: 2,
                isNegativeUnit: false,
            },
            {
                unitId: '2',
                unitName: 'Regional Office - Delhi',
                unitType: 'REGION',
                parameters: {
                    business: '–',
                    deposits: '–',
                    advances: '+',
                    casa: '–',
                    profit: '–',
                    recovery: '–',
                    assetQuality: '–',
                    cost: '–',
                    dqi: '–',
                },
                negativeCount: 7,
                criticalNegativeCount: 4,
                isNegativeUnit: true,
            },
            {
                unitId: '3',
                unitName: 'Branch - Connaught Place',
                unitType: 'BRANCH',
                parameters: {
                    business: '+',
                    deposits: '+',
                    advances: '–',
                    casa: '+',
                    profit: '–',
                    recovery: '+',
                    assetQuality: '–',
                    cost: '+',
                    dqi: '–',
                },
                negativeCount: 3,
                criticalNegativeCount: 2,
                isNegativeUnit: true,
            },
            {
                unitId: '4',
                unitName: 'Branch - Karol Bagh',
                unitType: 'BRANCH',
                parameters: {
                    business: '+',
                    deposits: '+',
                    advances: '+',
                    casa: '+',
                    profit: '+',
                    recovery: '+',
                    assetQuality: '+',
                    cost: '+',
                    dqi: '+',
                },
                negativeCount: 0,
                criticalNegativeCount: 0,
                isNegativeUnit: false,
            },
            {
                unitId: '5',
                unitName: 'IT Department - HO',
                unitType: 'CO',
                parameters: {
                    business: '0',
                    deposits: '0',
                    advances: '0',
                    casa: '0',
                    profit: '–',
                    recovery: '0',
                    assetQuality: '0',
                    cost: '–',
                    dqi: '0',
                },
                negativeCount: 2,
                criticalNegativeCount: 1,
                isNegativeUnit: false,
            },
        ]);
    }, []);

    const negUnits = units.filter((u) => u.isNegativeUnit);
    const criticalUnits = units.filter((u) => u.criticalNegativeCount > 0);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-iob-blue-dark tracking-tight">Negative Parameter MIS</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Parameter-wise visibility for all reporting units - Bank Grade Framework
                </p>
            </div>

            {/* Alert Summary */}
            <div className="grid grid-cols-3 gap-4">
                <div className="iob-card bg-red-50 border-l-4 border-red-500">
                    <div className="flex items-center">
                        <AlertTriangle className="w-5 h-5 text-red-500 mr-3" />
                        <div>
                            <p className="text-sm font-medium text-red-800">NEG Units</p>
                            <p className="text-2xl font-bold text-red-900 mt-1">{negUnits.length}</p>
                            <p className="text-xs text-red-600 mt-1">
                                ≥3 negative parameters OR critical negative for ≥2 periods
                            </p>
                        </div>
                    </div>
                </div>

                <div className="iob-card bg-yellow-50 border-l-4 border-yellow-500">
                    <div className="flex items-center">
                        <TrendingDown className="w-5 h-5 text-yellow-500 mr-3" />
                        <div>
                            <p className="text-sm font-medium text-yellow-800">Critical Negatives</p>
                            <p className="text-2xl font-bold text-yellow-900 mt-1">{criticalUnits.length}</p>
                            <p className="text-xs text-yellow-600 mt-1">
                                Units with at least one critical parameter negative
                            </p>
                        </div>
                    </div>
                </div>

                <div className="iob-card border-l-4" style={{ borderLeftColor: 'var(--iob-blue)' }}>
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                            style={{ background: 'var(--grad-emphasis)' }}>
                            <span className="text-white font-bold text-lg">{units.length}</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-iob-blue-dark">Total Units</p>
                            <p className="text-xs text-gray-600 mt-1">
                                All units show parameter-wise status
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Core Principle Banner */}
            <div className="iob-card text-white" style={{ background: 'var(--grad-primary)' }}>
                <h3 className="text-lg font-bold mb-2">🔒 FROZEN PRINCIPLE</h3>
                <p className="text-sm text-white/90 mb-4">
                    Every reporting unit must show what is positive, neutral, and negative — parameter-wise.
                    <br />
                    <strong>A unit is never "normal by default".</strong> It is explicitly positive, neutral, or negative on each parameter.
                </p>
                <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                        <p className="font-semibold mb-1">Coverage:</p>
                        <ul className="list-disc list-inside text-white/80 space-y-1">
                            <li>Bank (CO)</li>
                            <li>Zone / Circle</li>
                            <li>Region</li>
                            <li>Branch</li>
                        </ul>
                    </div>
                    <div>
                        <p className="font-semibold mb-1">Frozen Parameters:</p>
                        <ul className="list-disc list-inside text-white/80 space-y-1">
                            <li>Business Growth</li>
                            <li>Deposit Growth</li>
                            <li>Advance Growth</li>
                            <li>CASA Growth</li>
                            <li>Profit / Contribution</li>
                            <li>Recovery Performance</li>
                            <li>Asset Quality (NPA/SMA)</li>
                            <li>Cost Discipline</li>
                            <li>Data Quality Index (DQI)</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Parameter Status Matrix */}
            <ParameterStatusMatrix units={units} showNegativeCount={true} />

            {/* NEG Unit Details */}
            {negUnits.length > 0 && (
                <div className="iob-card border-2 border-red-500">
                    <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        Units Classified as NEG (Requires Intervention)
                    </h3>
                    <div className="space-y-3">
                        {negUnits.map((unit) => (
                            <div key={unit.unitId} className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <p className="font-semibold text-gray-900">{unit.unitName}</p>
                                        <p className="text-xs text-gray-500">{unit.unitType}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-red-600 font-bold">
                                            {unit.negativeCount} Negative Parameters
                                        </p>
                                        {unit.criticalNegativeCount > 0 && (
                                            <p className="text-xs text-red-500">
                                                ({unit.criticalNegativeCount} critical)
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {Object.entries(unit.parameters)
                                        .filter(([_, status]) => status === '–')
                                        .map(([param]) => (
                                            <span
                                                key={param}
                                                className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded"
                                            >
                                                {param.charAt(0).toUpperCase() + param.slice(1)}
                                            </span>
                                        ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Management Correctness Note */}
            <div className="iob-card border-l-4" style={{ borderLeftColor: 'var(--iob-blue)', background: 'var(--grad-card)' }}>
                <p className="font-semibold text-iob-blue-dark mb-2">Why This Is Management-Correct:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                    <li>Eliminates false comfort from aggregates</li>
                    <li>Enables early intervention</li>
                    <li>Prevents "NEG report shock" at month-end</li>
                    <li>Forces parameter ownership</li>
                    <li>Fully automation-ready</li>
                </ul>
            </div>
        </div>
    );
}
