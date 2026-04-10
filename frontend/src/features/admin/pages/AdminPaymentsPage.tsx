import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Download,
  Eye,
  DollarSign,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  TrendingUp,
  ArrowDownCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Loader2
} from 'lucide-react';
import { GlassCard, StatCard } from '../../vendor/components/GlassCard';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface PaymentTransaction {
  id: string;
  transactionId: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  paymentMethod: string;
  createdAt: string;
}

interface PaymentStats {
  totalRevenue: number;
  pendingPayouts: number;
  completedTransactions: number;
  refundedAmount: number;
  revenueChange: number;
  payoutsChange: number;
  completedChange: number;
  refundsChange: number;
}

export const AdminPaymentsPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const [stats, setStats] = useState<PaymentStats>({
    totalRevenue: 0,
    pendingPayouts: 0,
    completedTransactions: 0,
    refundedAmount: 0,
    revenueChange: 0,
    payoutsChange: 0,
    completedChange: 0,
    refundsChange: 0
  });

  const fetchPayments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.getAdminPayments({
        status: statusFilter,
        page,
        limit: 15
      });

      setTransactions(response.data || []);
      setTotal(response.total || 0);

      if (response.stats) {
        setStats({
          totalRevenue: response.stats.totalRevenue || 0,
          pendingPayouts: response.stats.pendingPayouts || 0,
          completedTransactions: response.stats.completedTransactions || 0,
          refundedAmount: response.stats.refundedAmount || 0,
          revenueChange: 0,
          payoutsChange: 0,
          completedChange: 0,
          refundsChange: 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      toast.error(t('admin.analytics.failedToLoad'));
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const statusOptions = ['all', 'completed', 'pending', 'failed', 'refunded'];
  const limit = 15;
  const totalPages = Math.ceil(total / limit) || 1;

  // Client-side search filtering (API handles status filtering)
  const filteredTransactions = transactions.filter((transaction) => {
    if (!searchQuery) return true;
    const matchesSearch =
      transaction.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getStatusBadge = (status: PaymentTransaction['status']) => {
    const statusStyles = {
      completed: 'bg-green-100 text-green-700 border-green-200',
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      failed: 'bg-red-100 text-red-700 border-red-200',
      refunded: 'bg-indigo-100 text-indigo-700 border-indigo-200'
    };

    const statusIcons = {
      completed: <CheckCircle className="w-3.5 h-3.5" />,
      pending: <Clock className="w-3.5 h-3.5" />,
      failed: <XCircle className="w-3.5 h-3.5" />,
      refunded: <RefreshCw className="w-3.5 h-3.5" />
    };

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusStyles[status]}`}
      >
        {statusIcons[status]}
        <span className="capitalize">{status}</span>
      </span>
    );
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
      className="min-h-screen bg-gray-50 p-6 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('admin.payments.title')}</h1>
            <p className="text-gray-500 mt-1 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{t('admin.payments.subtitle')}</span>
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-xl transition-all flex items-center space-x-2 shadow-sm">
              <Download className="w-4 h-4" />
              <span>{t('admin.common.export')}</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={itemVariants}
      >
        <StatCard
          title={t('admin.payments.totalRevenue')}
          value={formatCurrency(stats.totalRevenue)}
          change={stats.revenueChange}
          icon={<DollarSign />}
          color="from-indigo-500 to-indigo-600"
          subtitle={t('admin.payments.allTimeEarnings')}
        />
        <StatCard
          title={t('admin.payments.pendingPayouts')}
          value={formatCurrency(stats.pendingPayouts)}
          change={stats.payoutsChange}
          icon={<Clock />}
          color="from-amber-500 to-orange-500"
          subtitle={t('admin.payments.awaitingProcessing')}
        />
        <StatCard
          title={t('admin.payments.completed')}
          value={stats.completedTransactions.toLocaleString()}
          change={stats.completedChange}
          icon={<TrendingUp />}
          color="from-emerald-500 to-green-600"
          subtitle={t('admin.payments.successfulTransactions')}
        />
        <StatCard
          title={t('admin.payments.refunds')}
          value={formatCurrency(stats.refundedAmount)}
          change={stats.refundsChange}
          icon={<ArrowDownCircle />}
          color="from-rose-500 to-red-600"
          subtitle={t('admin.payments.totalRefunded')}
        />
      </motion.div>

      {/* Search & Filters */}
      <motion.div variants={itemVariants}>
        <GlassCard hover={false}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('admin.payments.searchPayments')}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="flex items-center space-x-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="pl-9 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Loading State */}
      {isLoading && (
        <motion.div variants={itemVariants}>
          <GlassCard hover={false}>
            <div className="flex flex-col items-center justify-center p-12 space-y-3">
              <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
              <p className="text-gray-500 font-medium">{t('admin.common.loading')}</p>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Empty State */}
      {!isLoading && filteredTransactions.length === 0 && (
        <motion.div variants={itemVariants}>
          <GlassCard hover={false}>
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <CreditCard className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('admin.payments.noPayments')}</h3>
              <p className="text-gray-500 max-w-sm">
                {searchQuery || statusFilter !== 'all'
                  ? t('admin.payments.noPaymentsMatch')
                  : t('admin.payments.paymentsWillAppear')}
              </p>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Transactions Table */}
      {!isLoading && filteredTransactions.length > 0 && (
        <motion.div variants={itemVariants}>
          <GlassCard hover={false} className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left p-4 text-sm text-gray-600 font-semibold">
                      {t('admin.payments.transactionId')}
                    </th>
                    <th className="text-left p-4 text-sm text-gray-600 font-semibold">{t('admin.orders.orderId')}</th>
                    <th className="text-left p-4 text-sm text-gray-600 font-semibold">{t('admin.orders.customer')}</th>
                    <th className="text-left p-4 text-sm text-gray-600 font-semibold">{t('admin.payments.amount')}</th>
                    <th className="text-left p-4 text-sm text-gray-600 font-semibold">{t('admin.payments.status')}</th>
                    <th className="text-left p-4 text-sm text-gray-600 font-semibold">{t('admin.payments.date')}</th>
                    <th className="text-left p-4 text-sm text-gray-600 font-semibold">
                      {t('admin.payments.paymentMethod')}
                    </th>
                    <th className="text-left p-4 text-sm text-gray-600 font-semibold">{t('admin.common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction, index) => (
                    <motion.tr
                      key={transaction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-all"
                    >
                      <td className="p-4">
                        <span className="font-mono text-sm text-gray-900">
                          {transaction.transactionId}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-indigo-600 font-medium hover:text-indigo-700 cursor-pointer">
                          {transaction.orderNumber}
                        </span>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-gray-900">{transaction.customerName}</p>
                          <p className="text-sm text-gray-500">{transaction.customerEmail}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(transaction.amount, transaction.currency)}
                        </span>
                      </td>
                      <td className="p-4">{getStatusBadge(transaction.status)}</td>
                      <td className="p-4">
                        <span className="text-sm text-gray-600">
                          {formatDate(transaction.createdAt)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{transaction.paymentMethod}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <button
                          className="p-2 bg-gray-100 hover:bg-indigo-100 text-gray-600 hover:text-indigo-600 rounded-lg transition-all"
                          title={t('admin.payments.viewDetails')}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
                <p className="text-sm text-gray-600">
                  {t('admin.common.showing')} {(page - 1) * limit + 1} - {Math.min(page * limit, filteredTransactions.length)} {t('admin.common.of')} {filteredTransactions.length}
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="p-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <span className="px-3 py-1 text-sm text-gray-700">
                    {t('admin.common.page')} {page} {t('admin.common.of')} {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="p-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            )}
          </GlassCard>
        </motion.div>
      )}
    </motion.div>
  );
};
