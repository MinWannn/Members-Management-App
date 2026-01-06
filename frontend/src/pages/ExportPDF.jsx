import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../services/api';

const ExportPDF = () => {
    const [loading, setLoading] = useState(false);
    const [exportType, setExportType] = useState('all_members');
    const [filters, setFilters] = useState({
        memberType: '',
        status: ''
    });

    const handleExport = async () => {
        try {
            setLoading(true);
            const response = await api.get('/export/members-pdf', {
                params: { exportType, ...filters },
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

                <div className="max-w-2xl">
                    {/* Export Options */}
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Export Options</h2>

                        <div className="space-y-4">
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

                    {/* Preview Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start space-x-3">
                            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="flex-1">
                                <h3 className="text-sm font-medium text-blue-900 mb-1">Export Information</h3>
                                <p className="text-sm text-blue-700">
                                    The PDF will include member details, contact information, and membership status.
                                    {exportType === 'statistics' && ' Statistics report includes charts and distribution data.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Export Button */}
                    <button
                        onClick={handleExport}
                        disabled={loading}
                        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Generating PDF...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span>Export to PDF</span>
                            </>
                        )}
                    </button>

                    {/* Recent Exports */}
                    <div className="mt-8">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Exports</h2>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <p className="text-sm text-gray-500 text-center py-4">
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
