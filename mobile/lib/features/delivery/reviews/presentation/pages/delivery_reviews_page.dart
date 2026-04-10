import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../orders/data/repositories/delivery_repository.dart';

// Provider for reviews data
final deliveryReviewsProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final repository = DeliveryRepository();
  return repository.getReviews();
});

class DeliveryReviewsPage extends ConsumerStatefulWidget {
  const DeliveryReviewsPage({super.key});

  @override
  ConsumerState<DeliveryReviewsPage> createState() => _DeliveryReviewsPageState();
}

class _DeliveryReviewsPageState extends ConsumerState<DeliveryReviewsPage> {
  @override
  Widget build(BuildContext context) {
    final reviewsAsync = ref.watch(deliveryReviewsProvider);

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'delivery.reviews.title'.tr(),
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.black87,
              ),
            ),
            Text(
              'delivery.reviews.subtitle'.tr(),
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey.shade600,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.invalidate(deliveryReviewsProvider),
          ),
        ],
      ),
      body: reviewsAsync.when(
        loading: () => _buildLoadingState(),
        error: (error, stack) => _buildError(error.toString()),
        data: (data) => _buildContent(data),
      ),
    );
  }

  Widget _buildLoadingState() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Stats shimmer
          Row(
            children: [
              Expanded(child: _buildShimmerCard(height: 100)),
              const SizedBox(width: 12),
              Expanded(child: _buildShimmerCard(height: 100)),
            ],
          ),
          const SizedBox(height: 12),
          _buildShimmerCard(height: 100),
          const SizedBox(height: 16),
          // Rating distribution shimmer
          _buildShimmerCard(height: 180),
          const SizedBox(height: 16),
          // Reviews shimmer
          _buildShimmerCard(height: 300),
        ],
      ),
    );
  }

  Widget _buildShimmerCard({required double height}) {
    return Container(
      height: height,
      decoration: BoxDecoration(
        color: Colors.grey.shade200,
        borderRadius: BorderRadius.circular(16),
      ),
    );
  }

  Widget _buildError(String error) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, size: 48, color: Colors.red.shade300),
            const SizedBox(height: 16),
            Text(
              'delivery.reviews.errorLoading'.tr(),
              style: TextStyle(fontSize: 18, color: Colors.grey.shade600),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () => ref.invalidate(deliveryReviewsProvider),
              icon: const Icon(Icons.refresh),
              label: Text('common.retry'.tr()),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContent(Map<String, dynamic> data) {
    final reviews = (data['reviews'] as List? ?? []).cast<Map<String, dynamic>>();
    final averageRating = (data['averageRating'] ?? 0.0).toDouble();
    final totalReviews = data['totalReviews'] ?? reviews.length;

    // Calculate rating distribution
    final ratingCounts = {5: 0, 4: 0, 3: 0, 2: 0, 1: 0};
    for (final review in reviews) {
      final rating = (review['rating'] ?? 0) as int;
      if (rating >= 1 && rating <= 5) {
        ratingCounts[rating] = (ratingCounts[rating] ?? 0) + 1;
      }
    }

    final fiveStarCount = ratingCounts[5] ?? 0;

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(deliveryReviewsProvider);
      },
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Stats Overview - 3 cards
            _buildStatsSection(averageRating, totalReviews, fiveStarCount),
            const SizedBox(height: 16),

            // Rating Distribution Card
            _buildRatingDistributionCard(ratingCounts, totalReviews),
            const SizedBox(height: 16),

            // Recent Reviews Card
            _buildReviewsListCard(reviews),
            const SizedBox(height: 100), // Bottom padding
          ],
        ),
      ),
    );
  }

  Widget _buildStatsSection(double averageRating, int totalReviews, int fiveStarCount) {
    return Column(
      children: [
        // First row: Average Rating (full width gradient)
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [Colors.yellow.shade600, Colors.orange.shade500],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'delivery.reviews.averageRating'.tr(),
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.yellow.shade100,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Text(
                        averageRating.toStringAsFixed(1),
                        style: const TextStyle(
                          fontSize: 32,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(width: 6),
                      const Icon(
                        Icons.star,
                        size: 24,
                        color: Colors.white,
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),

        // Second row: Total Reviews and 5 Star Reviews
        Row(
          children: [
            // Total Reviews Card
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey.shade200),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'delivery.reviews.totalReviews'.tr(),
                          style: TextStyle(
                            fontSize: 11,
                            color: Colors.grey.shade500,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '$totalReviews',
                          style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: Colors.blue.shade100,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(
                        Icons.message,
                        color: Colors.blue.shade600,
                        size: 18,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(width: 10),

            // 5 Star Reviews Card
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey.shade200),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'delivery.reviews.fiveStarReviews'.tr(),
                          style: TextStyle(
                            fontSize: 11,
                            color: Colors.grey.shade500,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '$fiveStarCount',
                          style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: Colors.green.shade100,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(
                        Icons.trending_up,
                        color: Colors.green.shade600,
                        size: 18,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildRatingDistributionCard(Map<int, int> ratingCounts, int totalReviews) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'delivery.reviews.ratingDistribution'.tr(),
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 12),
          ...([5, 4, 3, 2, 1].map((star) {
            final count = ratingCounts[star] ?? 0;
            final percentage = totalReviews == 0 ? 0.0 : count / totalReviews;
            return Padding(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: Row(
                children: [
                  SizedBox(
                    width: 40,
                    child: Row(
                      children: [
                        Text(
                          '$star',
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(width: 3),
                        const Icon(
                          Icons.star,
                          size: 12,
                          color: Colors.amber,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: percentage,
                        minHeight: 8,
                        backgroundColor: Colors.grey.shade100,
                        valueColor: const AlwaysStoppedAnimation<Color>(Colors.amber),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  SizedBox(
                    width: 24,
                    child: Text(
                      '$count',
                      style: TextStyle(
                        fontSize: 11,
                        color: Colors.grey.shade500,
                      ),
                      textAlign: TextAlign.right,
                    ),
                  ),
                ],
              ),
            );
          })),
        ],
      ),
    );
  }

  Widget _buildReviewsListCard(List<Map<String, dynamic>> reviews) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              border: Border(
                bottom: BorderSide(color: Colors.grey.shade200),
              ),
            ),
            child: Text(
              'delivery.reviews.recentReviews'.tr(),
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),

          // Reviews List or Empty State
          if (reviews.isEmpty)
            _buildEmptyState()
          else
            ...reviews.map((review) => _buildReviewItem(review)),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Padding(
      padding: const EdgeInsets.all(32),
      child: Center(
        child: Column(
          children: [
            Icon(
              Icons.star_border,
              size: 36,
              color: Colors.grey.shade300,
            ),
            const SizedBox(height: 12),
            Text(
              'delivery.reviews.noReviews'.tr(),
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'delivery.reviews.deliverMore'.tr(),
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey.shade500,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReviewItem(Map<String, dynamic> review) {
    final customerName = review['customerName'] ??
                         review['customer']?['name'] ??
                         review['customer_name'] ??
                         'Customer';
    final rating = (review['rating'] ?? 0).toDouble();
    final comment = review['comment'] ?? review['review'] ?? review['feedback'] ?? '';
    final orderNumber = review['orderNumber'] ??
                        review['order']?['order_number'] ??
                        review['order']?['orderNumber'] ??
                        review['orderId']?.toString().substring(0, 6) ??
                        '';
    final dateStr = review['createdAt'] ?? review['created_at'] ?? review['date'] ?? '';

    String formattedDate = '';
    if (dateStr.isNotEmpty) {
      try {
        final dateTime = DateTime.parse(dateStr);
        formattedDate = DateFormat('MMM dd, yyyy').format(dateTime);
      } catch (_) {
        formattedDate = dateStr;
      }
    }

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(color: Colors.grey.shade100),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Avatar
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: Colors.orange.shade100,
              shape: BoxShape.circle,
            ),
            child: Icon(
              Icons.person,
              color: Colors.orange.shade600,
              size: 16,
            ),
          ),
          const SizedBox(width: 10),

          // Content
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Row(
                        children: [
                          Text(
                            customerName,
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(width: 6),
                          _buildStars(rating.toInt()),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  'Order #$orderNumber',
                  style: TextStyle(
                    fontSize: 11,
                    color: Colors.grey.shade500,
                  ),
                ),
                if (comment.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Text(
                    comment,
                    style: const TextStyle(
                      fontSize: 12,
                      height: 1.4,
                    ),
                  ),
                ],
              ],
            ),
          ),

          // Date
          Row(
            children: [
              Icon(
                Icons.calendar_today,
                size: 10,
                color: Colors.grey.shade400,
              ),
              const SizedBox(width: 3),
              Text(
                formattedDate,
                style: TextStyle(
                  fontSize: 10,
                  color: Colors.grey.shade400,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStars(int rating) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(5, (index) {
        return Icon(
          index < rating ? Icons.star : Icons.star_border,
          size: 12,
          color: index < rating ? Colors.amber : Colors.grey.shade300,
        );
      }),
    );
  }
}
