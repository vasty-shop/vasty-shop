import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:image_picker/image_picker.dart';
import '../../../../../core/network/dio_client.dart';
import '../../../../../core/constants/api_constants.dart';
import '../../../../../core/constants/app_constants.dart';
import '../../../../../core/errors/error_handler.dart';
import '../models/address_model.dart';


class ProfileRepository {
  final DioClient _dioClient = DioClient.instance;

  /// Update user profile
  Future<Map<String, dynamic>> updateProfile({
    String? firstName,
    String? lastName,
    String? email,
    String? phone,
  }) async {
    try {
      // Build name from firstName and lastName
      final name = [firstName, lastName].where((s) => s != null && s.isNotEmpty).join(' ');

      debugPrint('📝 Updating profile: firstName=$firstName, lastName=$lastName, email=$email, phone=$phone');

      final shopId = AppConstants.shopId;
      final endpoint = '${ApiConstants.storeProfile}/$shopId/profile';

      final response = await _dioClient.dio.put(
        endpoint,
        data: {
          if (name.isNotEmpty) 'name': name,
          if (email != null && email.isNotEmpty) 'email': email,
          if (phone != null && phone.isNotEmpty) 'phone': phone,
          'metadata': {
            if (firstName != null) 'firstName': firstName,
            if (lastName != null) 'lastName': lastName,
            if (phone != null) 'phone': phone,
          },
        },
      );

      debugPrint('✅ Profile updated successfully');

      return response.data is Map ? response.data as Map<String, dynamic> : {};
    } on DioException catch (e) {
      debugPrint('❌ Error updating profile: $e');
      throw ErrorHandler.handleError(e);
    }
  }

  /// Upload avatar image
  Future<String> uploadAvatar(XFile imageFile) async {
    try {
      debugPrint('📤 Uploading avatar: ${imageFile.path}');

      // Create multipart form data
      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(
          imageFile.path,
          filename: imageFile.name,
        ),
      });

      // Upload to product image endpoint (reusing existing endpoint)
      final response = await _dioClient.dio.post(
        '/products/upload-image',
        data: formData,
      );

      debugPrint('✅ Avatar uploaded: ${response.data}');

      // Extract image URL from response
      String imageUrl;
      if (response.data is Map && response.data['url'] != null) {
        imageUrl = response.data['url'];
      } else if (response.data is Map && response.data['data'] != null && response.data['data']['url'] != null) {
        imageUrl = response.data['data']['url'];
      } else {
        throw Exception('Invalid response format: no URL found');
      }

      // Update profile with new avatar URL
      final shopId = AppConstants.shopId;
      final endpoint = '${ApiConstants.storeProfile}/$shopId/profile';
      await _dioClient.dio.put(
        endpoint,
        data: {
          'avatarUrl': imageUrl,
        },
      );

      return imageUrl;
    } on DioException catch (e) {
      debugPrint('❌ Error uploading avatar: $e');
      throw ErrorHandler.handleError(e);
    }
  }

  /// Get all delivery addresses
  Future<List<AddressModel>> getAddresses() async {
    try {
      debugPrint('📍 Fetching delivery addresses');

      final response = await _dioClient.dio.get('/delivery/addresses');

      debugPrint('✅ Addresses response: ${response.data}');

      // Handle response format
      List<dynamic> addressesData;
      if (response.data is Map && response.data['data'] != null) {
        if (response.data['data'] is List) {
          addressesData = response.data['data'];
        } else if (response.data['data'] is Map && response.data['data']['data'] != null) {
          addressesData = response.data['data']['data'];
        } else {
          addressesData = [];
        }
      } else if (response.data is List) {
        addressesData = response.data;
      } else {
        addressesData = [];
      }

      debugPrint('📍 Found ${addressesData.length} addresses');

      return addressesData
          .map((json) => AddressModel.fromJson(json as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      debugPrint('❌ Error fetching addresses: $e');
      throw ErrorHandler.handleError(e);
    }
  }

  /// Create new delivery address
  Future<AddressModel> createAddress(AddressModel address) async {
    try {
      debugPrint('📍 Creating address: ${address.toJson()}');

      final response = await _dioClient.dio.post(
        '/delivery/addresses',
        data: address.toJson(),
      );

      debugPrint('✅ Address created: ${response.data}');

      Map<String, dynamic> addressData;
      if (response.data is Map && response.data['data'] != null) {
        addressData = response.data['data'];
      } else if (response.data is Map) {
        addressData = response.data;
      } else {
        throw Exception('Invalid response format');
      }

      return AddressModel.fromJson(addressData);
    } on DioException catch (e) {
      debugPrint('❌ Error creating address: $e');
      throw ErrorHandler.handleError(e);
    }
  }

  /// Update delivery address
  Future<AddressModel> updateAddress(String id, AddressModel address) async {
    try {
      debugPrint('📍 Updating address $id: ${address.toJson()}');

      final response = await _dioClient.dio.put(
        '/delivery/addresses/$id',
        data: address.toJson(),
      );

      debugPrint('✅ Address updated: ${response.data}');

      Map<String, dynamic> addressData;
      if (response.data is Map && response.data['data'] != null) {
        addressData = response.data['data'];
      } else if (response.data is Map) {
        addressData = response.data;
      } else {
        throw Exception('Invalid response format');
      }

      return AddressModel.fromJson(addressData);
    } on DioException catch (e) {
      debugPrint('❌ Error updating address: $e');
      throw ErrorHandler.handleError(e);
    }
  }

  /// Delete delivery address
  Future<void> deleteAddress(String id) async {
    try {
      debugPrint('📍 Deleting address: $id');

      await _dioClient.dio.delete('/delivery/addresses/$id');

      debugPrint('✅ Address deleted');
    } on DioException catch (e) {
      debugPrint('❌ Error deleting address: $e');
      throw ErrorHandler.handleError(e);
    }
  }

  /// Set default address
  Future<void> setDefaultAddress(String id) async {
    try {
      debugPrint('📍 Setting default address: $id');

      await _dioClient.dio.patch('/delivery/addresses/$id/default');

      debugPrint('✅ Default address set');
    } on DioException catch (e) {
      debugPrint('❌ Error setting default address: $e');
      throw ErrorHandler.handleError(e);
    }
  }
}
