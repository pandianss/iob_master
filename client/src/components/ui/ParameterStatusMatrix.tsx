import { CORE_PARAMETERS } from '../../lib/parameters';
import type { UnitParameterStatus, ParameterStatus } from '../../lib/parameters';
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';

interface ParameterStatusMatrixProps {
    units: UnitParameterStatus[];
    showNegativeCount?: boolean;
}

export function ParameterStatusMatrix({ units, showNegativeCount = true }: ParameterStatusMatrixProps) {
    const getStatusIcon = (status: ParameterStatus) => {
        if (status === '+') return <TrendingUp className="w-4 h-4 text-green-600" />;
        if (status === '–') return <TrendingDown className="w-4 h-4 text-red-600" />;
        return <Minus className="w-4 h-4 text-gray-400" />;
    };

    const getStatusColor = (status: ParameterStatus) => {
        if (status === '+') return 'bg-green-50 text-green-700';
        if (status === '–') return 'bg-red-50 text-red-700';
        return 'bg-gray-50 text-gray-500';
    };

    const getProgressBarWidth = (percentage: string) => {
        const num = parseInt(percentage);
        if (num >= 75) return 'w-3/4';
        if (num >= 50) return 'w-1/2';
        if (num >= 25) return 'w-1/4';
        if (num > 0) return 'w-1/12';
        return 'w-0';
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-iob-blue-dark">Parameter-wise Status Matrix</h3>
                <div className="flex items-center space-x-4 text-xs">
                    <span className="flex items-center">
                        <TrendingUp className="w-3 h-3 text-green-600 mr-1" /> Above Threshold
                    </span>
                    <span className="flex items-center">
                        <TrendingDown className="w-3 h-3 text-red-600 mr-1" /> Below Threshold
                    </span>
                    <span className="flex items-center">
                        <Minus className="w-3 h-3 text-gray-400 mr-1" /> Within Tolerance
                    </span>
                </div>
            </div>

            <div className="iob-card">
                <div className="overflow-x-auto">
                    <table className="iob-table">
                        <thead>
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider sticky left-0 z-10"
                                    style={{ background: 'var(--grad-table-header)' }}>
                                    Reporting Unit
                                </th>
                                {CORE_PARAMETERS.map((param) => (
                                    <th
                                        key={param.id}
                                        className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider"
                                    >
                                        <div className="flex flex-col items-center">
                                            <span>{param.name}</span>
                                            {param.critical && (
                                                <span className="text-red-500 text-[10px] mt-0.5">CRITICAL</span>
                                            )}
                                        </div>
                                    </th>
                                ))}
                                {showNegativeCount && (
                                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                                        Negative Count
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {units.map((unit) => (
                                <tr
                                    key={unit.unitId}
                                    className={`hover:bg-gray-50 transition-colors ${unit.isNegativeUnit ? 'bg-red-50' : ''
                                        }`}
                                >
                                    <td className="px-4 py-3 whitespace-nowrap sticky left-0 bg-white z-10">
                                        <div className="flex items-center">
                                            {unit.isNegativeUnit && (
                                                <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                                            )}
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{unit.unitName}</div>
                                                <div className="text-xs text-gray-500">{unit.unitType}</div>
                                            </div>
                                        </div>
                                    </td>
                                    {CORE_PARAMETERS.map((param) => {
                                        const status = unit.parameters[param.id];
                                        return (
                                            <td key={param.id} className="px-3 py-3 text-center">
                                                <div className={`inline-flex items-center justify-center w-8 h-8 rounded ${getStatusColor(status)}`}>
                                                    {getStatusIcon(status)}
                                                </div>
                                            </td>
                                        );
                                    })}
                                    {showNegativeCount && (
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className={`text-sm font-bold ${unit.negativeCount > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                                                    {unit.negativeCount}
                                                </span>
                                                {unit.criticalNegativeCount > 0 && (
                                                    <span className="text-xs text-red-500 mt-0.5">
                                                        ({unit.criticalNegativeCount} critical)
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Aggregated Insights */}
            <div className="grid grid-cols-4 gap-4">
                <div className="iob-card">
                    <p className="text-xs text-gray-500 mb-1">Units with ≥1 Negative</p>
                    <p className="text-2xl font-bold text-gray-900">
                        {units.filter((u) => u.negativeCount >= 1).length}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        {((units.filter((u) => u.negativeCount >= 1).length / units.length) * 100).toFixed(0)}% of total
                    </p>
                </div>
                <div className="iob-card">
                    <p className="text-xs text-gray-500 mb-1">Units with ≥3 Negatives</p>
                    <p className="text-2xl font-bold text-red-600">
                        {units.filter((u) => u.negativeCount >= 3).length}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Requires intervention</p>
                </div>
                <div className="iob-card">
                    <p className="text-xs text-gray-500 mb-1">Units with Critical Negatives</p>
                    <p className="text-2xl font-bold text-red-600">
                        {units.filter((u) => u.criticalNegativeCount > 0).length}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">High priority</p>
                </div>
                <div className="iob-card">
                    <p className="text-xs text-gray-500 mb-1">Classified as NEG</p>
                    <p className="text-2xl font-bold text-red-700">
                        {units.filter((u) => u.isNegativeUnit).length}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Formal NEG status</p>
                </div>
            </div>

            {/* Top Negative Parameters by Frequency */}
            <div className="iob-card">
                <h4 className="text-sm font-semibold text-iob-blue-dark mb-3">Top Negative Parameters by Frequency</h4>
                <div className="space-y-2">
                    {CORE_PARAMETERS.map((param) => {
                        const negativeCount = units.filter((u) => u.parameters[param.id] === '–').length;
                        const percentage = ((negativeCount / units.length) * 100).toFixed(0);
                        return (
                            <div key={param.id} className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <span className="text-sm font-medium text-gray-700">{param.name}</span>
                                    {param.critical && (
                                        <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">CRITICAL</span>
                                    )}
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-32 bg-gray-200 rounded-full h-2 relative overflow-hidden">
                                        <div
                                            className={`h-2 rounded-full absolute left-0 top-0 ${negativeCount > 0 ? 'bg-red-500' : 'bg-gray-300'} ${getProgressBarWidth(percentage)}`}
                                        />
                                    </div>
                                    <span className={`text-sm font-semibold ${negativeCount > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                                        {percentage}%
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
