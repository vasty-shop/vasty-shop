import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../../core/network/dio_client.dart';
import '../../core/constants/api_constants.dart';
import '../../core/errors/error_handler.dart';
import '../models/product_model.dart';


import 'package:easy_localization/easy_localization.dart';class ProductRepository {
  final DioClient _dioClient = DioClient.instance;

  /// Get all products with pagination
  Future<List<ProductModel>> getProducts({
    int page = 1,
    int limit = 20,
    String? category,
    String? search,
    double? minPrice,
    double? maxPrice,
    String? sortBy,
    String? shopId,
  }) async {
    try {
      // Calculate offset from page number
      final offset = (page - 1) * limit;

      final queryParams = <String, dynamic>{
        'offset': offset,
        'limit': limit,
        if (category != null) 'category': category,
        if (search != null) 'search': search,
        if (minPrice != null) 'minPrice': minPrice,
        if (maxPrice != null) 'maxPrice': maxPrice,
        if (sortBy != null) 'sortBy': sortBy,
        if (shopId != null) 'shopId': shopId,
      };

      // Debug: Log API call
      debugPrint('🛒 Loading products...');
      debugPrint('   Endpoint: ${ApiConstants.products}');
      debugPrint('   Shop ID: $shopId');
      debugPrint('   Query params: $queryParams');

      final response = await _dioClient.get(
        ApiConstants.products,
        queryParameters: queryParams,
      );

      // Debug: Log response
      debugPrint('✅ Products API Response received');
      debugPrint('   Response data type: ${response.data.runtimeType}');
      debugPrint('   Response data: ${response.data}');

      // Handle different response formats
      List<dynamic> productsData;
      if (response.data is Map && response.data['data'] != null) {
        if (response.data['data'] is Map &&
            response.data['data']['data'] != null) {
          productsData = response.data['data']['data'] as List;
        } else if (response.data['data'] is List) {
          productsData = response.data['data'] as List;
        } else {
          productsData = [];
        }
      } else if (response.data is List) {
        productsData = response.data as List;
      } else {
        productsData = [];
      }

      debugPrint('   Products count: ${productsData.length}');

      return productsData
          .map((json) => ProductModel.fromJson(json as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      debugPrint('❌ Error loading products: $e');
      debugPrint('   Status code: ${e.response?.statusCode}');
      debugPrint('   Response: ${e.response?.data}');
      throw ErrorHandler.handleError(e);
    }
  }

  /// Get vendor's shop products (filtered by shop ID)
  Future<List<ProductModel>> getVendorProducts({
    required String shopId,
    int page = 1,
    int limit = 100,
    String? category,
    String? search,
    String? status,
  }) async {
    try {
      // Calculate offset from page number
      final offset = (page - 1) * limit;

      final queryParams = <String, dynamic>{
        'offset': offset,
        'limit': limit,
        if (category != null) 'category': category,
        if (search != null) 'search': search,
        if (status != null) 'status': status,
      };

      final response = await _dioClient.get(
        ApiConstants.shopProducts,
        queryParameters: queryParams,
        options: Options(
          headers: {
            'x-shop-id': shopId,
          },
        ),
      );

      // Handle different response formats
      List<dynamic> productsData;
      if (response.data is Map && response.data['data'] != null) {
        if (response.data['data'] is Map &&
            response.data['data']['data'] != null) {
          productsData = response.data['data']['data'] as List;
        } else if (response.data['data'] is List) {
          productsData = response.data['data'] as List;
        } else {
          productsData = [];
        }
      } else if (response.data is List) {
        productsData = response.data as List;
      } else {
        productsData = [];
      }

      return productsData
          .map((json) => ProductModel.fromJson(json as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }

  /// Get featured products
  Future<List<ProductModel>> getFeaturedProducts({String? shopId}) async {
    try {
      final queryParams = <String, dynamic>{
        if (shopId != null) 'shopId': shopId,
      };

      final response = await _dioClient.get(
        ApiConstants.featuredProducts,
        queryParameters: queryParams,
      );

      List<dynamic> productsData;
      if (response.data is Map && response.data['data'] != null) {
        productsData = response.data['data'] is List
            ? response.data['data']
            : response.data['data']['data'] ?? [];
      } else if (response.data is List) {
        productsData = response.data;
      } else {
        productsData = [];
      }

      return productsData
          .map((json) => ProductModel.fromJson(json as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }

  /// Get new products
  Future<List<ProductModel>> getNewProducts({String? shopId}) async {
    try {
      final queryParams = <String, dynamic>{
        if (shopId != null) 'shopId': shopId,
      };

      final response = await _dioClient.get(
        ApiConstants.newProducts,
        queryParameters: queryParams,
      );

      List<dynamic> productsData;
      if (response.data is Map && response.data['data'] != null) {
        productsData = response.data['data'] is List
            ? response.data['data']
            : response.data['data']['data'] ?? [];
      } else if (response.data is List) {
        productsData = response.data;
      } else {
        productsData = [];
      }

      return productsData
          .map((json) => ProductModel.fromJson(json as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }

  /// Get product by ID
  Future<ProductModel> getProductById(String id) async {
    try {
      final response = await _dioClient.get('${ApiConstants.productDetail}/$id');

      Map<String, dynamic> productData;
      if (response.data is Map && response.data['data'] != null) {
        productData = response.data['data'] as Map<String, dynamic>;
      } else if (response.data is Map) {
        productData = response.data as Map<String, dynamic>;
      } else {
        throw Exception('Invalid product data format');
      }

      debugPrint('🔍 Product API Response - status field: ${productData['status']}');
      debugPrint('   Full product data keys: ${productData.keys.toList()}');

      return ProductModel.fromJson(productData);
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }

  /// Search products
  Future<List<ProductModel>> searchProducts(String query) async {
    try {
      final response = await _dioClient.get(
        ApiConstants.searchProducts,
        queryParameters: {'q': query},
      );

      List<dynamic> productsData;
      if (response.data is Map && response.data['data'] != null) {
        productsData = response.data['data'] is List
            ? response.data['data']
            : response.data['data']['data'] ?? [];
      } else if (response.data is List) {
        productsData = response.data;
      } else {
        productsData = [];
      }

      return productsData
          .map((json) => ProductModel.fromJson(json as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }

  /// Get all categories
  Future<List<CategoryModel>> getCategories() async {
    try {
      final response = await _dioClient.get(ApiConstants.categories);

      List<dynamic> categoriesData;
      if (response.data is Map && response.data['data'] != null) {
        categoriesData = response.data['data'] is List
            ? response.data['data']
            : response.data['data']['data'] ?? [];
      } else if (response.data is List) {
        categoriesData = response.data;
      } else {
        categoriesData = [];
      }

      return categoriesData
          .map((json) => CategoryModel.fromJson(json as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }

  /// Get category by ID
  Future<CategoryModel> getCategoryById(String id) async {
    try {
      final response =
          await _dioClient.get('${ApiConstants.categoryDetail}/$id');

      Map<String, dynamic> categoryData;
      if (response.data is Map && response.data['data'] != null) {
        categoryData = response.data['data'] as Map<String, dynamic>;
      } else if (response.data is Map) {
        categoryData = response.data as Map<String, dynamic>;
      } else {
        throw Exception('Invalid category data format');
      }

      return CategoryModel.fromJson(categoryData);
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }

  /// Create a new product
  Future<ProductModel> createProduct(
    Map<String, dynamic> productData,
    String shopId, {
    List<String>? imageFiles,
  }) async {
    try {
      // Extract shopId from productData to send in header
      final dataWithoutShopId = Map<String, dynamic>.from(productData);
      dataWithoutShopId.remove('shopId');

      // Step 1: Create product with JSON (no images yet)
      // Use placeholder image if files provided
      if (imageFiles != null && imageFiles.isNotEmpty) {
        dataWithoutShopId['images'] = [
          {
            'url': 'https://via.placeholder.com/400',
            'alt': dataWithoutShopId['name'] ?? 'Product',
            'isPrimary': true,
            'order': 0,
          }
        ];
      }

      final response = await _dioClient.post(
        ApiConstants.products,
        data: dataWithoutShopId,
        options: Options(
          headers: {
            'x-shop-id': shopId,
          },
        ),
      );

      Map<String, dynamic> createdProductData;
      if (response.data is Map && response.data['data'] != null) {
        createdProductData = response.data['data'] as Map<String, dynamic>;
      } else if (response.data is Map) {
        createdProductData = response.data as Map<String, dynamic>;
      } else {
        throw Exception('Invalid product data format');
      }

      // Step 2: Upload images if provided
      if (imageFiles != null && imageFiles.isNotEmpty) {
        final productId = createdProductData['id'] as String;
        final productName = createdProductData['name'] as String? ?? 'Product';

        // Upload images and get URLs
        final uploadedImages = await uploadProductImages(imageFiles, shopId, productName);

        // Update product with actual image URLs
        final updatedProduct = await updateProduct(
          productId,
          {'images': uploadedImages},
          shopId,
        );

        return updatedProduct;
      }

      return ProductModel.fromJson(createdProductData);
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }

  /// Upload a single product image and return the URL
  Future<String> uploadProductImage(String imagePath, String shopId) async {
    try {
      debugPrint('🖼️ Uploading image: $imagePath');

      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(imagePath),
      });

      final response = await _dioClient.post(
        '${ApiConstants.products}/upload-image',
        data: formData,
        options: Options(
          headers: {
            'x-shop-id': shopId,
          },
        ),
      );

      final data = response.data;
      final url = data['url'] ?? data['data']?['url'];

      if (url == null) {
        throw Exception('No URL returned from image upload');
      }

      debugPrint('✅ Image uploaded: $url');
      return url as String;
    } on DioException catch (e) {
      debugPrint('❌ Failed to upload image: ${e.message}');
      throw ErrorHandler.handleError(e);
    }
  }

  /// Upload multiple images and return their URLs
  Future<List<Map<String, dynamic>>> uploadProductImages(
    List<String> imageFiles,
    String shopId,
    String productName,
  ) async {
    final uploadedImages = <Map<String, dynamic>>[];

    for (var i = 0; i < imageFiles.length; i++) {
      try {
        final url = await uploadProductImage(imageFiles[i], shopId);
        uploadedImages.add({
          'url': url,
          'alt': productName,
          'isPrimary': i == 0, // First image is primary
          'order': i,
        });
      } catch (e) {
        debugPrint('❌ Failed to upload image ${imageFiles[i]}: $e');
        // Continue with other images even if one fails
      }
    }

    return uploadedImages;
  }

  /// Update an existing product
  Future<ProductModel> updateProduct(
    String id,
    Map<String, dynamic> productData,
    String shopId,
  ) async {
    try {
      // Extract shopId from productData to send in header
      final dataWithoutShopId = Map<String, dynamic>.from(productData);
      dataWithoutShopId.remove('shopId');

      final response = await _dioClient.put(
        '${ApiConstants.productDetail}/$id',
        data: dataWithoutShopId,
        options: Options(
          headers: {
            'x-shop-id': shopId,
          },
        ),
      );

      Map<String, dynamic> updatedProductData;
      if (response.data is Map && response.data['data'] != null) {
        updatedProductData = response.data['data'] as Map<String, dynamic>;
      } else if (response.data is Map) {
        updatedProductData = response.data as Map<String, dynamic>;
      } else {
        throw Exception('Invalid product data format');
      }

      return ProductModel.fromJson(updatedProductData);
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }

  /// Delete a product
  Future<void> deleteProduct(String id) async {
    try {
      await _dioClient.delete('${ApiConstants.productDetail}/$id');
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }
}
