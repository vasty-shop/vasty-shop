// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'vendor_profile_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

VendorProfileModel _$VendorProfileModelFromJson(Map<String, dynamic> json) =>
    VendorProfileModel(
      id: json['id'] as String,
      email: json['email'] as String,
      firstName: json['firstName'] as String?,
      lastName: json['lastName'] as String?,
      phone: json['phone'] as String?,
      address: json['address'] as String?,
      avatar: json['avatar'] as String?,
      bio: json['bio'] as String?,
      createdAt: json['createdAt'] as String?,
      updatedAt: json['updatedAt'] as String?,
    );

Map<String, dynamic> _$VendorProfileModelToJson(VendorProfileModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'email': instance.email,
      'firstName': instance.firstName,
      'lastName': instance.lastName,
      'phone': instance.phone,
      'address': instance.address,
      'avatar': instance.avatar,
      'bio': instance.bio,
      'createdAt': instance.createdAt,
      'updatedAt': instance.updatedAt,
    };
