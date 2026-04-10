import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Star,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  Store,
  User,
  Package,
  Calendar,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { GlassCard } from '../../vendor/components/GlassCard';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface Review {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  shopId: string;
  shopName: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  pendingModeration: number;
  approved: number;
}

export const AdminReviewsPage: React.FC = () => {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRating, setSelectedRating] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [stats, setStats] = useState<ReviewStats>({
    totalReviews: 0,
    averageRating: 0,
    pendingModeration: 0,
    approved: 0
  });

  const ratings = ['all', '5', '4', '3', '2', '1'];
  const statuses = ['all', 'pending', 'approved', 'rejected'];
  const itemsPerPage = 10;

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: itemsPerPage
      };

      if (selectedRating !== 'all') {
        params.rating = parseInt(selectedRating);
      }

      if (selectedStatus !== 'all') {
        params.status = selectedStatus;
      }

      const response = await api.getAdminReviews(params);

      setReviews(response.data || []);
      setTotal(response.count || 0);

      if (response.stats) {
        setStats({
          totalReviews: response.stats.totalReviews || 0,
          averageRating: response.stats.averageRating || 0,
          pendingModeration: response.stats.pendingModeration || 0,
          approved: response.stats.approved || 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      toast.error('Failed to load reviews');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [page, selectedRating, selectedStatus]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Client-side search filtering (API handles rating/status filtering)
  const filteredReviews = reviews.filter(review => {
    if (!searchQuery) return true;
    const matchesSearch =
      review.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const totalPages = Math.ceil(total / itemsPerPage) || 1;

  const handleApprove = (reviewId: string) => {
    // API call would go here
  };

  const handleReject = (reviewId: string) => {
    // API call would go here
  };

  const handleDelete = (reviewId: string) => {
    // API call would go here
  };

  const handleViewDetails = (review: Review) => {
    setSelectedReview(review);
    setShowDetailsModal(true);
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'sm') => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    };

    return (
      <div className="flex items-center space-x-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            {t('admin.reviews.approved')}
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            {t('admin.reviews.rejected')}
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            {t('admin.reviews.pending')}
          </span>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('admin.reviews.title')}
          </h1>
          <p className="text-gray-500 mt-1">
            {t('admin.reviews.subtitle')}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard hover={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">{t('admin.reviews.allReviews')}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalReviews}</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-md">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
          </div>
        </GlassCard>

        <GlassCard hover={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">{t('admin.reviews.rating')}</p>
              <div className="flex items-center space-x-2 mt-2">
                <p className="text-3xl font-bold text-gray-900">
                  {stats.averageRating.toFixed(1)}
                </p>
                {renderStars(Math.round(stats.averageRating), 'md')}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-md">
              <Star className="w-6 h-6 text-white" />
            </div>
          </div>
        </GlassCard>

        <GlassCard hover={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">{t('admin.common.pending')}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pendingModeration}</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 shadow-md">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </GlassCard>

        <GlassCard hover={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">{t('admin.common.approved')}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.approved}</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-md">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Search & Filters */}
      <GlassCard hover={false}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('admin.reviews.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">{t('admin.reviews.allRatings')}</option>
                {ratings.slice(1).map((rating) => (
                  <option key={rating} value={rating}>
                    {rating} {t('admin.reviews.stars')}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Reviews Table */}
      <GlassCard hover={false} className="overflow-hidden">
        {loading ? (
          <div className="py-12 text-center">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-500 font-medium">{t('admin.common.loading')}</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="py-12 text-center">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">{t('admin.reviews.noReviews')}</p>
            <p className="text-gray-400 text-sm mt-1">
              {searchQuery || selectedRating !== 'all' || selectedStatus !== 'all'
                ? t('admin.reviews.adjustFilters')
                : t('admin.reviews.reviewsWillAppear')}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left p-4 text-sm text-gray-600 font-semibold">{t('admin.reviews.product')}</th>
                    <th className="text-left p-4 text-sm text-gray-600 font-semibold">{t('admin.reviews.reviewer')}</th>
                    <th className="text-left p-4 text-sm text-gray-600 font-semibold">{t('admin.reviews.shop')}</th>
                    <th className="text-left p-4 text-sm text-gray-600 font-semibold">{t('admin.reviews.rating')}</th>
                    <th className="text-left p-4 text-sm text-gray-600 font-semibold">{t('admin.reviews.comment')}</th>
                    <th className="text-left p-4 text-sm text-gray-600 font-semibold">{t('admin.reviews.date')}</th>
                    <th className="text-left p-4 text-sm text-gray-600 font-semibold">{t('admin.reviews.status')}</th>
                    <th className="text-left p-4 text-sm text-gray-600 font-semibold">{t('admin.common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReviews.map((review, index) => (
                    <motion.tr
                      key={review.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Package className="w-5 h-5 text-gray-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 truncate max-w-[150px]">
                              {review.productName}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{review.customerName}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Store className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{review.shopName}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {renderStars(review.rating)}
                      </td>
                      <td className="p-4">
                        <p className="text-gray-600 text-sm truncate max-w-[200px]">
                          {review.comment}
                        </p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-1 text-gray-500 text-sm">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(review.status)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewDetails(review)}
                            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            title={t('admin.reviews.viewDetails')}
                          >
                            <Eye className="w-4 h-4 text-indigo-600" />
                          </button>
                          {review.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(review.id)}
                                className="p-2 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                                title={t('admin.reviews.approveReview')}
                              >
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              </button>
                              <button
                                onClick={() => handleReject(review.id)}
                                className="p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                title={t('admin.reviews.rejectReview')}
                              >
                                <XCircle className="w-4 h-4 text-red-600" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(review.id)}
                            className="p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                            title={t('admin.reviews.deleteReview')}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
                <p className="text-sm text-gray-500">
                  {t('admin.common.showing')} {(page - 1) * itemsPerPage + 1} - {Math.min(page * itemsPerPage, filteredReviews.length)} {t('admin.common.of')} {filteredReviews.length}
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="p-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <span className="px-4 py-2 text-sm text-gray-700">
                    {t('admin.common.page')} {page} {t('admin.common.of')} {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="p-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </GlassCard>

      {/* Review Details Modal */}
      {showDetailsModal && selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowDetailsModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{t('admin.reviews.reviewDetails')}</h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Review ID: {selectedReview.id}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Product Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{selectedReview.productName}</p>
                    <p className="text-gray-500 text-sm">from {selectedReview.shopName}</p>
                  </div>
                </div>
              </div>

              {/* Customer & Rating */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-500 text-sm mb-2">{t('admin.reviews.customer')}</p>
                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-indigo-600" />
                    <div>
                      <p className="font-medium text-gray-900">{selectedReview.customerName}</p>
                      <p className="text-gray-500 text-xs">{selectedReview.customerEmail}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-500 text-sm mb-2">{t('admin.reviews.rating')}</p>
                  <div className="flex items-center space-x-2">
                    {renderStars(selectedReview.rating, 'lg')}
                    <span className="text-xl font-bold text-gray-900">{selectedReview.rating}/5</span>
                  </div>
                </div>
              </div>

              {/* Comment */}
              <div>
                <p className="text-gray-500 text-sm mb-2">{t('admin.reviews.comment')}</p>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-700">{selectedReview.comment}</p>
                </div>
              </div>

              {/* Meta Info */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2 text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>{t('admin.reviews.submittedOn')} {new Date(selectedReview.createdAt).toLocaleDateString()}</span>
                </div>
                {getStatusBadge(selectedReview.status)}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                {selectedReview.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        handleApprove(selectedReview.id);
                        setShowDetailsModal(false);
                      }}
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors flex items-center justify-center space-x-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>{t('admin.reviews.approveReview')}</span>
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedReview.id);
                        setShowDetailsModal(false);
                      }}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors flex items-center justify-center space-x-2"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>{t('admin.reviews.rejectReview')}</span>
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    handleDelete(selectedReview.id);
                    setShowDetailsModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors flex items-center justify-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{t('admin.reviews.deleteReview')}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
