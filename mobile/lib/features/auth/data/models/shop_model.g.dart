// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'shop_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ShopModel _$ShopModelFromJson(Map<String, dynamic> json) => ShopModel(
  id: json['id'] as String,
  name: json['name'] as String,
  slug: json['slug'] as String,
  logo: json['logo'] as String?,
  banner: json['banner'] as String?,
  status: json['status'] as String,
  isVerified: json['isVerified'] as bool?,
);

Map<String, dynamic> _$ShopModelToJson(ShopModel instance) => <String, dynamic>{
  'id': instance.id,
  'name': instance.name,
  'slug': instance.slug,
  'logo': instance.logo,
  'banner': instance.banner,
  'status': instance.status,
  'isVerified': instance.isVerified,
};
