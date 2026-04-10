import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../../../../../core/network/dio_client.dart';
import '../../../../../core/errors/error_handler.dart';
import '../../../../../core/constants/app_constants.dart';
import '../models/review_models.dart';

class ReviewRepository {
  final DioClient _dioClient = DioClient.instance;

  /// Get shop reviews
  Future<List<Review>> getReviews({String? shopId, int? rating}) async {
    try {
      final effectiveShopId = shopId ?? AppConstants.shopId;
      debugPrint('📝 Fetching shop reviews...');
      debugPrint('   Shop ID: $effectiveShopId');

      final queryParams = <String, dynamic>{
        if (rating != null) 'rating': rating,
      };

      final response = await _dioClient.get(
        '/reviews/shop',
        queryParameters: queryParams,
        options: Options(headers: {'x-shop-id': effectiveShopId}),
      );

      debugPrint('✅ Reviews fetched successfully');

      // Handle response format
      List<dynamic> reviewsData;
      if (response.data is Map && response.data['data'] != null) {
        reviewsData = response.data['data'] as List<dynamic>;
      } else if (response.data is List) {
        reviewsData = response.data as List<dynamic>;
      } else {
        reviewsData = [];
      }

      return reviewsData.map((json) => Review.fromJson(json)).toList();
    } on DioException catch (e) {
      debugPrint('❌ Error fetching reviews: ${e.response?.statusCode}');
      debugPrint('   Error: ${e.response?.data}');
      throw ErrorHandler.handleError(e);
    } catch (e) {
      debugPrint('❌ Unexpected error: $e');
      rethrow;
    }
  }

  /// Get review statistics
  Future<ReviewStatistics> getStatistics({String? shopId}) async {
    try {
      final effectiveShopId = shopId ?? AppConstants.shopId;
      debugPrint('📊 Fetching review statistics...');

      final response = await _dioClient.get(
        '/reviews/shop/statistics',
        options: Options(headers: {'x-shop-id': effectiveShopId}),
      );

      debugPrint('✅ Review statistics fetched successfully');

      Map<String, dynamic> statsData;
      if (response.data is Map && response.data['data'] != null) {
        statsData = response.data['data'] as Map<String, dynamic>;
      } else if (response.data is Map) {
        statsData = response.data as Map<String, dynamic>;
      } else {
        return ReviewStatistics.empty();
      }

      return ReviewStatistics.fromJson(statsData);
    } on DioException catch (e) {
      debugPrint('❌ Error fetching review statistics: ${e.response?.statusCode}');
      return ReviewStatistics.empty();
    } catch (e) {
      debugPrint('❌ Unexpected error: $e');
      return ReviewStatistics.empty();
    }
  }

  /// Reply to a review
  Future<void> replyToReview(String reviewId, String replyText, {String? shopId}) async {
    try {
      final effectiveShopId = shopId ?? AppConstants.shopId;
      debugPrint('💬 Replying to review: $reviewId');

      await _dioClient.post(
        '/reviews/$reviewId/respond',
        data: {'response': replyText},
        options: Options(headers: {'x-shop-id': effectiveShopId}),
      );

      debugPrint('✅ Reply posted successfully');
    } on DioException catch (e) {
      debugPrint('❌ Error replying to review: ${e.response?.statusCode}');
      throw ErrorHandler.handleError(e);
    }
  }

  /// Update existing reply
  Future<void> updateReply(String reviewId, String replyText, {String? shopId}) async {
    try {
      final effectiveShopId = shopId ?? AppConstants.shopId;
      debugPrint('✏️ Updating reply for review: $reviewId');

      await _dioClient.post(
        '/reviews/$reviewId/respond',
        data: {'response': replyText, 'update': true},
        options: Options(headers: {'x-shop-id': effectiveShopId}),
      );

      debugPrint('✅ Reply updated successfully');
    } on DioException catch (e) {
      debugPrint('❌ Error updating reply: ${e.response?.statusCode}');
      throw ErrorHandler.handleError(e);
    }
  }

  /// Toggle review featured status
  Future<void> toggleFeatured(String reviewId, {String? shopId}) async {
    try {
      final effectiveShopId = shopId ?? AppConstants.shopId;
      debugPrint('⭐ Toggling featured status for review: $reviewId');

      await _dioClient.patch(
        '/reviews/$reviewId/featured',
        options: Options(headers: {'x-shop-id': effectiveShopId}),
      );

      debugPrint('✅ Featured status toggled successfully');
    } on DioException catch (e) {
      debugPrint('❌ Error toggling featured: ${e.response?.statusCode}');
      throw ErrorHandler.handleError(e);
    }
  }

  /// Toggle review visibility
  Future<void> toggleVisibility(String reviewId, {String? shopId}) async {
    try {
      final effectiveShopId = shopId ?? AppConstants.shopId;
      debugPrint('👁️ Toggling visibility for review: $reviewId');

      await _dioClient.patch(
        '/reviews/$reviewId/visibility',
        options: Options(headers: {'x-shop-id': effectiveShopId}),
      );

      debugPrint('✅ Visibility toggled successfully');
    } on DioException catch (e) {
      debugPrint('❌ Error toggling visibility: ${e.response?.statusCode}');
      throw ErrorHandler.handleError(e);
    }
  }

  /// Report a review
  Future<void> reportReview(String reviewId, String reason, {String? shopId}) async {
    try {
      final effectiveShopId = shopId ?? AppConstants.shopId;
      debugPrint('🚩 Reporting review: $reviewId');

      await _dioClient.post(
        '/reviews/$reviewId/report',
        data: {'reason': reason},
        options: Options(headers: {'x-shop-id': effectiveShopId}),
      );

      debugPrint('✅ Review reported successfully');
    } on DioException catch (e) {
      debugPrint('❌ Error reporting review: ${e.response?.statusCode}');
      throw ErrorHandler.handleError(e);
    }
  }
}
