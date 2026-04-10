import 'package:dio/dio.dart';
import '../../core/network/dio_client.dart';
import '../../core/constants/api_constants.dart';
import '../../core/errors/error_handler.dart';
import '../models/cart_item_model.dart';
import '../models/product_model.dart';


import 'package:easy_localization/easy_localization.dart';class CartRepository {
  final DioClient _dioClient = DioClient.instance;

  /// Transform backend cart item to CartItemModel
  CartItemModel _transformCartItem(Map<String, dynamic> backendItem) {
    // Backend returns flat structure, we need nested product
    return CartItemModel(
      id: backendItem['id'] as String,
      quantity: backendItem['quantity'] as int,
      size: backendItem['size'] as String? ?? '',
      color: backendItem['color'] as String?,
      product: ProductModel(
        id: backendItem['productId'] as String,
        name: backendItem['name'] as String,
        brand: backendItem['brand'] as String? ?? '',
        price: double.tryParse(backendItem['price'].toString()) ?? 0.0,
        salePrice: backendItem['salePrice'] != null
            ? double.tryParse(backendItem['salePrice'].toString())
            : null,
        images: [backendItem['image'] as String? ?? ''],
        description: backendItem['description'] as String? ?? '',
        category: backendItem['category'] as String? ?? '',
        shopId: backendItem['shopId'] as String? ?? '',
        shopName: backendItem['shopName'] as String?,
        rating: 0.0,
        sizes: [],
      ),
    );
  }

  /// Get cart items
  Future<List<CartItemModel>> getCart() async {
    try {
      final response = await _dioClient.get(ApiConstants.cart);

      List<dynamic> cartData;
      if (response.data is Map) {
        if (response.data['items'] != null) {
          cartData = response.data['items'] as List;
        } else if (response.data['data'] != null) {
          if (response.data['data']['items'] != null) {
            cartData = response.data['data']['items'] as List;
          } else if (response.data['data'] is List) {
            cartData = response.data['data'] as List;
          } else {
            cartData = [];
          }
        } else {
          cartData = [];
        }
      } else if (response.data is List) {
        cartData = response.data as List;
      } else {
        cartData = [];
      }

      return cartData
          .map((json) => _transformCartItem(json as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }

  /// Add item to cart
  Future<List<CartItemModel>> addToCart({
    required String productId,
    required int quantity,
    String? size,
    String? color,
    String? shopId,
  }) async {
    try {
      // Build variant object matching frontend structure
      Map<String, dynamic>? variant;
      if (size != null || color != null) {
        variant = {};
        if (size != null) variant['size'] = size;
        if (color != null) variant['color'] = color;
      }

      final response = await _dioClient.post(
        ApiConstants.addToCart,
        data: {
          'productId': productId,
          'quantity': quantity,
          if (variant != null) 'variant': variant,
        },
        options: shopId != null
            ? Options(headers: {'x-shop-id': shopId})
            : null,
      );

      // Backend returns entire cart object with items array
      List<dynamic> cartItems;
      if (response.data is Map) {
        if (response.data['items'] != null) {
          cartItems = response.data['items'] as List;
        } else if (response.data['data'] != null && response.data['data']['items'] != null) {
          cartItems = response.data['data']['items'] as List;
        } else {
          throw Exception('No items in cart response');
        }
      } else {
        throw Exception('Invalid cart response format');
      }

      return cartItems
          .map((json) => _transformCartItem(json as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }

  /// Update cart item quantity
  Future<List<CartItemModel>> updateCartItem({
    required String itemId,
    required int quantity,
  }) async {
    try {
      final response = await _dioClient.put(
        '${ApiConstants.updateCartItem}/$itemId',
        data: {'quantity': quantity},
      );

      // Backend returns entire cart object with items array
      List<dynamic> cartItems;
      if (response.data is Map) {
        if (response.data['items'] != null) {
          cartItems = response.data['items'] as List;
        } else if (response.data['data'] != null && response.data['data']['items'] != null) {
          cartItems = response.data['data']['items'] as List;
        } else {
          throw Exception('No items in cart response');
        }
      } else {
        throw Exception('Invalid cart response format');
      }

      return cartItems
          .map((json) => _transformCartItem(json as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }

  /// Remove item from cart
  Future<void> removeFromCart(String itemId) async {
    try {
      await _dioClient.delete('${ApiConstants.removeFromCart}/$itemId');
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }

  /// Clear entire cart
  Future<void> clearCart() async {
    try {
      await _dioClient.delete(ApiConstants.clearCart);
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }
}
