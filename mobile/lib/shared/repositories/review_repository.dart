import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../../core/network/dio_client.dart';
import '../../core/constants/api_constants.dart';
import '../../core/errors/error_handler.dart';
import '../models/review_model.dart';

class ReviewRepository {
  final DioClient _dioClient = DioClient.instance;

  /// Get reviews for a product
  Future<List<ReviewModel>> getProductReviews(
    String productId, {
    int page = 1,
    int limit = 10,
    int? rating,
    String? sort = 'recent', // 'recent', 'helpful', 'rating_high', 'rating_low'
  }) async {
    try {
      debugPrint('📝 Loading reviews for product: $productId');
      debugPrint('📝 API URL: ${ApiConstants.productReviews}/$productId');

      final response = await _dioClient.get(
        '${ApiConstants.productReviews}/$productId',
        queryParameters: {
          'page': page,
          'limit': limit,
          if (rating != null) 'rating': rating,
          // Note: 'sort' parameter not supported by backend
        },
      );

      debugPrint('📝 Response status: ${response.statusCode}');
      debugPrint('📝 Response type: ${response.data.runtimeType}');
      debugPrint('📝 Raw response: ${response.data}');

      List<dynamic> reviewsData = [];

      if (response.data is Map) {
        final map = response.data as Map<String, dynamic>;
        debugPrint('📝 Response keys: ${map.keys.toList()}');

        // Try different possible structures
        if (map['data'] != null) {
          debugPrint('📝 Found "data" key, type: ${map['data'].runtimeType}');
          if (map['data'] is List) {
            reviewsData = map['data'] as List;
          } else if (map['data'] is Map && map['data']['reviews'] != null) {
            reviewsData = map['data']['reviews'] as List;
          } else if (map['data'] is Map && map['data']['data'] != null) {
            reviewsData = map['data']['data'] as List;
          }
        } else if (map['reviews'] != null) {
          debugPrint('📝 Found "reviews" key');
          reviewsData = map['reviews'] as List;
        }
      } else if (response.data is List) {
        reviewsData = response.data as List;
      }

      debugPrint('📝 Extracted ${reviewsData.length} review items');

      final reviews = <ReviewModel>[];
      for (int i = 0; i < reviewsData.length; i++) {
        try {
          final json = reviewsData[i] as Map<String, dynamic>;
          debugPrint('📝 Review $i keys: ${json.keys.toList()}');
          reviews.add(ReviewModel.fromJson(json));
        } catch (e, stack) {
          debugPrint('❌ Error parsing review $i: $e');
          debugPrint('❌ Stack: $stack');
        }
      }

      debugPrint('📝 Successfully parsed ${reviews.length} reviews');
      return reviews;
    } on DioException catch (e) {
      debugPrint('❌ DioException: ${e.message}');
      debugPrint('❌ Response: ${e.response?.data}');
      throw ErrorHandler.handleError(e);
    } catch (e, stack) {
      debugPrint('❌ Unexpected error: $e');
      debugPrint('❌ Stack: $stack');
      rethrow;
    }
  }

  /// Get review statistics for a product
  Future<ReviewStatsModel> getReviewStats(String productId) async {
    try {
      final response = await _dioClient.get(
        '${ApiConstants.reviewStats}/$productId/summary',
      );

      Map<String, dynamic> statsData;
      if (response.data is Map && response.data['data'] != null) {
        statsData = response.data['data'] as Map<String, dynamic>;
      } else if (response.data is Map) {
        statsData = response.data as Map<String, dynamic>;
      } else {
        // Return default stats if no data
        return ReviewStatsModel(
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: {},
        );
      }

      return ReviewStatsModel.fromJson(statsData);
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }

  /// Create a new review
  Future<ReviewModel> createReview(CreateReviewRequest request) async {
    try {
      final response = await _dioClient.post(
        ApiConstants.createReview,
        data: request.toJson(),
      );

      Map<String, dynamic> reviewData;
      if (response.data is Map && response.data['data'] != null) {
        reviewData = response.data['data'] as Map<String, dynamic>;
      } else if (response.data is Map) {
        reviewData = response.data as Map<String, dynamic>;
      } else {
        throw Exception('Invalid review data format');
      }

      return ReviewModel.fromJson(reviewData);
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }

  /// Update an existing review
  Future<ReviewModel> updateReview(
    String reviewId,
    CreateReviewRequest request,
  ) async {
    try {
      final response = await _dioClient.patch(
        '${ApiConstants.updateReview}/$reviewId',
        data: request.toJson(),
      );

      Map<String, dynamic> reviewData;
      if (response.data is Map && response.data['data'] != null) {
        reviewData = response.data['data'] as Map<String, dynamic>;
      } else if (response.data is Map) {
        reviewData = response.data as Map<String, dynamic>;
      } else {
        throw Exception('Invalid review data format');
      }

      return ReviewModel.fromJson(reviewData);
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }

  /// Delete a review
  Future<void> deleteReview(String reviewId) async {
    try {
      await _dioClient.delete('${ApiConstants.deleteReview}/$reviewId');
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }

  /// Mark a review as helpful
  Future<void> markHelpful(String reviewId) async {
    try {
      await _dioClient.post('${ApiConstants.markHelpful}/$reviewId/helpful');
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }
}
