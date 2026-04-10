import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  FileBarChart,
  Download,
  Calendar,
  Users,
  Store,
  Package,
  DollarSign,
  RefreshCw,
  Clock,
  CheckCircle
} from 'lucide-react';
import { GlassCard } from '../../vendor/components/GlassCard';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface ReportSummary {
  [key: string]: string | number;
}

interface ReportData {
  summary: ReportSummary;
  data: any[];
  generatedAt: string;
}

interface Report {
  id: 'sales' | 'users' | 'shops' | 'products';
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  lastGenerated: string | null;
  status: 'ready' | 'generating' | 'never';
  reportData?: ReportData;
}

export const AdminReportsPage: React.FC = () => {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [generatingReportId, setGeneratingReportId] = useState<string | null>(null);

  const [reports, setReports] = useState<Report[]>([
    {
      id: 'sales',
      title: t('admin.reports.salesReport'),
      description: t('admin.reports.salesDescription'),
      icon: <DollarSign className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-600',
      lastGenerated: null,
      status: 'never'
    },
    {
      id: 'users',
      title: t('admin.reports.userReport'),
      description: t('admin.reports.usersDescription'),
      icon: <Users className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-600',
      lastGenerated: null,
      status: 'never'
    },
    {
      id: 'shops',
      title: t('admin.reports.shopReport'),
      description: t('admin.reports.shopsDescription'),
      icon: <Store className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-600',
      lastGenerated: null,
      status: 'never'
    },
    {
      id: 'products',
      title: t('admin.reports.productReport'),
      description: t('admin.reports.productsDescription'),
      icon: <Package className="w-6 h-6" />,
      color: 'from-orange-500 to-red-600',
      lastGenerated: null,
      status: 'never'
    }
  ]);

  const handleGenerateReport = async (reportId: 'sales' | 'users' | 'shops' | 'products') => {
    setGeneratingReportId(reportId);

    // Update report status to generating
    setReports(prev => prev.map(r =>
      r.id === reportId ? { ...r, status: 'generating' as const } : r
    ));

    toast.info(t('admin.reports.generatingReport'), { duration: 2000 });

    try {
      const params = {
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined
      };

      let reportData: ReportData;

      switch (reportId) {
        case 'sales':
          reportData = await api.getAdminSalesReport(params);
          break;
        case 'users':
          reportData = await api.getAdminUsersReport(params);
          break;
        case 'shops':
          reportData = await api.getAdminShopsReport(params);
          break;
        case 'products':
          reportData = await api.getAdminProductsReport(params);
          break;
        default:
          throw new Error('Unknown report type');
      }

      // Update report with data
      setReports(prev => prev.map(r =>
        r.id === reportId
          ? {
              ...r,
              status: 'ready' as const,
              lastGenerated: new Date().toLocaleString(),
              reportData
            }
          : r
      ));

      toast.success(t('admin.reports.reportGenerated'));
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast.error(t('admin.reports.reportFailed'));

      // Reset status on error
      setReports(prev => prev.map(r =>
        r.id === reportId ? { ...r, status: 'never' as const } : r
      ));
    } finally {
      setGeneratingReportId(null);
    }
  };

  const getDefaultHeaders = (reportType: string): string[] => {
    switch (reportType) {
      case 'sales':
        return ['orderId', 'date', 'customer', 'total', 'status', 'paymentMethod'];
      case 'users':
        return ['userId', 'email', 'name', 'role', 'status', 'createdAt'];
      case 'shops':
        return ['shopId', 'name', 'owner', 'status', 'products', 'createdAt'];
      case 'products':
        return ['productId', 'name', 'shop', 'price', 'stock', 'category', 'status'];
      default:
        return ['id', 'name', 'value', 'date'];
    }
  };

  const convertToCSV = (data: any[], reportType: string): string => {
    // If no data, return just headers for empty report
    if (!data || data.length === 0) {
      const defaultHeaders = getDefaultHeaders(reportType);
      return defaultHeaders.join(',');
    }

    // Get headers from first item
    const headers = Object.keys(data[0]);

    // Create CSV content
    const csvRows = [
      headers.join(','), // Header row
      ...data.map(row =>
        headers.map(header => {
          const value = row[header];
          // Handle values that might contain commas or quotes
          if (value === null || value === undefined) {
            return '';
          }
          const stringValue = String(value);
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        }).join(',')
      )
    ];

    return csvRows.join('\n');
  };

  const handleDownloadReport = (reportId: 'sales' | 'users' | 'shops' | 'products') => {
    const report = reports.find(r => r.id === reportId);

    if (!report || !report.reportData) {
      toast.error(t('admin.reports.noReportData'));
      return;
    }

    try {
      // Convert data to CSV (handles empty data gracefully)
      const data = report.reportData.data || [];
      const csvContent = convertToCSV(data, reportId);

      // Add summary as header comments
      const summary = report.reportData.summary || {};
      const summaryLines = Object.entries(summary)
        .map(([key, value]) => `# ${key}: ${value}`)
        .join('\n');

      const generatedAt = report.reportData.generatedAt || new Date().toISOString();
      const dataCount = data.length;
      const fullContent = `# ${report.title}\n# Generated: ${generatedAt}\n# Total Records: ${dataCount}\n${summaryLines}\n\n${csvContent}`;

      // Create blob and download
      const blob = new Blob([fullContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];

      link.href = url;
      link.download = `${reportId}-report-${timestamp}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(t('admin.reports.downloadSuccess'));
    } catch (error) {
      console.error('Failed to download report:', error);
      toast.error(t('admin.reports.downloadFailed'));
    }
  };

  const handlePresetDateRange = (preset: string) => {
    const today = new Date();
    let startDate = new Date();

    switch (preset) {
      case '7d':
        startDate.setDate(today.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(today.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(today.getDate() - 90);
        break;
      case 'custom':
        // Keep existing values for custom
        return;
    }

    setDateRange({
      startDate: startDate.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              {t('admin.reports.title')}
            </h1>
            <p className="text-gray-500 mt-2 flex items-center space-x-2">
              <FileBarChart className="w-4 h-4" />
              <span>{t('admin.reports.subtitle')}</span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Date Range Selector */}
      <motion.div variants={itemVariants}>
        <GlassCard hover={false}>
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700 font-medium">{t('admin.analytics.dateRange')}</span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <label htmlFor="startDate" className="text-sm text-gray-500">{t('admin.reports.from')}:</label>
                <input
                  type="date"
                  id="startDate"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300"
                />
              </div>

              <div className="flex items-center space-x-2">
                <label htmlFor="endDate" className="text-sm text-gray-500">{t('admin.reports.to')}:</label>
                <input
                  type="date"
                  id="endDate"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 ml-auto">
              <select
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                onChange={(e) => handlePresetDateRange(e.target.value)}
              >
                <option value="custom">{t('admin.reports.customRange')}</option>
                <option value="7d">{t('admin.reports.last7Days')}</option>
                <option value="30d">{t('admin.reports.last30Days')}</option>
                <option value="90d">{t('admin.reports.last90Days')}</option>
              </select>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Report Cards Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        variants={itemVariants}
      >
        {reports.map((report) => (
          <motion.div
            key={report.id}
            whileHover={{ scale: 1.01, y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <GlassCard hover={false} className="h-full">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${report.color} shadow-md`}>
                    <div className="text-white">
                      {report.icon}
                    </div>
                  </div>

                  {report.status === 'ready' && (
                    <span className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">
                      <CheckCircle className="w-3 h-3" />
                      <span>{t('admin.common.active')}</span>
                    </span>
                  )}
                  {(report.status === 'generating' || generatingReportId === report.id) && (
                    <span className="flex items-center space-x-1 px-2 py-1 bg-indigo-100 text-indigo-600 rounded-full text-xs font-medium">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>{t('admin.common.loading')}</span>
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {report.title}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">
                    {report.description}
                  </p>

                  {/* Summary Stats (when report is ready) */}
                  {report.status === 'ready' && report.reportData?.summary && (
                    <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                      {Object.entries(report.reportData.summary).slice(0, 4).map(([key, value]) => (
                        <div key={key} className="text-center">
                          <p className="text-xs text-gray-500 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {typeof value === 'number'
                              ? (key.toLowerCase().includes('revenue') || key.toLowerCase().includes('price') || key.toLowerCase().includes('value')
                                  ? `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                  : value.toLocaleString())
                              : value}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>
                        {report.lastGenerated
                          ? `${t('admin.reports.lastGenerated')}: ${report.lastGenerated}`
                          : t('admin.reports.neverGenerated')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 mt-4">
                    <button
                      onClick={() => handleGenerateReport(report.id)}
                      disabled={generatingReportId === report.id}
                      className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center space-x-2
                        ${generatingReportId === report.id
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow-md'
                        }`}
                    >
                      {generatingReportId === report.id ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>{t('admin.common.loading')}</span>
                        </>
                      ) : (
                        <>
                          <FileBarChart className="w-4 h-4" />
                          <span>{t('admin.reports.generateReport')}</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDownloadReport(report.id)}
                      disabled={report.status !== 'ready'}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center space-x-2
                        ${report.status === 'ready'
                          ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                          : 'bg-gray-50 text-gray-300 cursor-not-allowed border border-gray-100'
                        }`}
                    >
                      <Download className="w-4 h-4" />
                      <span>{t('admin.reports.downloadReport')}</span>
                    </button>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};
