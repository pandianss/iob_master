import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertCircle, Clock, RefreshCw, Trash2, Eye, X } from 'lucide-react';

const INGESTION_TYPES = [
    { value: 'KEY_BUSINESS_PARAM', label: 'Key Business Parameters' },
    { value: 'BULK_DEPOSIT', label: 'Bulk Deposit' },
    { value: 'CORE_AGRI', label: 'Core Agri' },
    { value: 'ADVANCES_VERTICAL', label: 'Advances Vertical Data' },
    { value: 'CASH_MANAGEMENT', label: 'Cash Management' },
    { value: 'ACCOUNT_OPENING', label: 'Account Opening' },
    { value: 'ACCOUNTS_CLOSED', label: 'Accounts Closed' },
    { value: 'PROFIT_LOSS', label: 'Profit and Loss' },
    { value: 'RECOVERY_FLASH', label: 'Recovery Flash' },
    { value: 'DEBIT_CARD_ISSUANCE', label: 'Debit Card Issuance' },
    { value: 'INTERNET_BANKING', label: 'Internet Banking' },
    { value: 'MOBILE_BANKING', label: 'Mobile Banking' },
    { value: 'BHIM_UPI', label: 'BHIM IOB UPI' },
    { value: 'IOBPAY', label: 'IOBPAY' },
    { value: 'POS', label: 'POS' },
    { value: 'UPI_QR', label: 'UPI QR' },
    { value: 'FASTAG', label: 'Fastag' },
    { value: 'CREDIT_CARD', label: 'Credit Card' },
    { value: 'ATM_PERFORMANCE', label: 'ATM & Passbook Performance' },
    { value: 'DCOE_PERFORMANCE', label: 'DCOE Performance' }
];

