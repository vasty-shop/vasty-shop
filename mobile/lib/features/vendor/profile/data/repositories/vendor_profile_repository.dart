import 'package:dio/dio.dart';
import '../../../../../core/network/dio_client.dart';
import '../../../../../core/constants/api_constants.dart';
import '../models/vendor_profile_model.dart';

class VendorProfileRepository {
  final DioClient _dioClient = DioClient.instance;

  /// Get vendor profile
  Future<VendorProfileModel> getProfile() async {
    try {
      final response = await _dioClient.get(ApiConstants.vendorProfile);

      if (response.statusCode == 200) {
        final data = response.data;
        // Handle both direct response and wrapped response
        final profileData = data['data'] ?? data;
        return VendorProfileModel.fromJson(profileData);
      }

      throw Exception('Failed to load profile');
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Update vendor profile
  Future<VendorProfileModel> updateProfile({
    required VendorProfileModel currentProfile,
    String? firstName,
    String? lastName,
    String? phone,
    String? address,
    String? bio,
    String? avatar,
  }) async {
    try {
      final data = <String, dynamic>{};
      if (firstName != null) data['firstName'] = firstName;
      if (lastName != null) data['lastName'] = lastName;
      if (phone != null) data['phone'] = phone;
      if (address != null) data['address'] = address;
      if (bio != null) data['bio'] = bio;
      if (avatar != null) data['avatar'] = avatar;

      final response = await _dioClient.put(
        ApiConstants.vendorProfile,
        data: data,
      );

      if (response.statusCode == 200) {
        final responseData = response.data;
        final profileData = responseData['data'] ?? responseData;

        // Merge response with current profile to preserve id and other fields
        return currentProfile.copyWith(
          firstName: profileData['firstName'] ?? currentProfile.firstName,
          lastName: profileData['lastName'] ?? currentProfile.lastName,
          phone: profileData['phone'] ?? currentProfile.phone,
          address: profileData['address'] ?? currentProfile.address,
          bio: profileData['bio'] ?? currentProfile.bio,
          avatar: profileData['avatar'] ?? currentProfile.avatar,
          updatedAt: profileData['updatedAt'] ?? DateTime.now().toIso8601String(),
        );
      }

      throw Exception('Failed to update profile');
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Upload avatar
  Future<String> uploadAvatar(String filePath) async {
    try {
      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(filePath),
      });

      final response = await _dioClient.post(
        '${ApiConstants.vendorProfile}/avatar',
        data: formData,
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = response.data;
        // Return the URL from response
        return data['url'] ?? data['data']?['url'] ?? '';
      }

      throw Exception('Failed to upload avatar');
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Delete account
  Future<void> deleteAccount() async {
    try {
      final response = await _dioClient.delete('/auth/vendor/account');

      if (response.statusCode != 200 && response.statusCode != 204) {
        throw Exception('Failed to delete account');
      }
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Exception _handleError(DioException e) {
    if (e.response != null) {
      final data = e.response!.data;
      if (data is Map && data['message'] != null) {
        return Exception(data['message']);
      }
    }
    return Exception(e.message ?? 'An error occurred');
  }
}
