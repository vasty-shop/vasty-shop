import 'package:dio/dio.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/constants/api_constants.dart';
import '../../../../core/errors/error_handler.dart';
import '../models/login_request.dart';
import '../models/register_request.dart';
import '../models/auth_response_model.dart';
import '../models/user_model.dart';


import 'package:easy_localization/easy_localization.dart';class AuthRepository {
  final DioClient _dioClient = DioClient.instance;

  /// Login user with email and password
  Future<AuthResponseModel> login(LoginRequest request) async {
    try {
      final response = await _dioClient.post(
        ApiConstants.login,
        data: request.toJson(),
      );

      return AuthResponseModel.fromJson(response.data);
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }

  /// Vendor login - returns shop data
  Future<AuthResponseModel> vendorLogin(LoginRequest request) async {
    try {
      final response = await _dioClient.post(
        ApiConstants.vendorLogin,
        data: request.toJson(),
      );

      return AuthResponseModel.fromJson(response.data);
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }

  /// Register a new user
  Future<AuthResponseModel> register(RegisterRequest request) async {
    try {
      final response = await _dioClient.post(
        ApiConstants.register,
        data: request.toJson(),
      );

      return AuthResponseModel.fromJson(response.data);
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }

  /// Get current user profile
  Future<UserModel> getProfile() async {
    try {
      final response = await _dioClient.get(ApiConstants.profile);

      return UserModel.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }

  /// Logout user
  Future<void> logout() async {
    try {
      await _dioClient.post(ApiConstants.logout);
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }

  /// Request password reset
  Future<void> forgotPassword(String email) async {
    try {
      await _dioClient.post(
        ApiConstants.forgotPassword,
        data: {'email': email},
      );
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }

  /// Reset password with token
  Future<void> resetPassword(String token, String newPassword) async {
    try {
      await _dioClient.post(
        ApiConstants.resetPassword,
        data: {
          'token': token,
          'newPassword': newPassword,
        },
      );
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }

  /// Verify email with token
  Future<void> verifyEmail(String token) async {
    try {
      await _dioClient.post(
        '${ApiConstants.verifyEmail}/$token',
      );
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }

  /// Resend verification email
  Future<void> resendVerificationEmail(String email) async {
    try {
      await _dioClient.post(
        ApiConstants.resendVerification,
        data: {'email': email},
      );
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }
}
