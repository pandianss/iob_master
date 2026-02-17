import { useState, useEffect } from 'react';
import { Printer, Loader2, AlertCircle, Settings2, Save, Target } from 'lucide-react';

export function BusinessSnapshot() {
    const [config, setConfig] = useState({
        t: new Date().toISOString().split('T')[0],
        tMinus1: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        monthEnd: new Date(new Date().getFullYear(), new Date().getMonth(), 0).toISOString().split('T')[0],
        fyEnd: '2025-03-31',
        fyStart: '2024-04-01'
    });

    const [targetForm, setTargetForm] = useState({
        metric: 'DEPOSITS',
        timeframe: 'MONTH_END',
        value: 0,
        date: new Date().toISOString().split('T')[0]
    });

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showSettings, setShowSettings] = useState(false);
    const [savingTarget, setSavingTarget] = useState(false);

    const fetchComparison = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams(config);
            const response = await fetch(`/api/reporting/business-snapshot/comparison?${params.toString()}`);
            if (!response.ok) throw new Error('Failed to fetch comparison snapshot');
            const result = await response.json();
            setData(result);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const saveTarget = async () => {
        setSavingTarget(true);
        try {
            // Scale monetary values to absolute Rupees (internal standard)
            // CASA and CD_RATIO are stored as percentages (0-100)
            const isPct = targetForm.metric === 'CASA' || targetForm.metric === 'CD_RATIO';
            const scaledValue = isPct ? Number(targetForm.value) : Number(targetForm.value) * 10000000;

            const response = await fetch('/api/reporting/business-snapshot/targets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    metric: targetForm.metric,
                    timeframe: targetForm.timeframe,
                    targetValue: scaledValue,
                    targetDate: targetForm.date
                })
            });
            if (!response.ok) throw new Error('Failed to save target');
            await fetchComparison();
            alert('Target saved successfully');
        } catch (err: any) {
            alert('Error saving target: ' + err.message);
        } finally {
            setSavingTarget(false);
        }
    };

    useEffect(() => {
        fetchComparison();
    }, []);

    const formatCurr = (val: number, isPct = false) => {
        if (!val) return isPct ? '0.00' : '0.00';
        const numFormat = new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        return isPct ? numFormat.format(val) : numFormat.format(val / 10000000);
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const d = String(date.getDate()).padStart(2, '0');
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const y = String(date.getFullYear()).slice(-2);
        return `${d}.${m}.${y}`;
    };

    const calculateGrowth = (curr: number, prev: number) => {
        if (!prev) return '0.00';
        const growth = ((curr - prev) / prev) * 100;
        return growth.toFixed(2);
    };

    const getRowData = (label: string, metricKey: string, path: string[]) => {
        if (!data) return null;

        const getValue = (snap: any) => {
            let val = snap;
            for (const key of path) {
                val = val?.[key];
            }
            return Number(val) || 0;
        };

        const t = getValue(data.snapshots.t);
        const t1 = getValue(data.snapshots.tMinus1);
        const mEnd = getValue(data.snapshots.monthEnd);
        const fEnd = getValue(data.snapshots.fyEnd);
        const fStart = getValue(data.snapshots.fyStart);

        const targetM = data.targets[metricKey]?.MONTH_END || 0;
        const targetQ = data.targets[metricKey]?.QTR_END || 0;

        const getStatus = (gap: number) => {
            if (gap === 0) return 'Achieved';
            return gap > 0 ? 'Surplus' : 'Deficit';
        };

        return {
            label,
            isPercentage: label.includes('(%)'),
            t,
            t1,
            mEnd,
            fEnd,
            fStart,
            growthPrevFY: { pct: calculateGrowth(fEnd, fStart), abs: fEnd - fStart },
            growthCurrFY: { pct: calculateGrowth(t, fEnd), abs: t - fEnd },
            growthM: { pct: calculateGrowth(t, mEnd), abs: t - mEnd },
            growth1D: { pct: calculateGrowth(t, t1), abs: t - t1 },
            budgetM: targetM,
            gapM: targetM ? (t - targetM) : 0,
            statusM: targetM ? getStatus(t - targetM) : '-',
            budgetQ: targetQ,
            gapQ: targetQ ? (t - targetQ) : 0,
            statusQ: targetQ ? getStatus(t - targetQ) : '-'
        };
    };

    if (loading && !data) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                <p>Generating Enhanced Business Snapshot...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <style>{`
                @media print {
                    @page { size: landscape; margin: 5mm; }
                    .print-hidden { display: none !important; }
                    body { -webkit-print-color-adjust: exact; }
                }
            `}</style>

            <div className="flex items-center justify-between print-hidden">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Business Snapshot</h1>
                    <p className="text-sm text-gray-500 mt-1">Command Center - Actuals, Growth & Targets</p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 bg-white"
                    >
                        <Settings2 className="w-4 h-4 mr-2" /> Settings
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center px-4 py-2 bg-[var(--color-brand-primary)] text-white rounded-lg hover:bg-[var(--color-brand-secondary)]"
                    >
                        <Printer className="w-4 h-4 mr-2" /> Print
                    </button>
                </div>
            </div>

            {showSettings && (
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm print-hidden">
                    <h2 className="text-lg font-bold mb-4 flex items-center">
                        <Settings2 className="w-5 h-5 mr-2" /> Snapshot Settings
                    </h2>
                    <div className="grid grid-cols-5 gap-4 mb-6">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">T Date (Latest)</label>
                            <input type="date" value={config.t} onChange={e => setConfig({ ...config, t: e.target.value })} className="w-full p-2 border rounded-lg text-sm" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">T-1 Date</label>
                            <input type="date" value={config.tMinus1} onChange={e => setConfig({ ...config, tMinus1: e.target.value })} className="w-full p-2 border rounded-lg text-sm" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Prev Month End</label>
                            <input type="date" value={config.monthEnd} onChange={e => setConfig({ ...config, monthEnd: e.target.value })} className="w-full p-2 border rounded-lg text-sm" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Prev FY End</label>
                            <input type="date" value={config.fyEnd} onChange={e => setConfig({ ...config, fyEnd: e.target.value })} className="w-full p-2 border rounded-lg text-sm" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Prev FY Start</label>
                            <input type="date" value={config.fyStart} onChange={e => setConfig({ ...config, fyStart: e.target.value })} className="w-full p-2 border rounded-lg text-sm" />
                        </div>
                    </div>

                    <div className="border-t pt-6">
                        <h3 className="text-sm font-bold mb-4 flex items-center">
                            <Target className="w-4 h-4 mr-2" /> Target Management
                        </h3>
                        <div className="grid grid-cols-5 gap-3 items-end">
                            <div className="col-span-1">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Metric</label>
                                <select
                                    value={targetForm.metric}
                                    onChange={e => setTargetForm({ ...targetForm, metric: e.target.value })}
                                    className="w-full p-2 border rounded-lg text-sm"
                                >
                                    <option value="DEPOSITS">Total Deposits</option>
                                    <option value="SAVINGS">Savings Bank</option>
                                    <option value="CURRENT">Current Deposits</option>
                                    <option value="TERM_DEPOSITS">Term Deposits</option>
                                    <option value="RETAIL_TD">Retail TD</option>
                                    <option value="BULK_TD">Bulk TD</option>
                                    <option value="ADVANCES">Total Advances</option>
                                    <option value="RETAIL_ADV">Core Retail</option>
                                    <option value="AGRI_ADV">Core Agri</option>
                                    <option value="MSME_ADV">Core MSME</option>
                                    <option value="CASA">CASA Ratio</option>
                                    <option value="CD_RATIO">CD Ratio</option>
                                    <option value="NPA">End Level NPA</option>
                                    <option value="PROFIT">Net Profit</option>
                                </select>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Timeframe</label>
                                <select
                                    value={targetForm.timeframe}
                                    onChange={e => setTargetForm({ ...targetForm, timeframe: e.target.value })}
                                    className="w-full p-2 border rounded-lg text-sm"
                                >
                                    <option value="MONTH_END">Month End</option>
                                    <option value="QTR_END">Quarter End</option>
                                </select>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Target Value</label>
                                <input
                                    type="number"
                                    value={targetForm.value}
                                    onChange={e => setTargetForm({ ...targetForm, value: Number(e.target.value) })}
                                    className="w-full p-2 border rounded-lg text-sm"
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Target Date</label>
                                <input
                                    type="date"
                                    value={targetForm.date}
                                    onChange={e => setTargetForm({ ...targetForm, date: e.target.value })}
                                    className="w-full p-2 border rounded-lg text-sm"
                                />
                            </div>
                            <div className="col-span-1">
                                <button
                                    onClick={saveTarget}
                                    disabled={savingTarget}
                                    className="w-full flex items-center justify-center p-2 bg-gray-900 text-white rounded-lg hover:bg-black disabled:opacity-50"
                                >
                                    {savingTarget ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end mt-6 pt-4 border-t">
                        <button onClick={fetchComparison} className="bg-[var(--color-brand-primary)] text-white px-8 py-2 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all">
                            Refresh Report with Applied Dates
                        </button>
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-center text-red-700">
                    <AlertCircle className="w-5 h-5 mr-3" />
                    <p>Error: {error}</p>
                </div>
            )}

            {data && (
                <div className="bg-white border-2 border-gray-900 p-6 print:border-0 print:p-0" style={{ fontFamily: 'monospace' }}>
                    <div className="text-center mb-6 border-b-2 border-gray-900 pb-2">
                        <h2 className="text-xl font-bold tracking-widest uppercase">Business Snapshot MIS (Consolidated Actuals)</h2>
                    </div>


                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-[8px]" style={{ borderCollapse: 'collapse', border: '2px solid #000', tableLayout: 'fixed' }}>
                            <colgroup>
                                <col style={{ width: '12%' }} />
                                {/* 5 Actuals */}
                                <col style={{ width: '6.5%' }} />
                                <col style={{ width: '6.5%' }} />
                                <col style={{ width: '6.5%' }} />
                                <col style={{ width: '6.5%' }} />
                                <col style={{ width: '6.5%' }} />
                                {/* 4 Growths */}
                                <col style={{ width: '8%' }} />
                                <col style={{ width: '8%' }} />
                                <col style={{ width: '8%' }} />
                                <col style={{ width: '8%' }} />
                                {/* Budget Section */}
                                <col style={{ width: '6.5%' }} />
                                <col style={{ width: '6%' }} />
                                <col style={{ width: '6.5%' }} />
                                <col style={{ width: '6.5%' }} />
                                <col style={{ width: '6%' }} />
                            </colgroup>
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-black p-1 text-left" rowSpan={2}>PARAMETER</th>
                                    <th className="border border-black p-1 text-center" colSpan={5}>ACTUAL VALUES ON SPECIFIC DATES</th>
                                    <th className="border border-black p-1 text-center" colSpan={4}>GROWTH (ABS / %)</th>
                                    <th className="border border-black p-1 text-center" colSpan={3}>MONTH BUDGET</th>
                                    <th className="border border-black p-1 text-center" colSpan={2}>QUARTER BUDGET</th>
                                </tr>
                                <tr className="bg-gray-50">
                                    <th className="border border-black p-1 text-right">{formatDate(config.fyStart)}</th>
                                    <th className="border border-black p-1 text-right">{formatDate(config.fyEnd)}</th>
                                    <th className="border border-black p-1 text-right">{formatDate(config.monthEnd)}</th>
                                    <th className="border border-black p-1 text-right">{formatDate(config.tMinus1)}</th>
                                    <th className="border border-black p-1 text-right">{formatDate(config.t)}</th>

                                    <th className="border border-black p-1 text-center">Prev FY</th>
                                    <th className="border border-black p-1 text-center">Curr FY</th>
                                    <th className="border border-black p-1 text-center">Month</th>
                                    <th className="border border-black p-1 text-center">1D</th>

                                    <th className="border border-black p-1 text-right">Budget</th>
                                    <th className="border border-black p-1 text-right">Gap</th>
                                    <th className="border border-black p-1 text-center">Status</th>

                                    <th className="border border-black p-1 text-right">Budget</th>
                                    <th className="border border-black p-1 text-right">Gap</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    getRowData('TOTAL DEPOSITS', 'DEPOSITS', ['deposits', 'total']),
                                    getRowData('-- Savings Bank', 'SAVINGS', ['deposits', 'savings']),
                                    getRowData('-- Current Deposits', 'CURRENT', ['deposits', 'current']),
                                    getRowData('-- Term Deposits', 'TERM_DEPOSITS', ['deposits', 'term']),
                                    getRowData('   -- Retail TD', 'RETAIL_TD', ['deposits', 'retail']),
                                    getRowData('   -- Bulk TD', 'BULK_TD', ['deposits', 'bulk']),
                                    getRowData('TOTAL ADVANCES', 'ADVANCES', ['advances', 'total']),
                                    getRowData('-- Core Retail', 'RETAIL_ADV', ['advances', 'retail']),
                                    getRowData('-- Core Agri', 'AGRI_ADV', ['advances', 'agri']),
                                    getRowData('-- Core MSME', 'MSME_ADV', ['advances', 'msme']),
                                    getRowData('-- Corporate', 'CORP_ADV', ['advances', 'corporate']),
                                    getRowData('-- Jewel', 'JEWEL_ADV', ['advances', 'jewel']),
                                    getRowData('TOTAL BUSINESS MIX', 'BUSINESS', ['metadata', 'totalBusinessMix']),
                                    getRowData('CASA RATIO (%)', 'CASA', ['deposits', 'casaRatio']),
                                    getRowData('CD RATIO (%)', 'CD_RATIO', ['metadata', 'cdRatio']),
                                    getRowData('NET PROFIT', 'PROFIT', ['performance', 'netProfit']),
                                    getRowData('END LEVEL NPA', 'NPA', ['assetQuality', 'endLevelNpa']),
                                ].map((row: any, idx) => {
                                    if (!row) return null;
                                    const rowLabel: string = row.label;
                                    const isHeader = !rowLabel.trim().startsWith('--');
                                    const isSub = rowLabel.startsWith('   ');

                                    return (
                                        <tr key={idx} className={isHeader ? 'bg-blue-50/20' : ''}>
                                            <td className={`border border-black p-1 ${isHeader ? 'font-bold' : isSub ? 'pl-8 italic' : 'pl-4'}`}>
                                                {rowLabel.trim()}
                                            </td>

                                            <td className="border border-black p-1 text-right">{formatCurr(row.fStart, row.isPercentage)}</td>
                                            <td className="border border-black p-1 text-right">{formatCurr(row.fEnd, row.isPercentage)}</td>
                                            <td className="border border-black p-1 text-right">{formatCurr(row.mEnd, row.isPercentage)}</td>
                                            <td className="border border-black p-1 text-right">{formatCurr(row.t1, row.isPercentage)}</td>
                                            <td className="border border-black p-1 text-right font-bold">{formatCurr(row.t, row.isPercentage)}</td>

                                            {[row.growthPrevFY, row.growthCurrFY, row.growthM, row.growth1D].map((g, i) => (
                                                <td key={i} className="border border-black p-1 text-center whitespace-nowrap">
                                                    <div className="font-bold">{formatCurr(g.abs, row.isPercentage)}</div>
                                                    <div className={`text-[7px] ${Number(g.pct) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                                        {Number(g.pct) > 0 ? '+' : ''}{g.pct}%
                                                    </div>
                                                </td>
                                            ))}

                                            <td className="border border-black p-1 text-right bg-yellow-50/10">{formatCurr(row.budgetM, row.isPercentage)}</td>
                                            <td className={`border border-black p-1 text-right font-bold ${row.gapM >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                                {formatCurr(row.gapM, row.isPercentage)}
                                            </td>
                                            <td className="border border-black p-1 text-center font-bold text-[6px]">
                                                <span className={`px-1 py-0.5 rounded ${row.statusM === 'Surplus' ? 'bg-green-100 text-green-800' :
                                                    row.statusM === 'Deficit' ? 'bg-red-100 text-red-800' :
                                                        'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {row.statusM}
                                                </span>
                                            </td>

                                            <td className="border border-black p-1 text-right bg-blue-50/10">{formatCurr(row.budgetQ, row.isPercentage)}</td>
                                            <td className={`border border-black p-1 text-right font-bold ${row.gapQ >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                                {formatCurr(row.gapQ, row.isPercentage)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-8 text-[7px] text-gray-500 uppercase italic leading-tight">
                        <p>Certified Snapshot Aggregation. All figures in Crores.</p>
                        <p>Growth: 1D (T vs T-1), Month (T vs Prev Month End), FY (T vs Prev FY End).</p>
                        <p>Data Source: Latest Completed batches for each reporting period.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
