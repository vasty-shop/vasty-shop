import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../../../../core/network/dio_client.dart';
import '../../../../../core/constants/app_constants.dart';
import '../models/vendor_statistics_model.dart';
import 'dart:convert';

class VendorStatisticsRepository {
  final DioClient _dioClient = DioClient.instance;
  final FlutterSecureStorage _secureStorage = const FlutterSecureStorage();

  /// Get shop ID from stored user data
  Future<String?> _getShopId() async {
    try {
      final userDataJson = await _secureStorage.read(key: AppConstants.userDataKey);
      if (userDataJson != null && userDataJson.isNotEmpty) {
        final userMap = jsonDecode(userDataJson) as Map<String, dynamic>;
        return userMap['metadata']?['shopId'] as String?;
      }
    } catch (e) {
      debugPrint('⚠️ Error getting shop ID: $e');
    }
    return null;
  }

  /// Get vendor shop statistics
  Future<VendorStatistics> getStatistics({String? timeRange}) async {
    Map<String, dynamic> statsData = {};

    try {
      debugPrint('📊 Fetching vendor statistics...');
      debugPrint('   Time range: ${timeRange ?? 'all'}');

      final queryParams = <String, dynamic>{
        if (timeRange != null) 'timeRange': timeRange,
      };

      final response = await _dioClient.get(
        '/shops/current/statistics',
        queryParameters: queryParams,
      );

      debugPrint('✅ Statistics API Response received');
      debugPrint('   Response: ${response.data}');

      // Handle response format
      if (response.data is Map && response.data['data'] != null) {
        statsData = response.data['data'] as Map<String, dynamic>;
      } else if (response.data is Map) {
        statsData = response.data as Map<String, dynamic>;
      }
    } on DioException catch (e) {
      debugPrint('⚠️ Statistics API error: ${e.response?.statusCode}');
      debugPrint('   Will use fallback data from individual endpoints');
      // Continue with empty statsData - will fetch from individual endpoints
    } catch (e) {
      debugPrint('⚠️ Unexpected error fetching statistics: $e');
      // Continue with empty statsData
    }

    // Check if we need to fetch products (either stats API failed or returned 0)
    final productsTotal = statsData['products'] != null && statsData['products'] is Map
        ? (statsData['products']['total'] ?? 0)
        : 0;

    debugPrint('📦 Products total from stats API: $productsTotal');

    if (productsTotal == 0) {
      debugPrint('📦 Fetching actual products list...');
      try {
        final shopId = await _getShopId();
        debugPrint('📦 Shop ID: $shopId');

        final productsResponse = await _dioClient.get(
          '/products/shop',
          queryParameters: {
            'offset': 0,
            'limit': 100,
          },
          options: Options(
            headers: {
              if (shopId != null) 'x-shop-id': shopId,
            },
          ),
        );

        List<dynamic> productsData = [];
        int total = 0;

        if (productsResponse.data is Map && productsResponse.data['data'] != null) {
          productsData = productsResponse.data['data'] as List;
          total = productsResponse.data['total'] ?? productsData.length;
        } else if (productsResponse.data is List) {
          productsData = productsResponse.data as List;
          total = productsData.length;
        }

        debugPrint('✅ Found $total total products, ${productsData.length} in response');

        // Update statsData with actual products info
        statsData['products'] = {
          'total': total,
          'active': productsData.length,
        };
      } catch (e) {
        debugPrint('⚠️ Error fetching products: $e');
        statsData['products'] = {'total': 0, 'active': 0};
      }
    }

    // Ensure all required fields have defaults
    statsData['revenue'] ??= {'total': 0};
    statsData['orders'] ??= {'total': 0};
    statsData['customers'] ??= {'total': 0};
    statsData['products'] ??= {'total': 0, 'active': 0};

    // Map topProducts from root level to products.topProducts if not present
    if (statsData['topProducts'] != null && statsData['products']['topProducts'] == null) {
      statsData['products']['topProducts'] = statsData['topProducts'];
    }

    debugPrint('📊 Final stats data: revenue=${statsData['revenue']}, earnings=${statsData['earnings']}, topProducts=${statsData['topProducts']?.length ?? 0}');

    return VendorStatistics.fromJson(statsData);
  }
}