export const IngestionPage = () => {
    const [selectedType, setSelectedType] = useState(INGESTION_TYPES[0].value);
    const [snapshotDate, setSnapshotDate] = useState(new Date().toISOString().split('T')[0]);
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [history, setHistory] = useState<any[]>([]);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await fetch('/api/ingestion/history');
            const data = await res.json();
            setHistory(data);
        } catch (err) {
            console.error('Failed to fetch history', err);
        }
    };


    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', selectedType);
        formData.append('userId', 'USER_UI'); // TODO: Get from context
        formData.append('snapshotDate', snapshotDate);

        try {
            const res = await fetch('/api/ingestion/upload', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Upload failed');
            }

            const result = await res.json();
            setMessage({ type: 'success', text: `Successfully ingested ${result.rowCount} rows!` });
            setFile(null);
            fetchHistory(); // Refresh history
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this batch? This cannot be undone.')) return;

        try {
            const res = await fetch(`/api/ingestion/batch/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Delete failed');
            fetchHistory();
        } catch (err) {
            console.error(err);
            alert('Failed to delete batch');
        }
    };

    const [previewBatch, setPreviewBatch] = useState<any>(null);
    const [loadingPreview, setLoadingPreview] = useState(false);

    const handleView = async (id: string) => {
        setLoadingPreview(true);
        try {
            const res = await fetch(`/api/ingestion/batch/${id}`);
            const data = await res.json();
            setPreviewBatch(data);
        } catch (err) {
            console.error(err);
            alert('Failed to load preview');
        } finally {
            setLoadingPreview(false);
        }
    };

    return (
        <div className="space-y-6">
            {loadingPreview && (
                <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-[60]">
                    <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
            )}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Data Ingestion</h1>
                    <p className="text-gray-500">Upload business snapshot data files for processing</p>
                </div>
                <button onClick={fetchHistory} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>

            {/* Upload Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Data Category</label>
                        <select
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                        >
                            {INGESTION_TYPES.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                        <p className="mt-2 text-sm text-gray-500">
                            Select the specific business parameter file you are uploading.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Snapshot Date</label>
                        <input
                            type="date"
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={snapshotDate}
                            onChange={(e) => setSnapshotDate(e.target.value)}
                        />
                        <p className="mt-2 text-sm text-gray-500">
                            The business date this data belongs to.
                        </p>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">CSV File</label>
                        <div className="flex flex-col items-center justify-center w-full">
                            {!file ? (
                                <label
                                    htmlFor="file-upload"
                                    className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'
                                        }`}
                                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                    onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        setIsDragging(false);
                                        if (e.dataTransfer.files?.[0]) {
                                            setFile(e.dataTransfer.files[0]);
                                            setMessage(null);
                                        }
                                    }}
                                >
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <div className={`p-3 rounded-full mb-3 ${isDragging ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                            <UploadCloud className={`w-8 h-8 ${isDragging ? 'text-blue-600' : 'text-gray-400'}`} />
                                        </div>
                                        <p className="mb-2 text-sm text-gray-600"><span className="font-semibold text-blue-600">Click to upload</span> or drag and drop</p>
                                        <p className="text-xs text-gray-400 font-medium">CSV (Max. 10MB)</p>
                                    </div>
                                    <input
                                        id="file-upload"
                                        type="file"
                                        className="hidden"
                                        accept=".csv"
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) {
                                                setFile(e.target.files[0]);
                                                setMessage(null);
                                            }
                                            // Reset value to allow re-selection of same file
                                            e.target.value = '';
                                        }}
                                    />
                                </label>
                            ) : (
                                <div className="w-full p-4 border-2 border-green-100 bg-green-50 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <FileText className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 truncate max-w-md">{file.name}</p>
                                            <p className="text-xs text-green-600 font-medium">{(file.size / 1024).toFixed(1)} KB • Ready to upload</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setFile(null)}
                                        className="p-2 hover:bg-green-200 rounded-full transition-colors"
                                        title="Remove file"
                                    >
                                        <X className="w-5 h-5 text-green-700" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        className={`px-6 py-2 rounded-lg text-white font-medium transition-colors ${!file || uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {uploading ? 'Uploading...' : 'Upload Data'}
                    </button>
                </div>

                {message && (
                    <div className={`mt-4 p-4 rounded-lg flex items-center ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        }`}>
                        {message.type === 'success' ? <CheckCircle className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}
                        {message.text}
                    </div>
                )}
            </div>

            {/* History Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="font-semibold text-gray-700">Upload History</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Snapshot Date</th>
                                <th className="px-6 py-3">File Type</th>
                                <th className="px-6 py-3">File Name</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Records</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        No upload history found.
                                    </td>
                                </tr>
                            ) : (
                                history.map((item) => (
                                    <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {new Date(item.uploadedAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-blue-600 font-medium">
                                            {item.snapshotDate ? new Date(item.snapshotDate).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-semibold">
                                                {item.fileType.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{item.fileName}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                {item.status === 'COMPLETED' && <CheckCircle className="w-4 h-4 text-green-500 mr-2" />}
                                                {item.status === 'FAILED' && <AlertCircle className="w-4 h-4 text-red-500 mr-2" />}
                                                {item.status === 'PROCESSING' && <RefreshCw className="w-4 h-4 text-blue-500 mr-2 animate-spin" />}
                                                {item.status === 'PENDING' && <Clock className="w-4 h-4 text-gray-400 mr-2" />}
                                                <span className={`font-medium ${item.status === 'COMPLETED' ? 'text-green-700' :
                                                    item.status === 'FAILED' ? 'text-red-700' : 'text-gray-700'
                                                    }`}>
                                                    {item.status}
                                                </span>
                                            </div>
                                            {item.errorLog && (
                                                <div className="text-xs text-red-500 mt-1 max-w-xs truncate">
                                                    {item.errorLog.message}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono">
                                            {item.rowCount}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => handleView(item.id)}
                                                    className="p-1 hover:bg-blue-50 text-blue-600 rounded"
                                                    title="Preview Data"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => handleDelete(item.id, e)}
                                                    className="p-1 hover:bg-red-50 text-red-600 rounded"
                                                    title="Delete Batch"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Preview Modal */}
            {previewBatch && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[80vh] flex flex-col">
                        <div className="p-6 border-b flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">Batch Preview</h3>
                                <p className="text-sm text-gray-500">
                                    {previewBatch.fileName} • {new Date(previewBatch.snapshotDate).toLocaleDateString()}
                                </p>
                            </div>
                            <button onClick={() => setPreviewBatch(null)} className="p-1 hover:bg-gray-100 rounded">
                                <X className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6 overflow-auto flex-1">
                            {previewBatch.records && previewBatch.records.length > 0 ? (
                                <table className="w-full text-sm text-left border rounded-lg">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                                        <tr>
                                            {Object.keys(previewBatch.records[0].data).map((header, idx) => {
                                                const val = previewBatch.records[0].data[header];
                                                let type = typeof val === 'number' ? 'Number' : 'String';

                                                // Check if value is an ISO date string
                                                if (type === 'String' && typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(val)) {
                                                    type = 'Date';
                                                }

                                                // Detect Lakhs/Crores from header name
                                                const lowerHeader = header.toLowerCase();
                                                if (lowerHeader.includes('lakh') || lowerHeader === 'p & l') {
                                                    type = 'Lakhs';
                                                } else if (lowerHeader.includes('crore')) {
                                                    type = 'Crores';
                                                }

                                                return (
                                                    <th key={idx} className="px-4 py-2 border-b whitespace-nowrap">
                                                        <div className="flex flex-col">
                                                            <span>{header}</span>
                                                            <span className="text-[10px] font-normal text-gray-400 normal-case">({type})</span>
                                                        </div>
                                                    </th>
                                                );
                                            })}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {previewBatch.records.map((record: any) => (
                                            <tr key={record.id} className="border-b hover:bg-gray-50">
                                                {Object.values(record.data).map((val: any, idx) => (
                                                    <td key={idx} className="px-4 py-2 border-b whitespace-nowrap">{String(val)}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    No records found in this batch.
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t bg-gray-50 text-right">
                            <button
                                onClick={() => setPreviewBatch(null)}
                                className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 text-gray-700 font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
