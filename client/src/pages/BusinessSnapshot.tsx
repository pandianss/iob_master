import { useState } from 'react';
import { Printer, Lock, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function BusinessSnapshot() {
    const [snapshot] = useState({
        unit: 'Credit Department - Head Office',
        level: 'CO',
        snapshotDate: '2026-02-01',
        previousWorkingDay: '2026-01-31',
        monthStart: '2026-02-01',
        quarterStart: '2026-01-01',
        fyStart: '2025-04-01',
        previousFYClose: '2025-03-31',
        isFrozen: true,
    });

    const getTrendIcon = (trend: string) => {
        if (trend === '↑') return <TrendingUp className="w-4 h-4 text-green-600" />;
        if (trend === '↓') return <TrendingDown className="w-4 h-4 text-red-600" />;
        return <Minus className="w-4 h-4 text-gray-400" />;
    };

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex items-center justify-between print:hidden">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Business Snapshot</h1>
                    <p className="text-sm text-gray-500 mt-1">Frozen MIS Report - Bank Grade</p>
                </div>
                <div className="flex space-x-3">
                    {snapshot.isFrozen && (
                        <span className="flex items-center px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                            <Lock className="w-4 h-4 mr-2" /> Frozen
                        </span>
                    )}
                    <button
                        onClick={() => window.print()}
                        className="flex items-center px-4 py-2 bg-[var(--color-brand-primary)] text-white rounded-lg hover:bg-[var(--color-brand-secondary)]"
                    >
                        <Printer className="w-4 h-4 mr-2" /> Print
                    </button>
                </div>
            </div>

            {/* Print-Ready Report */}
            <div className="bg-white border-2 border-gray-900 p-6 print:border-0 print:p-0" style={{ fontFamily: 'monospace' }}>
                {/* Title */}
                <div className="text-center mb-4 border-b-2 border-gray-900 pb-2">
                    <h2 className="text-xl font-bold tracking-wider">BUSINESS SNAPSHOT</h2>
                </div>

                {/* Header Info */}
                <div className="grid grid-cols-2 gap-x-8 mb-4 text-[10px]">
                    <div>
                        <p className="mb-0.5"><strong>Unit:</strong> {snapshot.unit}</p>
                        <p className="mb-0.5">
                            <strong>Level:</strong>
                            <span className="ml-2">☑ {snapshot.level}</span>
                            {['CO', 'ZONE', 'REGION', 'BRANCH'].filter(l => l !== snapshot.level).map(l => (
                                <span key={l} className="ml-2">☐ {l}</span>
                            ))}
                        </p>
                    </div>
                    <div>
                        <p className="mb-0.5"><strong>Snapshot Date:</strong> {snapshot.snapshotDate}</p>
                        <p className="mb-0.5"><strong>Previous Working Day:</strong> {snapshot.previousWorkingDay}</p>
                        <p className="mb-0.5"><strong>Month Start:</strong> {snapshot.monthStart}</p>
                        <p className="mb-0.5"><strong>Quarter Start:</strong> {snapshot.quarterStart}</p>
                        <p className="mb-0.5"><strong>FY Start:</strong> {snapshot.fyStart}</p>
                        <p className="mb-0.5"><strong>Previous FY Close:</strong> {snapshot.previousFYClose}</p>
                    </div>
                </div>

                {/* Section 1: Key Position */}
                <div className="mb-4">
                    <h3 className="font-bold text-xs mb-1 bg-gray-900 text-white px-2 py-0.5">1. KEY POSITION (ACTUALS)</h3>
                    <table className="w-full text-[10px]" style={{ borderCollapse: 'collapse', border: '1px solid #000' }}>
                        <thead>
                            <tr className="bg-gray-100">
                                <th style={{ border: '1px solid #000', padding: '2px 6px', textAlign: 'left', width: '128px' }}>Metric</th>
                                <th style={{ border: '1px solid #000', padding: '2px 6px', textAlign: 'right', width: '80px' }}>Date T</th>
                                <th style={{ border: '1px solid #000', padding: '2px 6px', textAlign: 'right', width: '80px' }}>T-1 Day</th>
                                <th style={{ border: '1px solid #000', padding: '2px 6px', textAlign: 'right', width: '80px' }}>Month Start</th>
                                <th style={{ border: '1px solid #000', padding: '2px 6px', textAlign: 'right', width: '80px' }}>FY Start</th>
                                <th style={{ border: '1px solid #000', padding: '2px 6px', textAlign: 'right', width: '96px' }}>Prev FY Close</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { metric: 'Total Business', values: ['45,230', '45,180', '44,500', '42,000', '40,500'] },
                                { metric: 'Deposits', values: ['28,450', '28,400', '28,000', '26,500', '25,800'] },
                                { metric: 'Advances', values: ['16,780', '16,780', '16,500', '15,500', '14,700'] },
                                { metric: 'CASA %', values: ['42.5', '42.3', '41.8', '40.2', '39.5'] },
                                { metric: 'Gross NPA', values: ['850', '855', '870', '920', '980'] },
                                { metric: 'Net Profit', values: ['125', '120', '110', '95', '85'] },
                                { metric: 'DQI Score', values: ['92.5', '91.8', '90.2', '88.5', '87.0'] },
                            ].map((row, idx) => (
                                <tr key={idx}>
                                    <td style={{ border: '1px solid #000', padding: '2px 6px', fontWeight: '600' }}>{row.metric}</td>
                                    {row.values.map((val, i) => (
                                        <td key={i} style={{ border: '1px solid #000', padding: '2px 6px', textAlign: 'right' }}>{val}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Section 2: Growth View */}
                <div className="mb-4">
                    <h3 className="font-bold text-xs mb-1 bg-gray-900 text-white px-2 py-0.5">2. GROWTH VIEW (%)</h3>
                    <table className="w-full text-[10px]" style={{ borderCollapse: 'collapse', border: '1px solid #000' }}>
                        <thead>
                            <tr className="bg-gray-100">
                                <th style={{ border: '1px solid #000', padding: '2px 6px', textAlign: 'left', width: '128px' }}>Metric</th>
                                <th style={{ border: '1px solid #000', padding: '2px 6px', textAlign: 'right', width: '96px' }}>Prev FY Growth</th>
                                <th style={{ border: '1px solid #000', padding: '2px 6px', textAlign: 'right', width: '64px' }}>FTY</th>
                                <th style={{ border: '1px solid #000', padding: '2px 6px', textAlign: 'right', width: '64px' }}>FTM</th>
                                <th style={{ border: '1px solid #000', padding: '2px 6px', textAlign: 'right', width: '64px' }}>FTD</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { metric: 'Total Business', values: ['11.7', '7.7', '1.6', '0.1'] },
                                { metric: 'Deposits', values: ['10.3', '7.4', '1.6', '0.2'] },
                                { metric: 'Advances', values: ['14.1', '8.3', '1.7', '0.0'] },
                                { metric: 'CASA', values: ['7.6', '5.7', '1.7', '0.5'] },
                                { metric: 'NPA (Δ)', values: ['-13.3', '-7.6', '-2.3', '-0.6'] },
                                { metric: 'Profit', values: ['47.1', '31.6', '13.6', '4.2'] },
                                { metric: 'DQI Score', values: ['6.3', '4.5', '2.2', '0.8'] },
                            ].map((row, idx) => (
                                <tr key={idx}>
                                    <td style={{ border: '1px solid #000', padding: '2px 6px', fontWeight: '600' }}>{row.metric}</td>
                                    {row.values.map((val, i) => (
                                        <td key={i} style={{ border: '1px solid #000', padding: '2px 6px', textAlign: 'right' }}>{val}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Section 3: Target & Gap */}
                <div className="mb-4">
                    <h3 className="font-bold text-xs mb-1 bg-gray-900 text-white px-2 py-0.5">3. TARGET & GAP TRACKING</h3>
                    <table className="w-full text-[10px]" style={{ borderCollapse: 'collapse', border: '1px solid #000' }}>
                        <thead>
                            <tr className="bg-gray-100">
                                <th style={{ border: '1px solid #000', padding: '2px 6px', textAlign: 'left', width: '128px' }}>Metric</th>
                                <th style={{ border: '1px solid #000', padding: '2px 6px', textAlign: 'right', width: '80px' }}>Month Target</th>
                                <th style={{ border: '1px solid #000', padding: '2px 6px', textAlign: 'right', width: '64px' }}>Actual</th>
                                <th style={{ border: '1px solid #000', padding: '2px 6px', textAlign: 'right', width: '64px' }}>Gap</th>
                                <th style={{ border: '1px solid #000', padding: '2px 6px', textAlign: 'right', width: '64px' }}>Gap %</th>
                                <th style={{ border: '1px solid #000', padding: '2px 6px', textAlign: 'right', width: '64px' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { metric: 'Business', target: '730', actual: '730', gap: '0', gapPct: '0.0', status: '✓' },
                                { metric: 'Deposits', target: '450', actual: '450', gap: '0', gapPct: '0.0', status: '✓' },
                                { metric: 'Advances', target: '280', actual: '280', gap: '0', gapPct: '0.0', status: '✓' },
                                { metric: 'CASA', target: '180', actual: '168', gap: '-12', gapPct: '-6.7', status: '✗' },
                                { metric: 'Profit', target: '15', actual: '15', gap: '0', gapPct: '0.0', status: '✓' },
                                { metric: 'Recovery', target: '50', actual: '42', gap: '-8', gapPct: '-16.0', status: '✗' },
                                { metric: 'DQI Score', target: '95.0', actual: '92.5', gap: '-2.5', gapPct: '-2.6', status: '△' },
                            ].map((row, idx) => (
                                <tr key={idx}>
                                    <td style={{ border: '1px solid #000', padding: '2px 6px', fontWeight: '600' }}>{row.metric}</td>
                                    <td style={{ border: '1px solid #000', padding: '2px 6px', textAlign: 'right' }}>{row.target}</td>
                                    <td style={{ border: '1px solid #000', padding: '2px 6px', textAlign: 'right' }}>{row.actual}</td>
                                    <td style={{ border: '1px solid #000', padding: '2px 6px', textAlign: 'right' }}>{row.gap}</td>
                                    <td style={{ border: '1px solid #000', padding: '2px 6px', textAlign: 'right' }}>{row.gapPct}</td>
                                    <td style={{ border: '1px solid #000', padding: '2px 6px', textAlign: 'center' }}>{row.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Section 4: Frozen Ratio Set */}
                <div className="mb-4">
                    <h3 className="font-bold text-xs mb-1 bg-gray-900 text-white px-2 py-0.5">4. FROZEN RATIO SET (AS PER LEVEL)</h3>
                    <table className="w-full text-[10px] border border-gray-900" style={{ borderCollapse: 'collapse' }}>
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-900 px-1.5 py-0.5 text-left">Ratio</th>
                                <th className="border border-gray-900 px-1.5 py-0.5 text-right w-20">Value</th>
                                <th className="border border-gray-900 px-1.5 py-0.5 text-center w-16">Trend</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { ratio: 'Business per Employee', value: '225.15', trend: '↑' },
                                { ratio: 'NIM', value: '3.45', trend: '→' },
                                { ratio: 'Cost of Deposits', value: '4.25', trend: '↓' },
                                { ratio: 'Yield on Advances', value: '8.75', trend: '↑' },
                                { ratio: 'Spread', value: '4.50', trend: '↑' },
                                { ratio: 'Cost-to-Income', value: '48.5', trend: '↓' },
                                { ratio: 'Gross NPA %', value: '1.88', trend: '↓' },
                                { ratio: 'Recovery / Slippage', value: '1.25', trend: '↑' },
                            ].map((row, idx) => (
                                <tr key={idx}>
                                    <td className="border border-gray-900 px-1.5 py-0.5 font-semibold">{row.ratio}</td>
                                    <td className="border border-gray-900 px-1.5 py-0.5 text-right">{row.value}</td>
                                    <td className="border border-gray-900 px-1.5 py-0.5 text-center">
                                        <span className="inline-flex items-center justify-center">
                                            {getTrendIcon(row.trend)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Sections 5-6 in compact grid */}
                <div className="grid grid-cols-2 gap-3 text-[10px] mb-3">
                    {/* Section 5 */}
                    <div>
                        <h3 className="font-bold text-xs mb-1 bg-gray-900 text-white px-2 py-0.5">5. STRESS & CONTROL INDICATORS</h3>
                        <table className="w-full border border-gray-900" style={{ borderCollapse: 'collapse' }}>
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-900 px-1.5 py-0.5 text-left">Indicator</th>
                                    <th className="border border-gray-900 px-1.5 py-0.5 text-right w-12">Count</th>
                                    <th className="border border-gray-900 px-1.5 py-0.5 text-right w-16">Exposure</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ['Accounts Downgraded', '12', '450'],
                                    ['Accounts Upgraded', '8', '320'],
                                    ['SINPA Accounts', '5', '180'],
                                    ['SMA Accounts', '15', '520'],
                                ].map((row, idx) => (
                                    <tr key={idx}>
                                        <td className="border border-gray-900 px-1.5 py-0.5">{row[0]}</td>
                                        <td className="border border-gray-900 px-1.5 py-0.5 text-right">{row[1]}</td>
                                        <td className="border border-gray-900 px-1.5 py-0.5 text-right">{row[2]}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Section 6 */}
                    <div>
                        <h3 className="font-bold text-xs mb-1 bg-gray-900 text-white px-2 py-0.5">6. RECOVERY & CASH DISCIPLINE</h3>
                        <table className="w-full border border-gray-900" style={{ borderCollapse: 'collapse' }}>
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-900 px-1.5 py-0.5 text-left">Item</th>
                                    <th className="border border-gray-900 px-1.5 py-0.5 text-right w-12">Actual</th>
                                    <th className="border border-gray-900 px-1.5 py-0.5 text-right w-12">Target</th>
                                    <th className="border border-gray-900 px-1.5 py-0.5 text-right w-12">Var</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ['Total Recovery', '125', '150', '-25'],
                                    ['Cash Recovery', '95', '120', '-25'],
                                    ['Recovery % to Demand', '83', '90', '-7'],
                                    ['Cash Holding', '450', '400', '+50'],
                                ].map((row, idx) => (
                                    <tr key={idx}>
                                        <td className="border border-gray-900 px-1.5 py-0.5">{row[0]}</td>
                                        <td className="border border-gray-900 px-1.5 py-0.5 text-right">{row[1]}</td>
                                        <td className="border border-gray-900 px-1.5 py-0.5 text-right">{row[2]}</td>
                                        <td className={`border border-gray-900 px-1.5 py-0.5 text-right ${row[3].startsWith('-') ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}`}>{row[3]}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Section 7 & 8 */}
                <div className="grid grid-cols-2 gap-3 text-[10px] mb-3">
                    <div>
                        <h3 className="font-bold text-xs mb-1 bg-gray-900 text-white px-2 py-0.5">7. BUSINESS MOMENTUM</h3>
                        <table className="w-full border border-gray-900" style={{ borderCollapse: 'collapse' }}>
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-900 px-1.5 py-0.5 text-left">Item</th>
                                    <th className="border border-gray-900 px-1.5 py-0.5 text-right w-12">MTD</th>
                                    <th className="border border-gray-900 px-1.5 py-0.5 text-right w-12">QTD</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ['Accounts Opened', '45', '45'],
                                    ['CASA Accounts Added', '28', '28'],
                                    ['Dormant → Active', '12', '12'],
                                ].map((row, idx) => (
                                    <tr key={idx}>
                                        <td className="border border-gray-900 px-1.5 py-0.5">{row[0]}</td>
                                        <td className="border border-gray-900 px-1.5 py-0.5 text-right">{row[1]}</td>
                                        <td className="border border-gray-900 px-1.5 py-0.5 text-right">{row[2]}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div>
                        <h3 className="font-bold text-xs mb-1 bg-gray-900 text-white px-2 py-0.5">8. INTERVENTION FLAGS (AUTO-GENERATED)</h3>
                        <div className="border border-gray-900 p-1.5 space-y-0.5 bg-white">
                            {[
                                { flag: 'Margin Compression', active: false },
                                { flag: 'CASA Slippage', active: true },
                                { flag: 'Asset Quality Deterioration', active: false },
                                { flag: 'Recovery Lag', active: true },
                                { flag: 'Cost Overrun', active: false },
                                { flag: 'Productivity Drag', active: false },
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center">
                                    <span className="mr-1.5">{item.active ? '☑' : '☐'}</span>
                                    <span className={item.active ? 'font-bold text-red-600' : ''}>{item.flag}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Section 9 */}
                <div className="text-[10px]">
                    <h3 className="font-bold text-xs mb-1 bg-gray-900 text-white px-2 py-0.5">9. ACTION OWNERSHIP (OPTIONAL)</h3>
                    <table className="w-full border border-gray-900" style={{ borderCollapse: 'collapse' }}>
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-900 px-1.5 py-0.5 text-left">Issue</th>
                                <th className="border border-gray-900 px-1.5 py-0.5 text-left w-32">Owner</th>
                                <th className="border border-gray-900 px-1.5 py-0.5 text-left w-20">Due By</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-gray-900 px-1.5 py-0.5">CASA Slippage - Improve deposit mobilization</td>
                                <td className="border border-gray-900 px-1.5 py-0.5">AGM (Retail Banking)</td>
                                <td className="border border-gray-900 px-1.5 py-0.5">2026-02-15</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-900 px-1.5 py-0.5">Recovery Lag - Accelerate NPA resolution</td>
                                <td className="border border-gray-900 px-1.5 py-0.5">CM (Credit)</td>
                                <td className="border border-gray-900 px-1.5 py-0.5">2026-02-10</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t-2 border-gray-900 text-xs text-center">
                    <p className="font-bold">*** FROZEN REPORT - NO MODIFICATIONS PERMITTED ***</p>
                    <p className="mt-1">Generated: {new Date().toLocaleString()} | System: IOB Governance Platform</p>
                </div>
            </div>
        </div>
    );
}
