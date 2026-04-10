// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'product_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ProductModel _$ProductModelFromJson(Map<String, dynamic> json) => ProductModel(
  id: json['id'] as String,
  name: json['name'] as String,
  brand: json['brand'] as String,
  price: (json['price'] as num).toDouble(),
  salePrice: (json['salePrice'] as num?)?.toDouble(),
  discountPercent: (json['discountPercent'] as num?)?.toInt(),
  images: (json['images'] as List<dynamic>).map((e) => e as String).toList(),
  model3d: json['model3d'] as String?,
  sizes: (json['sizes'] as List<dynamic>).map((e) => e as String).toList(),
  rating: (json['rating'] as num).toDouble(),
  reviewCount: (json['reviewCount'] as num?)?.toInt(),
  soldCount: (json['soldCount'] as num?)?.toInt(),
  category: json['category'] as String,
  description: json['description'] as String?,
  characteristics: json['characteristics'] as Map<String, dynamic>?,
  colors: (json['colors'] as List<dynamic>?)?.map((e) => e as String).toList(),
  stock: (json['stock'] as num?)?.toInt(),
  sku: json['sku'] as String?,
  shopId: json['shopId'] as String?,
  shopName: json['shopName'] as String?,
  shop: json['shop'] == null
      ? null
      : ProductShopModel.fromJson(json['shop'] as Map<String, dynamic>),
  isNew: json['isNew'] as bool?,
  isFeatured: json['isFeatured'] as bool?,
  status: json['status'] as String?,
  createdAt: json['createdAt'] as String?,
);

Map<String, dynamic> _$ProductModelToJson(ProductModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'brand': instance.brand,
      'price': instance.price,
      'salePrice': instance.salePrice,
      'discountPercent': instance.discountPercent,
      'images': instance.images,
      'model3d': instance.model3d,
      'sizes': instance.sizes,
      'rating': instance.rating,
      'reviewCount': instance.reviewCount,
      'soldCount': instance.soldCount,
      'category': instance.category,
      'description': instance.description,
      'characteristics': instance.characteristics,
      'colors': instance.colors,
      'stock': instance.stock,
      'sku': instance.sku,
      'shopId': instance.shopId,
      'shopName': instance.shopName,
      'shop': instance.shop,
      'isNew': instance.isNew,
      'isFeatured': instance.isFeatured,
      'status': instance.status,
      'createdAt': instance.createdAt,
    };

ProductShopModel _$ProductShopModelFromJson(Map<String, dynamic> json) =>
    ProductShopModel(
      id: json['id'] as String,
      name: json['name'] as String,
      slug: json['slug'] as String?,
      logo: json['logo'] as String?,
      isVerified: json['isVerified'] as bool?,
    );

Map<String, dynamic> _$ProductShopModelToJson(ProductShopModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'slug': instance.slug,
      'logo': instance.logo,
      'isVerified': instance.isVerified,
    };

CategoryModel _$CategoryModelFromJson(Map<String, dynamic> json) =>
    CategoryModel(
      id: json['id'] as String,
      name: json['name'] as String,
      slug: json['slug'] as String,
      description: json['description'] as String?,
      image: json['image'] as String?,
      icon: json['icon'] as String?,
      productCount: (json['productCount'] as num?)?.toInt(),
      isActive: json['isActive'] as bool?,
    );

Map<String, dynamic> _$CategoryModelToJson(CategoryModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'slug': instance.slug,
      'description': instance.description,
      'image': instance.image,
      'icon': instance.icon,
      'productCount': instance.productCount,
      'isActive': instance.isActive,
    };
