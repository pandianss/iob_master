import {
    CLASS_A_PARAMETERS,
    CLASS_B_PARAMETERS,
    CLASS_C_PARAMETERS,
    CLASS_D_PARAMETERS,
    MIS_SNAPSHOT_MAPPING,
    generateCoverageStatement,
    VISIBILITY_LAYERS,
} from '../lib/parameter-classification';
import { FileText, Layers, CheckCircle2 } from 'lucide-react';

export function ParameterMapping() {
    const coverageStatement = generateCoverageStatement('SNAP-2026-02-01', new Date());

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">MIS Parameter Classification</h1>
                <p className="text-sm text-gray-500 mt-1">
                    4-Class Framework with MIS → Snapshot Mapping Register
                </p>
            </div>

            {/* Coverage Statement */}
            <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6">
                <div className="flex items-start">
                    <CheckCircle2 className="w-6 h-6 text-green-600 mr-3 mt-0.5" />
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-green-900 mb-2">Parameter Coverage Statement</h3>
                        <p className="text-sm text-green-800 mb-4">
                            <strong>"{coverageStatement.attestation}"</strong>
                        </p>
                        <div className="grid grid-cols-5 gap-4 text-sm">
                            <div className="bg-white rounded-lg p-3 text-center">
                                <p className="text-gray-500 text-xs mb-1">Total MIS Parameters</p>
                                <p className="text-2xl font-bold text-gray-900">{coverageStatement.totalMISParameters}</p>
                            </div>
                            <div className="bg-white rounded-lg p-3 text-center">
                                <p className="text-gray-500 text-xs mb-1">Class A</p>
                                <p className="text-2xl font-bold text-blue-600">{coverageStatement.classAEvaluated}</p>
                            </div>
                            <div className="bg-white rounded-lg p-3 text-center">
                                <p className="text-gray-500 text-xs mb-1">Class B</p>
                                <p className="text-2xl font-bold text-purple-600">{coverageStatement.classBEvaluated}</p>
                            </div>
                            <div className="bg-white rounded-lg p-3 text-center">
                                <p className="text-gray-500 text-xs mb-1">Class C</p>
                                <p className="text-2xl font-bold text-orange-600">{coverageStatement.classCEvaluated}</p>
                            </div>
                            <div className="bg-white rounded-lg p-3 text-center">
                                <p className="text-gray-500 text-xs mb-1">Class D</p>
                                <p className="text-2xl font-bold text-gray-600">{coverageStatement.classDEvaluated}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Visibility Layers */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Layers className="w-5 h-5 mr-2" />
                    Visibility Layers (Layered, Not Flattened)
                </h3>
                <div className="grid grid-cols-3 gap-4">
                    {Object.entries(VISIBILITY_LAYERS).map(([key, layer]) => (
                        <div key={key} className="border border-gray-200 rounded-lg p-4">
                            <p className="font-semibold text-gray-900 mb-1 capitalize">{key}</p>
                            <p className="text-xs text-gray-500 mb-2">What you see: {layer.description}</p>
                            <p className="text-xs text-blue-600 font-medium mb-3">Actually used: {layer.actualUsage}</p>
                            <div className="space-y-1">
                                {layer.parameters.map((param, idx) => (
                                    <div key={idx} className="text-xs bg-gray-50 px-2 py-1 rounded">{param}</div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Class A Parameters */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-700 font-bold">A</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Primary Control Parameters</h3>
                        <p className="text-sm text-gray-500">Directly influence decisions; must appear on snapshot</p>
                    </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4 text-sm">
                    <strong>Display:</strong> Actuals + Growth + Target Gap
                </div>
                <div className="grid grid-cols-3 gap-3">
                    {CLASS_A_PARAMETERS.map((param) => (
                        <div
                            key={param.id}
                            className={`border rounded-lg p-3 ${param.primary ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                        >
                            <p className="text-sm font-medium text-gray-900">{param.name}</p>
                            <p className="text-xs text-gray-500 mt-1">{param.category}</p>
                            {param.primary && (
                                <span className="inline-block mt-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                                    PRIMARY
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Class B Parameters */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-purple-700 font-bold">B</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Ratio & Efficiency Parameters</h3>
                        <p className="text-sm text-gray-500">Derived from Class A; shown selectively</p>
                    </div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded p-3 mb-4 text-sm">
                    <strong>Display:</strong> Shown only if frozen in ratio set for that level
                </div>
                <div className="space-y-2">
                    {CLASS_B_PARAMETERS.map((param) => (
                        <div key={param.id} className="border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-900">{param.name}</p>
                                <p className="text-xs text-gray-500 mt-1 font-mono">{param.formula}</p>
                            </div>
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">DERIVED</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Class C Parameters */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-orange-700 font-bold">C</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Segment / Scheme / Portfolio Parameters</h3>
                        <p className="text-sm text-gray-500">Too many to show directly, but critical diagnostically</p>
                    </div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded p-3 mb-4 text-sm">
                    <strong>Display:</strong> Not shown individually on snapshot
                    <br />
                    <strong>Consumed via:</strong> Portfolio concentration, Growth drag/push indicators, NEG parameter flags
                </div>
                <div className="space-y-4">
                    {['Agriculture', 'Retail', 'SME', 'Social'].map((segment) => (
                        <div key={segment}>
                            <p className="text-sm font-semibold text-gray-700 mb-2">{segment} Segments</p>
                            <div className="grid grid-cols-4 gap-2">
                                {CLASS_C_PARAMETERS.filter((p) => p.segment === segment).map((param) => (
                                    <div
                                        key={param.id}
                                        className={`border rounded p-2 ${param.critical ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}
                                    >
                                        <p className="text-xs font-medium text-gray-900">{param.name}</p>
                                        {param.critical && (
                                            <span className="inline-block mt-1 px-1.5 py-0.5 bg-orange-100 text-orange-700 text-[10px] rounded">
                                                CRITICAL
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Class D Parameters */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-gray-700 font-bold">D</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Diagnostic / Tracking Parameters</h3>
                        <p className="text-sm text-gray-500">Required for drill-down, not for snapshot</p>
                    </div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-4 text-sm">
                    <strong>Display:</strong> Always retained in MIS tables, never all exposed on snapshot
                </div>
                <div className="grid grid-cols-3 gap-3">
                    {CLASS_D_PARAMETERS.map((param) => (
                        <div key={param.id} className="border border-gray-200 rounded p-3">
                            <p className="text-sm font-medium text-gray-900">{param.name}</p>
                            <p className="text-xs text-gray-500 mt-1">{param.type}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* MIS → Snapshot Mapping Register */}
            <div className="bg-white border-2 border-gray-900 rounded-lg p-6">
                <div className="flex items-center mb-4">
                    <FileText className="w-6 h-6 mr-3" />
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">MIS → Snapshot Mapping Register</h3>
                        <p className="text-sm text-gray-500">One-time mapping that prevents silent exclusion</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">MIS Parameter</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Class</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Snapshot Usage</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Evaluation Method</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {MIS_SNAPSHOT_MAPPING.map((mapping, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-900">{mapping.misParameter}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span
                                            className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${mapping.class === 'A'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : mapping.class === 'B'
                                                        ? 'bg-purple-100 text-purple-700'
                                                        : mapping.class === 'C'
                                                            ? 'bg-orange-100 text-orange-700'
                                                            : 'bg-gray-100 text-gray-700'
                                                }`}
                                        >
                                            {mapping.class}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-700">{mapping.snapshotUsage}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span
                                            className={`px-2 py-1 text-xs rounded ${mapping.evaluationMethod === 'direct_display'
                                                    ? 'bg-green-100 text-green-700'
                                                    : mapping.evaluationMethod === 'ratio_section'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : mapping.evaluationMethod === 'neg_flag'
                                                            ? 'bg-red-100 text-red-700'
                                                            : mapping.evaluationMethod === 'portfolio_drag'
                                                                ? 'bg-yellow-100 text-yellow-700'
                                                                : 'bg-gray-100 text-gray-700'
                                                }`}
                                        >
                                            {mapping.evaluationMethod.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Key Principle */}
            <div className="bg-gray-900 text-white p-6 rounded-lg">
                <h3 className="text-lg font-bold mb-3">🔒 KEY PRINCIPLE</h3>
                <p className="text-sm text-gray-300 mb-4">
                    <strong>The snapshot does not list all MIS rows. It summarises their effect.</strong>
                </p>
                <div className="bg-gray-800 rounded p-4 text-sm space-y-2">
                    <p>
                        <strong>Example:</strong> MIS.pdf shows 15+ advance segments with growth and gaps for each.
                    </p>
                    <p>
                        <strong>Snapshot shows:</strong> Total Advances, Advance Growth, NEG flags where segment drag exists,
                        Concentration ratios.
                    </p>
                    <p className="text-yellow-400 font-semibold mt-3">
                        ➡ The segments still drive the result, just indirectly.
                    </p>
                    <p className="text-green-400 font-semibold">➡ Nothing is discarded.</p>
                </div>
            </div>
        </div>
    );
}
