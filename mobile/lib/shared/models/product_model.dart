import 'package:json_annotation/json_annotation.dart';


part 'product_model.g.dart';

@JsonSerializable()
class ProductModel {
  final String id;
  final String name;
  final String brand;
  final double price;
  final double? salePrice;
  final int? discountPercent;
  final List<String> images;
  final String? model3d;
  final List<String> sizes;
  final double rating;
  final int? reviewCount;
  final int? soldCount;
  final String category;
  final String? description;
  final Map<String, dynamic>? characteristics;
  final List<String>? colors;
  final int? stock;
  final String? sku;
  final String? shopId;
  final String? shopName;
  final ProductShopModel? shop;
  final bool? isNew;
  final bool? isFeatured;
  final String? status; // 'active', 'draft', 'archived'
  final String? createdAt;

  ProductModel({
    required this.id,
    required this.name,
    required this.brand,
    required this.price,
    this.salePrice,
    this.discountPercent,
    required this.images,
    this.model3d,
    required this.sizes,
    required this.rating,
    this.reviewCount,
    this.soldCount,
    required this.category,
    this.description,
    this.characteristics,
    this.colors,
    this.stock,
    this.sku,
    this.shopId,
    this.shopName,
    this.shop,
    this.isNew,
    this.isFeatured,
    this.status,
    this.createdAt,
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    // Parse images - handle both array of strings and array of objects
    List<String> imageList = [];
    if (json['images'] != null) {
      if (json['images'] is List) {
        final images = json['images'] as List;
        imageList = images.map((img) {
          if (img is String) {
            return img;
          } else if (img is Map) {
            return img['url'] as String? ?? '';
          }
          return '';
        }).where((url) => url.isNotEmpty).toList();
      }
    }

    // Parse price - handle both string and number
    double parsePrice(dynamic value) {
      if (value == null) return 0.0;
      if (value is num) return value.toDouble();
      if (value is String) {
        return double.tryParse(value) ?? 0.0;
      }
      return 0.0;
    }

    // Parse rating - handle both string and number
    double parseRating(dynamic value) {
      if (value == null) return 0.0;
      if (value is num) return value.toDouble();
      if (value is String) {
        return double.tryParse(value) ?? 0.0;
      }
      return 0.0;
    }

    // Parse sizes from variants or default
    List<String> sizesList = [];
    if (json['variants'] != null && json['variants'] is List) {
      final variants = json['variants'] as List;
      sizesList = variants
          .map((v) => v['size'] as String?)
          .where((s) => s != null)
          .cast<String>()
          .toList();
    }
    if (sizesList.isEmpty) {
      sizesList = ['S', 'M', 'L', 'XL']; // Default sizes
    }

    // Parse colors from variants or attributes
    List<String>? colorsList;
    if (json['variants'] != null && json['variants'] is List) {
      final variants = json['variants'] as List;
      final colors = variants
          .map((v) => v['color'] as String?)
          .where((c) => c != null)
          .cast<String>()
          .toSet()
          .toList();
      if (colors.isNotEmpty) {
        colorsList = colors;
      }
    }

    final price = parsePrice(json['price']);
    final salePrice = parsePrice(json['salePrice']);
    final rating = parseRating(json['rating']);

    return ProductModel(
      id: json['id'] as String,
      name: json['name'] as String? ?? 'Unknown Product',
      brand: json['brand'] as String? ?? json['shopName'] as String? ?? 'Unknown Brand',
      price: price,
      salePrice: salePrice > 0 ? salePrice : null,
      discountPercent: json['discountPercent'] as int?,
      images: imageList.isNotEmpty ? imageList : ['https://via.placeholder.com/400'],
      model3d: json['model3d'] as String?,
      sizes: sizesList,
      rating: rating,
      reviewCount: json['totalReviews'] as int? ?? json['reviewCount'] as int? ?? 0,
      soldCount: json['totalSales'] as int? ?? json['soldCount'] as int?,
      category: json['category'] as String? ??
                (json['categories'] is List && (json['categories'] as List).isNotEmpty
                  ? (json['categories'] as List).first.toString()
                  : 'Uncategorized'),
      description: json['description'] as String?,
      characteristics: json['characteristics'] as Map<String, dynamic>?,
      colors: colorsList,
      stock: json['stock'] as int?,
      sku: json['sku'] as String?,
      shopId: json['shopId'] as String?,
      shopName: json['shopName'] as String?,
      shop: json['shop'] != null
          ? ProductShopModel.fromJson(json['shop'] as Map<String, dynamic>)
          : null,
      isNew: json['isNew'] as bool? ?? false,
      isFeatured: json['isFeatured'] as bool? ?? false,
      status: json['status'] as String?,
      createdAt: json['createdAt'] as String?,
    );
  }

  Map<String, dynamic> toJson() => _$ProductModelToJson(this);

  // Helper methods
  String get displayPrice {
    if (salePrice != null && salePrice! < price) {
      return '\$${salePrice!.toStringAsFixed(2)}';
    }
    return '\$${price.toStringAsFixed(2)}';
  }

  String? get originalPrice {
    if (salePrice != null && salePrice! < price) {
      return '\$${price.toStringAsFixed(2)}';
    }
    return null;
  }

  bool get hasDiscount => salePrice != null && salePrice! < price;

  bool get isInStock => stock == null || stock! > 0;

  String get stockStatus {
    if (stock == null) return 'In Stock';
    if (stock! <= 0) return 'Out of Stock';
    if (stock! < 10) return 'Low Stock';
    return 'In Stock';
  }

  String get mainImage => images.isNotEmpty ? images.first : '';

  double get effectivePrice => salePrice ?? price;
}

@JsonSerializable()
class ProductShopModel {
  final String id;
  final String name;
  final String? slug;
  final String? logo;
  final bool? isVerified;

  ProductShopModel({
    required this.id,
    required this.name,
    this.slug,
    this.logo,
    this.isVerified,
  });

  factory ProductShopModel.fromJson(Map<String, dynamic> json) =>
      _$ProductShopModelFromJson(json);
  Map<String, dynamic> toJson() => _$ProductShopModelToJson(this);
}

@JsonSerializable()
class CategoryModel {
  final String id;
  final String name;
  final String slug;
  final String? description;
  final String? image;
  final String? icon;
  final int? productCount;
  final bool? isActive;

  CategoryModel({
    required this.id,
    required this.name,
    required this.slug,
    this.description,
    this.image,
    this.icon,
    this.productCount,
    this.isActive,
  });

  factory CategoryModel.fromJson(Map<String, dynamic> json) =>
      _$CategoryModelFromJson(json);
  Map<String, dynamic> toJson() => _$CategoryModelToJson(this);
}
