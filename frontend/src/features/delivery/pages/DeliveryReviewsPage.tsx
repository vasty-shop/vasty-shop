import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquare, User, Calendar, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDeliveryAuthStore } from '@/stores/useDeliveryAuthStore';
import { deliveryApi } from '../api/deliveryApi';
import type { DeliveryReview } from '../types/delivery.types';
import { toast } from 'sonner';

export const DeliveryReviewsPage: React.FC = () => {
  const { t } = useTranslation();
  const { deliveryMan } = useDeliveryAuthStore();
  const [reviews, setReviews] = useState<DeliveryReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, [deliveryMan]);

  const loadReviews = async () => {
    if (!deliveryMan?.id) return;

    setIsLoading(true);
    try {
      const response = await deliveryApi.getReviews(deliveryMan.id);
      const reviewsData = response.data?.data || response.data || [];

      // Transform backend data to match DeliveryReview type
      const transformedReviews: DeliveryReview[] = (Array.isArray(reviewsData) ? reviewsData : []).map((item: any) => ({
        id: item.id,
        deliveryManId: item.delivery_man_id || item.deliveryManId || deliveryMan.id,
        orderId: item.order_id || item.orderId || '',
        orderNumber: item.order?.order_number || item.order?.orderNumber || item.orderNumber || item.order_id?.slice(-6) || 'N/A',
        customerId: item.customer_id || item.customerId || item.user_id || '',
        customerName: item.customer?.name || item.customer_name || item.customerName || item.user?.name || 'Customer',
        rating: Number(item.rating) || 0,
        comment: item.comment || item.review || item.feedback || '',
        createdAt: item.created_at || item.createdAt || new Date().toISOString(),
      }));

      setReviews(transformedReviews);
    } catch (error) {
      console.error('Failed to load reviews:', error);
      setReviews([]);
    } finally {
      setIsLoading(false);
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

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
    percentage:
      reviews.length > 0
        ? (reviews.filter((r) => r.rating === rating).length / reviews.length) * 100
        : 0,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('delivery.reviews.title')}</h1>
        <p className="text-gray-500 mt-1">{t('delivery.reviews.subtitle')}</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">{t('delivery.reviews.averageRating')}</p>
              <div className="flex items-center mt-2">
                <span className="text-4xl font-bold">
                  {Number(deliveryMan?.rating || 0).toFixed(1)}
                </span>
                <Star className="w-8 h-8 ml-2 fill-white" />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">{t('delivery.reviews.totalReviews')}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {deliveryMan?.totalReviews || reviews.length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">{t('delivery.reviews.fiveStarReviews')}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {reviews.filter((r) => r.rating === 5).length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Rating Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('delivery.reviews.ratingDistribution')}</h3>
        <div className="space-y-3">
          {ratingDistribution.map(({ rating, count, percentage }) => (
            <div key={rating} className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 w-20">
                <span className="text-sm font-medium text-gray-700">{rating}</span>
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              </div>
              <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-500 w-12 text-right">{count}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Reviews List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">{t('delivery.reviews.recentReviews')}</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {isLoading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="p-6 animate-pulse">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
            ))
          ) : reviews.length > 0 ? (
            reviews.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900">{review.customerName}</p>
                        {renderStars(review.rating)}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Order #{review.orderNumber}
                      </p>
                      {review.comment && (
                        <p className="text-gray-700 mt-3">{review.comment}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="p-12 text-center">
              <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('delivery.reviews.noReviews')}</h3>
              <p className="text-gray-500">{t('delivery.reviews.deliverMore')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
