import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  X,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  Mail,
  User,
  Building2,
  FileText,
  AlertCircle,
  RefreshCw,
  Download,
  ChevronLeft,
  ChevronRight,
  Store
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useDialog } from '@/hooks/useDialog';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { AlertDialog } from '@/components/ui/AlertDialog';

interface Shop {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string | null;
  banner: string | null;
  status: 'pending' | 'active' | 'rejected';
  ownerId: string;
  ownerEmail: string;
  ownerName: string;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
  businessName?: string;
  businessEmail?: string;
  businessPhone?: string;
  businessType?: string;
  isVerified?: boolean;
  totalProducts?: number;
  totalOrders?: number;
  totalSales?: number;
  rating?: number;
  businessDocuments?: {
    name: string;
    url: string;
    type: string;
  }[];
  metadata?: any;
}

type StatusFilter = 'all' | 'pending' | 'active' | 'rejected';

export const ShopApprovalsPage: React.FC = () => {
  const { t } = useTranslation();
  const dialog = useDialog();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Fetch shops from API
  const fetchShops = async () => {
    try {
      setLoading(true);
      const response = await api.getAdminShops({
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: searchQuery || undefined,
        page: currentPage,
        limit: itemsPerPage
      });

      const data = response?.data || [];
      const total = response?.total || data.length;

      setShops(Array.isArray(data) ? data : []);
      setTotalPages(Math.ceil(total / itemsPerPage));
    } catch (err: any) {
      console.error('[ShopApprovalsPage] Failed to fetch shops:', err);
      toast.error(t('admin.analytics.failedToLoad'), {
        description: err?.response?.data?.message || 'An error occurred'
      });
      setShops([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, [statusFilter, currentPage]);

  useEffect(() => {
    // Reset to page 1 when search or filter changes
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Filter shops by search query (client-side for immediate feedback)
  const filteredShops = shops.filter((shop) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      shop.name.toLowerCase().includes(query) ||
      shop.ownerEmail?.toLowerCase().includes(query) ||
      shop.ownerName?.toLowerCase().includes(query)
    );
  });

  // Handle approve shop
  const handleApproveShop = async (shopId: string) => {
    const confirmed = await dialog.showConfirm({
      title: t('admin.shops.approveShop'),
      message: t('admin.shops.approveConfirm'),
      confirmText: t('admin.shops.approve'),
      cancelText: t('admin.common.cancel'),
      variant: 'info'
    });

    if (!confirmed) return;

    try {
      setActionLoading(true);
      await api.approveShop(shopId);
      toast.success(t('admin.shops.shopApproved'));
      setShowDetailsModal(false);
      setSelectedShop(null);
      fetchShops();
    } catch (err: any) {
      toast.error(t('admin.shops.failedApprove'), {
        description: err?.response?.data?.message || 'An error occurred'
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle reject shop
  const handleRejectShop = async (shopId: string) => {
    if (!rejectionReason.trim()) {
      toast.error(t('admin.shops.rejectionRequired'), {
        description: t('admin.shops.rejectionRequiredDesc')
      });
      return;
    }

    const confirmed = await dialog.showConfirm({
      title: t('admin.shops.rejectShop'),
      message: t('admin.shops.rejectConfirm'),
      confirmText: t('admin.shops.reject'),
      cancelText: t('admin.common.cancel'),
      variant: 'danger'
    });

    if (!confirmed) return;

    try {
      setActionLoading(true);
      await api.rejectShop(shopId, rejectionReason);
      toast.success(t('admin.shops.shopRejected'));
      setShowDetailsModal(false);
      setSelectedShop(null);
      setRejectionReason('');
      fetchShops();
    } catch (err: any) {
      toast.error(t('admin.shops.failedReject'), {
        description: err?.response?.data?.message || 'An error occurred'
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Open shop details modal
  const handleViewShop = (shop: Shop) => {
    setSelectedShop(shop);
    setShowDetailsModal(true);
    setRejectionReason(shop.rejectionReason || '');
  };

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Get display label for status
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return t('admin.common.active');
      case 'rejected':
        return t('admin.shops.rejected');
      case 'pending':
        return t('admin.orders.pending');
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Loading State
  if (loading && shops.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded-xl animate-pulse" />
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="h-12 bg-gray-100 rounded-xl animate-pulse mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('admin.shops.title')}
          </h1>
          <p className="text-gray-500 mt-1">
            {t('admin.shops.subtitle')} ({filteredShops.length} shops)
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchShops}
            disabled={loading}
            className="px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all flex items-center space-x-2 border border-gray-200 text-gray-700"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{t('admin.common.refresh')}</span>
          </button>
          <button className="px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all flex items-center space-x-2 border border-gray-200 text-gray-700">
            <Download className="w-4 h-4" />
            <span>{t('admin.common.export')}</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('admin.shops.searchShops')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <div className="flex bg-gray-50 rounded-xl p-1 border border-gray-200">
              {(['all', 'pending', 'active', 'rejected'] as StatusFilter[]).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                    statusFilter === status
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {status === 'all' ? t('admin.common.all') : getStatusLabel(status)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Shops Table */}
      {filteredShops.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchQuery ? t('admin.shops.noShops') : t('admin.shops.noShops')}
          </h3>
          <p className="text-gray-500">
            {searchQuery
              ? t('admin.products.noProductsMatch')
              : t('admin.common.noData')}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30"
            >
              {t('admin.common.clearFilters')}
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left p-4 text-sm text-gray-500 font-medium">{t('admin.shops.shopName')}</th>
                    <th className="text-left p-4 text-sm text-gray-500 font-medium">{t('admin.shops.owner')}</th>
                    <th className="text-left p-4 text-sm text-gray-500 font-medium">{t('admin.shops.createdAt')}</th>
                    <th className="text-left p-4 text-sm text-gray-500 font-medium">{t('admin.shops.status')}</th>
                    <th className="text-left p-4 text-sm text-gray-500 font-medium">{t('admin.common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredShops.map((shop, index) => (
                    <motion.tr
                      key={shop.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-all"
                    >
                      {/* Shop Info */}
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            {shop.logo ? (
                              <img
                                src={shop.logo}
                                alt={shop.name}
                                className="w-12 h-12 rounded-lg object-cover ring-2 ring-gray-200"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center ring-2 ring-gray-200">
                                <Building2 className="w-6 h-6 text-indigo-600" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{shop.name}</p>
                            <p className="text-xs text-gray-500">@{shop.slug}</p>
                          </div>
                        </div>
                      </td>

                      {/* Owner Info */}
                      <td className="p-4">
                        <div>
                          <p className="text-gray-700">{shop.ownerName || 'N/A'}</p>
                          <p className="text-xs text-gray-500">{shop.ownerEmail}</p>
                        </div>
                      </td>

                      {/* Created Date */}
                      <td className="p-4 text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{formatDate(shop.createdAt)}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-medium border ${getStatusBadge(
                            shop.status
                          )}`}
                        >
                          {getStatusLabel(shop.status)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewShop(shop)}
                            className="p-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-all"
                          >
                            <Eye className="w-4 h-4 text-indigo-600" />
                          </button>
                          {shop.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApproveShop(shop.id)}
                                disabled={actionLoading}
                                className="p-2 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-all disabled:opacity-50"
                              >
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              </button>
                              <button
                                onClick={() => handleViewShop(shop)}
                                disabled={actionLoading}
                                className="p-2 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-all disabled:opacity-50"
                              >
                                <XCircle className="w-4 h-4 text-red-600" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-gray-500 text-sm">
                {t('admin.common.page')} {currentPage} {t('admin.common.of')} {totalPages}
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center space-x-1">
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 rounded-lg transition-all text-sm font-medium ${
                            currentPage === page
                              ? 'bg-indigo-600 text-white shadow-lg'
                              : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <span key={page} className="text-gray-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Shop Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedShop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowDetailsModal(false);
              setSelectedShop(null);
              setRejectionReason('');
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl border border-gray-200 max-w-3xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-xl"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
                <div className="flex items-center space-x-4">
                  {selectedShop.logo ? (
                    <img
                      src={selectedShop.logo}
                      alt={selectedShop.name}
                      className="w-16 h-16 rounded-xl object-cover ring-2 ring-gray-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-indigo-100 flex items-center justify-center ring-2 ring-gray-200">
                      <Building2 className="w-8 h-8 text-indigo-600" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedShop.name}</h2>
                    <p className="text-gray-500">@{selectedShop.slug}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedShop(null);
                    setRejectionReason('');
                  }}
                  className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <span
                    className={`px-4 py-2 rounded-lg text-sm font-medium border ${getStatusBadge(
                      selectedShop.status
                    )}`}
                  >
                    {getStatusLabel(selectedShop.status)}
                  </span>
                  <div className="text-right text-sm text-gray-500">
                    <p>{t('admin.shops.created')}: {formatDate(selectedShop.createdAt)}</p>
                    <p>{t('admin.shops.updated')}: {formatDate(selectedShop.updatedAt)}</p>
                  </div>
                </div>

                {/* Banner Image */}
                {selectedShop.banner && (
                  <div className="rounded-xl overflow-hidden">
                    <img
                      src={selectedShop.banner}
                      alt={`${selectedShop.name} banner`}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}

                {/* Shop Information */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <Building2 className="w-5 h-5 text-indigo-600" />
                    <span>{t('admin.shops.shopDetails')}</span>
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-500 text-sm mb-1">{t('admin.shops.description')}</p>
                      <p className="text-gray-900">{selectedShop.description || t('admin.shops.noDescription')}</p>
                    </div>
                  </div>
                </div>

                {/* Owner Details */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <User className="w-5 h-5 text-indigo-600" />
                    <span>{t('admin.shops.ownerDetails')}</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-gray-500 text-sm">{t('admin.shops.ownerName')}</p>
                        <p className="text-gray-900">{selectedShop.ownerName || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-gray-500 text-sm">{t('admin.shops.ownerEmail')}</p>
                        <p className="text-gray-900">{selectedShop.ownerEmail}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Business Documents */}
                {selectedShop.businessDocuments && selectedShop.businessDocuments.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      <span>{t('admin.shops.businessDocuments')}</span>
                    </h3>
                    <div className="space-y-2">
                      {selectedShop.businessDocuments.map((doc, index) => (
                        <a
                          key={index}
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-gray-100 transition-all border border-gray-200"
                        >
                          <div className="flex items-center space-x-3">
                            <FileText className="w-5 h-5 text-indigo-600" />
                            <span className="text-gray-900">{doc.name}</span>
                          </div>
                          <Download className="w-4 h-4 text-gray-500" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rejection Reason (if rejected) */}
                {selectedShop.status === 'rejected' && selectedShop.rejectionReason && (
                  <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                    <h3 className="text-lg font-semibold text-red-700 mb-2 flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5" />
                      <span>{t('admin.shops.rejectionReason')}</span>
                    </h3>
                    <p className="text-gray-700">{selectedShop.rejectionReason}</p>
                  </div>
                )}

                {/* Actions for Pending Shops */}
                {selectedShop.status === 'pending' && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.shops.takeAction')}</h3>

                    {/* Rejection Reason Input */}
                    <div>
                      <label className="text-sm text-gray-500 mb-2 block">
                        {t('admin.shops.rejectionReasonLabel')}
                      </label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder={t('admin.shops.rejectionPlaceholder')}
                        rows={3}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApproveShop(selectedShop.id)}
                        disabled={actionLoading}
                        className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-green-500/30 flex items-center justify-center space-x-2 disabled:opacity-50"
                      >
                        <CheckCircle className="w-5 h-5" />
                        <span>{actionLoading ? t('admin.common.loading') : t('admin.shops.approveShop')}</span>
                      </button>
                      <button
                        onClick={() => handleRejectShop(selectedShop.id)}
                        disabled={actionLoading}
                        className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-red-500/30 flex items-center justify-center space-x-2 disabled:opacity-50"
                      >
                        <XCircle className="w-5 h-5" />
                        <span>{actionLoading ? t('admin.common.loading') : t('admin.shops.rejectShop')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dialog Components */}
      <ConfirmDialog {...dialog.confirmDialog} />
      <AlertDialog {...dialog.alertDialog} />
    </motion.div>
  );
};
