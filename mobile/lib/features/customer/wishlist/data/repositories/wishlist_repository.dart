import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../../../../../core/network/dio_client.dart';
import '../../../../../core/constants/api_constants.dart';
import '../../../../../core/errors/error_handler.dart';

class WishlistRepository {
  final DioClient _dioClient = DioClient.instance;

  // Store the current wishlist ID for remove operations
  String? _currentWishlistId;

  /// Get all wishlist items with full product details
  Future<List<dynamic>> getWishlist() async {
    try {
      // Debug: Log API call
      debugPrint('❤️ Loading wishlist...');
      debugPrint('   Endpoint: ${ApiConstants.wishlist}');

      final response = await _dioClient.get(ApiConstants.wishlist);

      // Debug: Log response
      debugPrint('✅ Wishlist API Response received');
      debugPrint('   Response data type: ${response.data.runtimeType}');
      debugPrint('   Response data: ${response.data}');

      // Extract wishlist data from response
      List<dynamic> wishlists = [];
      if (response.data is Map && response.data['data'] != null) {
        wishlists = response.data['data'] as List;
      } else if (response.data is List) {
        wishlists = response.data as List;
      }

      debugPrint('   Wishlists count: ${wishlists.length}');

      // Get the first/default wishlist
      if (wishlists.isEmpty) {
        debugPrint('   No wishlists found');
        return [];
      }

      final wishlist = wishlists.first as Map<String, dynamic>;
      final products = wishlist['products'] as List? ?? [];

      // Store the wishlist ID for later remove operations
      _currentWishlistId = wishlist['id'] as String?;
      debugPrint('   Wishlist ID: $_currentWishlistId');
      debugPrint('   Product references in wishlist: ${products.length}');

      // Fetch full product details for each product ID
      final List<Map<String, dynamic>> wishlistItems = [];

      for (final productRef in products) {
        // Handle both snake_case (from backend) and camelCase keys
        final productId = (productRef['product_id'] ?? productRef['productId']) as String?;
        final addedAt = (productRef['added_at'] ?? productRef['addedAt']) as String?;

        if (productId == null || productId.isEmpty) {
          debugPrint('   ⚠️ Skipping item with null productId');
          continue;
        }

        try {
          debugPrint('   Fetching product details for: $productId');

          final productResponse = await _dioClient.get(
            '${ApiConstants.productDetail}/$productId',
          );

          Map<String, dynamic> productData;
          if (productResponse.data is Map && productResponse.data['data'] != null) {
            productData = productResponse.data['data'] as Map<String, dynamic>;
          } else if (productResponse.data is Map) {
            productData = productResponse.data as Map<String, dynamic>;
          } else {
            debugPrint('   ⚠️ Invalid product data format for $productId');
            continue;
          }

          // Create wishlist item with full product details
          wishlistItems.add({
            'product': productData,
            'addedAt': addedAt ?? DateTime.now().toIso8601String(),
            'priceAtAdd': productData['salePrice'] ?? productData['price'] ?? 0,
          });
        } catch (e) {
          debugPrint('   ❌ Failed to fetch product $productId: $e');
          // Continue with other products even if one fails
          continue;
        }
      }

      debugPrint('   Successfully loaded ${wishlistItems.length} wishlist items with product details');

      return wishlistItems;
    } on DioException catch (e) {
      debugPrint('❌ Error loading wishlist: $e');
      debugPrint('   Status code: ${e.response?.statusCode}');
      debugPrint('   Response: ${e.response?.data}');
      throw ErrorHandler.handleError(e);
    }
  }

  /// Add product to wishlist
  Future<void> addToWishlist(String productId) async {
    try {
      await _dioClient.post(
        ApiConstants.addToWishlist,
        data: {'productId': productId},
      );
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }

  /// Remove product from wishlist
  /// Note: We don't pass wishlistId to let the backend find the default wishlist
  /// for the current user. This avoids issues with stale wishlist IDs from previous sessions.
  Future<void> removeFromWishlist(String productId) async {
    try {
      debugPrint('🗑️ Removing from wishlist...');
      debugPrint('   Product ID: $productId');
      debugPrint('   Endpoint: ${ApiConstants.removeFromWishlist}/$productId');

      // Don't pass wishlistId - let backend find the default wishlist for current user
      final response = await _dioClient.delete(
        '${ApiConstants.removeFromWishlist}/$productId',
      );

      debugPrint('✅ Remove response: ${response.data}');
    } on DioException catch (e) {
      debugPrint('❌ Error removing from wishlist: $e');
      debugPrint('   Status code: ${e.response?.statusCode}');
      debugPrint('   Response: ${e.response?.data}');
      throw ErrorHandler.handleError(e);
    }
  }
}
