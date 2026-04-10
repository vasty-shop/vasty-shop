import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../../core/network/dio_client.dart';
import '../../core/constants/api_constants.dart';
import '../../core/errors/error_handler.dart';
import '../../features/auth/data/models/shop_model.dart';

class ShopRepository {
  final DioClient _dioClient = DioClient.instance;

  /// Get all active shops
  Future<List<ShopModel>> getShops({
    int page = 1,
    int limit = 20,
    String? search,
    String? status,
  }) async {
    try {
      final offset = (page - 1) * limit;

      final queryParams = <String, dynamic>{
        'offset': offset,
        'limit': limit,
        if (search != null) 'search': search,
        if (status != null) 'status': status,
      };

      final response = await _dioClient.get(
        ApiConstants.shops,
        queryParameters: queryParams,
      );

      // Handle different response formats
      List<dynamic> shopsData;
      if (response.data is Map && response.data['data'] != null) {
        if (response.data['data'] is Map &&
            response.data['data']['data'] != null) {
          shopsData = response.data['data']['data'] as List;
        } else if (response.data['data'] is List) {
          shopsData = response.data['data'] as List;
        } else {
          shopsData = [];
        }
      } else if (response.data is List) {
        shopsData = response.data as List;
      } else {
        shopsData = [];
      }

      return shopsData
          .map((json) => ShopModel.fromJson(json as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }

  /// Get shop by ID
  Future<ShopModel> getShopById(String id) async {
    try {
      final response = await _dioClient.get('${ApiConstants.shopDetail}/$id');

      Map<String, dynamic> shopData;
      if (response.data is Map && response.data['data'] != null) {
        shopData = response.data['data'] as Map<String, dynamic>;
      } else if (response.data is Map) {
        shopData = response.data as Map<String, dynamic>;
      } else {
        throw Exception('Invalid shop data format');
      }

      return ShopModel.fromJson(shopData);
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }

  /// Get shop by slug
  Future<ShopModel> getShopBySlug(String slug) async {
    try {
      final response = await _dioClient.get(
        ApiConstants.shops,
        queryParameters: {'slug': slug},
      );

      List<dynamic> shopsData;
      if (response.data is Map && response.data['data'] != null) {
        if (response.data['data'] is List) {
          shopsData = response.data['data'] as List;
        } else if (response.data['data'] is Map &&
            response.data['data']['data'] != null) {
          shopsData = response.data['data']['data'] as List;
        } else {
          shopsData = [];
        }
      } else if (response.data is List) {
        shopsData = response.data as List;
      } else {
        shopsData = [];
      }

      if (shopsData.isEmpty) {
        throw Exception('Shop not found');
      }

      return ShopModel.fromJson(shopsData.first as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }

  /// Create a new shop
  Future<ShopModel> createShop(Map<String, dynamic> shopData) async {
    try {
      final response = await _dioClient.post(
        ApiConstants.shops,
        data: shopData,
      );

      Map<String, dynamic> createdShopData;
      if (response.data is Map && response.data['data'] != null) {
        createdShopData = response.data['data'] as Map<String, dynamic>;
      } else if (response.data is Map) {
        createdShopData = response.data as Map<String, dynamic>;
      } else {
        throw Exception('Invalid shop creation response');
      }

      return ShopModel.fromJson(createdShopData);
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }

  /// Update shop settings
  Future<ShopModel> updateShop(String shopId, Map<String, dynamic> updateData) async {
    try {
      final response = await _dioClient.put(
        '/shops/current',
        data: updateData,
        options: Options(
          headers: {
            'x-shop-id': shopId,
          },
        ),
      );

      Map<String, dynamic> updatedShopData;
      if (response.data is Map && response.data['data'] != null) {
        updatedShopData = response.data['data'] as Map<String, dynamic>;
      } else if (response.data is Map) {
        updatedShopData = response.data as Map<String, dynamic>;
      } else {
        throw Exception('Invalid shop update response');
      }

      return ShopModel.fromJson(updatedShopData);
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }

  /// Upload shop image (logo or banner)
  Future<String> uploadShopImage(String filePath, String type, String shopId) async {
    try {
      debugPrint('🖼️ Uploading shop $type: $filePath');
      debugPrint('   Shop ID: $shopId');

      // Step 1: Upload file to storage using products endpoint (generic file upload)
      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(filePath),
      });

      final uploadResponse = await _dioClient.post(
        '/products/upload-image',
        data: formData,
        options: Options(
          contentType: Headers.multipartFormDataContentType,
          headers: {
            'x-shop-id': shopId,
          },
        ),
      );

      debugPrint('✅ File uploaded to storage');
      debugPrint('   Response: ${uploadResponse.data}');

      // Extract URL from upload response
      String? imageUrl;
      if (uploadResponse.data is Map) {
        imageUrl = uploadResponse.data['url'] ?? uploadResponse.data['data']?['url'];
      }

      if (imageUrl == null) {
        throw Exception('No URL returned from file upload');
      }

      debugPrint('   Image URL: $imageUrl');

      // Step 2: Update shop with the new image URL
      final updateData = {
        type: imageUrl, // 'logo' or 'banner'
      };

      await _dioClient.put(
        '/shops/current',
        data: updateData,
        options: Options(
          headers: {
            'x-shop-id': shopId,
          },
        ),
      );

      debugPrint('✅ Shop $type updated successfully');

      return imageUrl;
    } on DioException catch (e) {
      debugPrint('❌ Failed to upload shop $type: ${e.message}');
      debugPrint('   Error response: ${e.response?.data}');
      throw ErrorHandler.handleError(e);
    }
  }

  /// Check subdomain availability
  Future<bool> checkSubdomainAvailability(String subdomain) async {
    try {
      final response = await _dioClient.get(
        '/shops/check-subdomain',
        queryParameters: {'subdomain': subdomain},
      );

      if (response.data is Map) {
        return response.data['available'] == true ||
            response.data['data']?['available'] == true;
      }
      return false;
    } on DioException catch (e) {
      // If endpoint not implemented yet, simulate check by searching existing shops
      if (e.response?.statusCode == 500 || e.response?.statusCode == 404) {
        try {
          final shops = await getShops(search: subdomain);
          // If no shop found with this slug, subdomain is available
          return !shops.any((shop) => shop.slug == subdomain);
        } catch (_) {
          // Default to available if we can't verify
          return true;
        }
      }
      throw ErrorHandler.handleError(e);
    }
  }

  /// Verify custom domain
  Future<String> verifyCustomDomain(String domain) async {
    try {
      final response = await _dioClient.post(
        '/shops/verify-domain',
        data: {'domain': domain},
      );

      if (response.data is Map) {
        return response.data['status'] as String? ??
            response.data['data']?['status'] as String? ??
            'not_configured';
      }
      return 'not_configured';
    } on DioException catch (e) {
      // If endpoint not implemented yet, return pending status
      if (e.response?.statusCode == 500 || e.response?.statusCode == 404) {
        return 'pending';
      }
      throw ErrorHandler.handleError(e);
    }
  }
}
