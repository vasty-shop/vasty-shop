import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../../../../../core/network/dio_client.dart';
import '../../../../../core/errors/error_handler.dart';
import '../../../../../core/constants/app_constants.dart';
import '../models/analytics_models.dart';

class AnalyticsRepository {
  final DioClient _dioClient = DioClient.instance;

  /// Get shop analytics/statistics
  Future<VendorAnalytics> getAnalytics({String? timeRange, String? shopId}) async {
    try {
      final effectiveShopId = shopId ?? AppConstants.shopId;
      debugPrint('📊 Fetching shop analytics...');
      debugPrint('   Shop ID: $effectiveShopId');
      debugPrint('   Time range: ${timeRange ?? 'all'}');

      final queryParams = <String, dynamic>{
        if (timeRange != null) 'timeRange': timeRange,
      };

      final response = await _dioClient.get(
        '/shops/current/statistics',
        queryParameters: queryParams,
        options: Options(headers: {'x-shop-id': effectiveShopId}),
      );

      debugPrint('✅ Analytics fetched successfully');
      debugPrint('   Response: ${response.data}');

      // Handle response format
      Map<String, dynamic> analyticsData;
      if (response.data is Map && response.data['data'] != null) {
        analyticsData = response.data['data'] as Map<String, dynamic>;
      } else if (response.data is Map) {
        analyticsData = response.data as Map<String, dynamic>;
      } else {
        throw Exception('Invalid analytics data format');
      }

      return VendorAnalytics.fromJson(analyticsData);
    } on DioException catch (e) {
      debugPrint('❌ Error fetching analytics: ${e.response?.statusCode}');
      debugPrint('   Error: ${e.response?.data}');
      throw ErrorHandler.handleError(e);
    } catch (e) {
      debugPrint('❌ Unexpected error: $e');
      rethrow;
    }
  }
}
