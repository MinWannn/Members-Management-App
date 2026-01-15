import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../services/api';

const AVAILABLE_COLUMNS = [
    { key: 'full_name', label: 'Full Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'address', label: 'Address' },
    { key: 'member_type', label: 'Member Type' },
    { key: 'status', label: 'Status' },
    { key: 'created_at', label: 'Joined Date' },
    { key: 'fathers_name', label: 'Father\'s Name' },
    { key: 'id_number', label: 'ID Number' }
];

const ExportPDF = () => {
    const [loading, setLoading] = useState(false);
    const [exportType, setExportType] = useState('all_members');
    const [filters, setFilters] = useState({
        memberType: '',
        status: ''
    });

    const [selectedColumns, setSelectedColumns] = useState(() => {
        const saved = localStorage.getItem('export_columns');
        return saved ? JSON.parse(saved) : {
            full_name: true,
            email: true,
            member_type: true,
            status: true,
            phone: false,
            address: false,
            created_at: false,
            fathers_name: false,
            id_number: false
        };
    });

    const handleColumnToggle = (key) => {
        setSelectedColumns(prev => {
            const next = { ...prev, [key]: !prev[key] };
            localStorage.setItem('export_columns', JSON.stringify(next));
            return next;
        });
    };


    const handleExport = async () => {
        try {
            setLoading(true);

            // Prepare columns argument
            const columnsArg = AVAILABLE_COLUMNS
                .filter(col => selectedColumns[col.key])
                .map(col => ({ key: col.key, label: col.label }));

            if (columnsArg.length === 0) {
                alert('Please select at least one column.');
                setLoading(false);
                return;
            }

            const response = await api.get('/export/members-pdf', {
                params: {
                    exportType,
                    ...filters,
                    columns: JSON.stringify(columnsArg)
                },
                responseType: 'blob'
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `members-export-${new Date().toISOString().split('T')[0]}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export PDF');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="p-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Export PDF</h1>
                    <p className="text-gray-600 mt-1">Generate PDF reports for members and statistics</p>
                </div>

                <div className="max-w-4xl grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Options */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Export Options */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Export Options</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Export Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Export Type
                                    </label>
                                    <select
                                        value={exportType}
                                        onChange={(e) => setExportType(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="all_members">All Members</option>
                                        <option value="active_members">Active Members Only</option>
                                        <option value="expiring_members">Expiring Members</option>
                                        <option value="expired_members">Expired Members</option>
                                        <option value="statistics">Statistics Report</option>
                                    </select>
                                </div>

                                {/* Member Type Filter */}
                                {exportType !== 'statistics' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Member Type
                                        </label>
                                        <select
                                            value={filters.memberType}
                                            onChange={(e) => setFilters({ ...filters, memberType: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">All Types</option>
                                            <option value="Τακτικό">Τακτικό</option>
                                            <option value="Υποστηρικτής">Υποστηρικτής</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Column Selection */}
                        {exportType !== 'statistics' && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Columns</h2>
                                <p className="text-sm text-gray-500 mb-4">Choose which information to include in the report</p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                    {AVAILABLE_COLUMNS.map((col) => (
                                        <label key={col.key} className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-gray-50 border border-transparent hover:border-gray-200">
                                            <input
                                                type="checkbox"
                                                checked={!!selectedColumns[col.key]}
                                                onChange={() => handleColumnToggle(col.key)}
                                                className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                                            />
                                            <span className="text-sm text-gray-700">{col.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Preview & Action */}
                    <div className="space-y-6">
                        {/* Preview Info */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div className="flex-1">
                                    <h3 className="text-sm font-medium text-blue-900 mb-1">Export Summary</h3>
                                    <p className="text-sm text-blue-700 mb-2">
                                        Generating report for <strong>{exportType.replace('_', ' ')}</strong>
                                        {filters.memberType && ` (${filters.memberType})`}.
                                    </p>
                                    {exportType !== 'statistics' && (
                                        <div className="text-xs text-blue-600 mt-2">
                                            <strong>Columns:</strong> {
                                                Object.keys(selectedColumns)
                                                    .filter(k => selectedColumns[k])
                                                    .length
                                            } selected
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Export Button */}
                        <button
                            onClick={handleExport}
                            disabled={loading}
                            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-sm font-medium"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Generating...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span>Export PDF</span>
                                </>
                            )}
                        </button>

                        {/* Recent Exports Placeholder */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <h3 className="text-sm font-medium text-gray-900 mb-2">Recent Exports</h3>
                            <p className="text-sm text-gray-500 text-center py-2 italic">
                                No recent exports
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ExportPDF;
