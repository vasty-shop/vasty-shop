import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Star,
  ThumbsUp,
  MessageSquare,
  Flag,
  EyeOff,
  Eye,
  Filter,
  Image as ImageIcon,
  X,
  Send
} from 'lucide-react';
import { GlassCard, StatCard } from '../components/GlassCard';
import { toast } from 'sonner';
import { extractRouteContext } from '../../../lib/navigation-utils';
import { api } from '../../../lib/api';
import { useDialog } from '../../../hooks/useDialog';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { AlertDialog } from '../../../components/ui/AlertDialog';

interface Review {
  id: string;
  productName: string;
  productImage: string;
  customerName: string;
  customerAvatar: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  helpfulCount: number;
  createdAt: string;
  isFeatured: boolean;
  isHidden: boolean;
  reply?: {
    text: string;
    date: string;
  };
}

export const ReviewsPage: React.FC = () => {
  const { t } = useTranslation();
  const dialog = useDialog();
  const params = useParams();
  const { shopId } = extractRouteContext(params);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRating, setSelectedRating] = useState('all');
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<any>(null);

  const ratings = ['all', '5', '4', '3', '2', '1'];

  // Set shop context in API client for automatic header injection
  useEffect(() => {
    if (shopId) {
      api.setShopId(shopId);
    }
  }, [shopId]);

  // Fetch reviews and statistics
  useEffect(() => {
    const fetchData = async () => {
      if (!shopId) return;

      try {
        setLoading(true);
        const [reviewsResponse, statsData] = await Promise.all([
          api.getVendorReviews(),
          api.getReviewStatistics()
        ]);

        // Transform backend data to match component interface
        const transformedReviews = (reviewsResponse.data || []).map((r: any) => ({
          id: r.id,
          productName: r.product?.name || 'Unknown Product',
          productImage: r.product?.images?.[0] || '/images/default-product.png',
          customerName: r.user?.name || r.userName || 'Anonymous',
          customerAvatar: r.user?.avatar || '/images/default-avatar.png',
          rating: r.rating || 0,
          title: r.title || '',
          comment: r.comment || r.review || '',
          images: r.images || [],
          helpfulCount: r.helpfulCount || 0,
          createdAt: r.createdAt || new Date().toISOString(),
          isFeatured: r.isFeatured || false,
          isHidden: r.isHidden || false,
          reply: r.vendorReply ? {
            text: r.vendorReply,
            date: r.vendorReplyDate || new Date().toISOString()
          } : undefined
        }));

        setReviews(transformedReviews);
        setStatistics(statsData);
      } catch (error: any) {
        console.error('Failed to fetch reviews:', error);
        toast.error(t('vendor.reviews.failedToLoad', { defaultValue: 'Failed to load reviews' }));
        // Keep empty array - show empty state
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [shopId]);

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch = review.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.comment.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRating = selectedRating === 'all' || review.rating.toString() === selectedRating;
    return matchesSearch && matchesRating;
  });

  const handleToggleFeatured = async (review: Review) => {
    try {
      await api.toggleReviewFeatured(review.id);
      setReviews(reviews.map(r =>
        r.id === review.id ? { ...r, isFeatured: !r.isFeatured } : r
      ));
      toast.success(review.isFeatured
        ? t('vendor.reviews.removedFromFeatured', { defaultValue: 'Review removed from featured' })
        : t('vendor.reviews.addedToFeatured', { defaultValue: 'Review added to featured' }));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('vendor.reviews.failedToUpdate', { defaultValue: 'Failed to update review' }));
    }
  };

  const handleToggleHidden = async (review: Review) => {
    try {
      await api.toggleReviewVisibility(review.id);
      setReviews(reviews.map(r =>
        r.id === review.id ? { ...r, isHidden: !r.isHidden } : r
      ));
      toast.success(review.isHidden
        ? t('vendor.reviews.reviewShown', { defaultValue: 'Review shown' })
        : t('vendor.reviews.reviewHidden', { defaultValue: 'Review hidden' }));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('vendor.reviews.failedToUpdateVisibility', { defaultValue: 'Failed to update review visibility' }));
    }
  };

  const handleReportReview = async (review: Review) => {
    const confirmed = await dialog.showConfirm({
      title: t('vendor.reviews.reportReview', { defaultValue: 'Report Review' }),
      message: t('vendor.reviews.reportConfirmMessage', { defaultValue: 'Are you sure you want to report this review as inappropriate? Our team will investigate this matter.' }),
      confirmText: t('vendor.reviews.report', { defaultValue: 'Report' }),
      cancelText: t('vendor.common.cancel', { defaultValue: 'Cancel' }),
      variant: 'warning'
    });

    if (confirmed) {
      try {
        await api.reportReview(review.id, 'inappropriate', 'This review has been flagged as inappropriate by the vendor.');
        toast.success(t('vendor.reviews.reportedSuccessfully', { defaultValue: 'Review reported successfully' }));
      } catch (error: any) {
        toast.error(error?.response?.data?.message || t('vendor.reviews.failedToReport', { defaultValue: 'Failed to report review' }));
      }
    }
  };

  const handleReply = (review: Review) => {
    setSelectedReview(review);
    setReplyText(review.reply?.text || '');
    setShowReplyModal(true);
  };

  const handleSubmitReply = async () => {
    if (!selectedReview || !replyText.trim()) {
      toast.error(t('vendor.reviews.enterReplyMessage', { defaultValue: 'Please enter a reply message' }));
      return;
    }

    try {
      if (selectedReview.reply) {
        // Update existing reply
        await api.updateReviewReply(selectedReview.id, replyText);
        toast.success(t('vendor.reviews.replyUpdated', { defaultValue: 'Reply updated successfully' }));
      } else {
        // Create new reply
        await api.replyToReview(selectedReview.id, replyText);
        toast.success(t('vendor.reviews.replyPosted', { defaultValue: 'Reply posted successfully' }));
      }

      // Update local state
      setReviews(reviews.map(r =>
        r.id === selectedReview.id
          ? { ...r, reply: { text: replyText, date: new Date().toISOString() } }
          : r
      ));

      setShowReplyModal(false);
      setReplyText('');
      setSelectedReview(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('vendor.reviews.failedToSubmitReply', { defaultValue: 'Failed to submit reply' }));
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
    percentage: reviews.length > 0
      ? (reviews.filter((r) => r.rating === rating).length / reviews.length) * 100
      : 0
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary-lime border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500">{t('vendor.reviews.loading', { defaultValue: 'Loading reviews...' })}</p>
        </div>
      </div>
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
            {t('vendor.reviews.title', { defaultValue: 'Customer Reviews' })}
          </h1>
          <p className="text-gray-500 mt-1">
            {t('vendor.reviews.subtitle', { defaultValue: 'Manage and respond to customer feedback' })}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title={t('vendor.reviews.totalReviews', { defaultValue: 'Total Reviews' })}
          value={reviews.length.toString()}
          icon={<MessageSquare />}
          color="from-purple-400 to-pink-500"
        />
        <StatCard
          title={t('vendor.reviews.averageRating', { defaultValue: 'Average Rating' })}
          value={avgRating}
          subtitle={t('vendor.reviews.outOf5', { defaultValue: 'out of 5' })}
          icon={<Star />}
          color="from-yellow-400 to-orange-500"
        />
        <StatCard
          title={t('vendor.reviews.featured', { defaultValue: 'Featured' })}
          value={reviews.filter((r) => r.isFeatured).length.toString()}
          icon={<Star />}
          color="from-green-400 to-emerald-500"
        />
        <StatCard
          title={t('vendor.reviews.helpfulVotes', { defaultValue: 'Helpful Votes' })}
          value={reviews.reduce((acc, r) => acc + r.helpfulCount, 0).toString()}
          icon={<ThumbsUp />}
          color="from-blue-400 to-cyan-500"
        />
      </div>

      {/* Rating Distribution */}
      <GlassCard hover={false}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('vendor.reviews.ratingDistribution', { defaultValue: 'Rating Distribution' })}</h3>
        <div className="space-y-3">
          {ratingDistribution.map((item) => (
            <div key={item.rating} className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 w-16">
                <span className="text-gray-900 font-medium">{item.rating}</span>
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              </div>
              <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percentage}%` }}
                  className="h-full bg-gradient-to-r from-primary-lime to-green-500"
                />
              </div>
              <span className="text-gray-500 text-sm w-16 text-right">
                {item.count} ({Math.round(item.percentage)}%)
              </span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Search & Filter */}
      <GlassCard hover={false}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('vendor.placeholders.searchReviews')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <div className="flex bg-gray-100 rounded-xl p-1">
              {ratings.map((rating) => (
                <button
                  key={rating}
                  onClick={() => setSelectedRating(rating)}
                  className={`px-3 py-1.5 rounded-lg transition-all text-sm ${
                    selectedRating === rating
                      ? 'bg-primary-lime text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {rating === 'all' ? t('vendor.reviews.all', { defaultValue: 'All' }) : `${rating}★`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <GlassCard hover={false}>
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('vendor.reviews.noReviewsFound', { defaultValue: 'No Reviews Found' })}</h3>
              <p className="text-gray-500">
                {searchQuery || selectedRating !== 'all'
                  ? t('vendor.reviews.noReviewsMatchCriteria', { defaultValue: 'No reviews match your search criteria' })
                  : t('vendor.reviews.noReviewsYet', { defaultValue: "You haven't received any reviews yet" })}
              </p>
            </div>
          </GlassCard>
        ) : (
          filteredReviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <GlassCard hover={false}>
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <img
                      src={review.productImage}
                      alt={review.productName}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">{review.productName}</h3>
                      <div className="flex items-center space-x-3 mt-2">
                        <div className="flex items-center space-x-2">
                          <img
                            src={review.customerAvatar}
                            alt={review.customerName}
                            className="w-8 h-8 rounded-full"
                          />
                          <span className="text-sm text-gray-600">{review.customerName}</span>
                        </div>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-400">{review.createdAt}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {review.isFeatured && (
                      <span className="px-3 py-1 bg-yellow-400/20 text-yellow-400 rounded-lg text-xs font-medium">
                        {t('vendor.reviews.featured', { defaultValue: 'Featured' })}
                      </span>
                    )}
                    {renderStars(review.rating)}
                  </div>
                </div>

                {/* Review Content */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                </div>

                {/* Review Images */}
                {review.images.length > 0 && (
                  <div className="flex space-x-2">
                    {review.images.map((image, idx) => (
                      <img
                        key={idx}
                        src={image}
                        alt={`Review ${idx + 1}`}
                        className="w-24 h-24 rounded-lg object-cover cursor-pointer hover:scale-105 transition-transform"
                      />
                    ))}
                  </div>
                )}

                {/* Helpful Count */}
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1 text-gray-500">
                    <ThumbsUp className="w-4 h-4" />
                    <span>{t('vendor.reviews.peopleFoundHelpful', { count: review.helpfulCount, defaultValue: '{{count}} people found this helpful' })}</span>
                  </div>
                </div>

                {/* Shop Reply */}
                {review.reply && (
                  <div className="ml-8 p-4 bg-gray-100 rounded-xl border border-gray-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-lime to-green-500 flex items-center justify-center text-xs font-bold text-white">
                        S
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{t('vendor.reviews.shopResponse', { defaultValue: 'Shop Response' })}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-xs text-gray-400">{review.reply.date}</span>
                    </div>
                    <p className="text-sm text-gray-600">{review.reply.text}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleReply(review)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all flex items-center space-x-2"
                    >
                      <MessageSquare className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-gray-700">{review.reply ? t('vendor.reviews.editReply', { defaultValue: 'Edit Reply' }) : t('vendor.reviews.reply', { defaultValue: 'Reply' })}</span>
                    </button>
                    <button
                      onClick={() => handleToggleFeatured(review)}
                      className={`px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all flex items-center space-x-2 ${
                        review.isFeatured ? 'text-yellow-400' : 'text-gray-500'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${review.isFeatured ? 'fill-yellow-400' : ''}`} />
                      <span className="text-sm">{t('vendor.reviews.featured', { defaultValue: 'Featured' })}</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleHidden(review)}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                      title={review.isHidden ? t('vendor.reviews.showReview', { defaultValue: 'Show review' }) : t('vendor.reviews.hideReview', { defaultValue: 'Hide review' })}
                    >
                      {review.isHidden ? (
                        <Eye className="w-4 h-4 text-gray-500" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                    <button
                      onClick={() => handleReportReview(review)}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                      title={t('vendor.reviews.reportReview', { defaultValue: 'Report review' })}
                    >
                      <Flag className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))
        )}
      </div>

      {/* Reply Modal */}
      <AnimatePresence>
        {showReplyModal && selectedReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowReplyModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl"
            >
              <GlassCard hover={false}>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">{t('vendor.reviews.replyToReview', { defaultValue: 'Reply to Review' })}</h2>
                    <button
                      onClick={() => setShowReplyModal(false)}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                    >
                      <X className="w-5 h-5 text-gray-700" />
                    </button>
                  </div>

                  {/* Review Preview */}
                  <div className="p-4 bg-gray-100 rounded-xl">
                    <div className="flex items-center space-x-2 mb-2">
                      <img
                        src={selectedReview.customerAvatar}
                        alt={selectedReview.customerName}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{selectedReview.customerName}</p>
                        <div>{renderStars(selectedReview.rating)}</div>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm">{selectedReview.comment}</p>
                  </div>

                  {/* Reply Input */}
                  <div>
                    <label className="text-sm text-gray-500 mb-2 block">{t('vendor.reviews.yourResponse', { defaultValue: 'Your Response' })}</label>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 resize-none"
                      rows={6}
                      placeholder={t('vendor.reviews.replyPlaceholder', { defaultValue: 'Thank the customer for their feedback...' })}
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-3">
                    <button
                      onClick={() => setShowReplyModal(false)}
                      className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all"
                    >
                      {t('vendor.common.cancel', { defaultValue: 'Cancel' })}
                    </button>
                    <button
                      onClick={handleSubmitReply}
                      disabled={!replyText.trim()}
                      className="px-6 py-2 bg-primary-lime hover:bg-primary-lime/90 rounded-xl font-medium text-white transition-all shadow-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                      <span>{t('vendor.reviews.postReply', { defaultValue: 'Post Reply' })}</span>
                    </button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dialog Components */}
      <ConfirmDialog {...dialog.confirmDialog} />
      <AlertDialog {...dialog.alertDialog} />
    </motion.div>
  );
};
