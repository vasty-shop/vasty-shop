import 'package:dio/dio.dart';
import 'app_exception.dart';

class ErrorHandler {
  static AppException handleError(dynamic error) {
    if (error is DioException) {
      return _handleDioError(error);
    } else if (error is AppException) {
      return error;
    } else {
      return AppException(
        message: 'An unexpected error occurred',
        details: error.toString(),
      );
    }
  }

  static AppException _handleDioError(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return NetworkException(
          message: 'Connection timeout. Please check your internet connection.',
          code: 'TIMEOUT',
        );

      case DioExceptionType.badResponse:
        return _handleResponseError(error);

      case DioExceptionType.cancel:
        return NetworkException(
          message: 'Request was cancelled',
          code: 'CANCELLED',
        );

      case DioExceptionType.unknown:
        if (error.error.toString().contains('SocketException')) {
          return NetworkException(
            message: 'No internet connection',
            code: 'NO_CONNECTION',
          );
        }
        return NetworkException(
          message: 'Network error occurred',
          code: 'NETWORK_ERROR',
          details: error.message,
        );

      default:
        return AppException(
          message: 'Something went wrong',
          details: error.message,
        );
    }
  }

  static AppException _handleResponseError(DioException error) {
    final statusCode = error.response?.statusCode;
    final data = error.response?.data;

    String message = 'An error occurred';
    String? code;
    dynamic details;

    if (data is Map<String, dynamic>) {
      message = data['message'] ?? data['error'] ?? message;
      code = data['code'];
      details = data['details'];
    }

    switch (statusCode) {
      case 400:
        return ValidationException(
          message: message,
          code: code ?? 'BAD_REQUEST',
          errors: data is Map<String, dynamic> ? _extractValidationErrors(data) : null,
        );

      case 401:
        return UnauthorizedException(
          message: message.isNotEmpty ? message : 'Please login to continue',
          code: code ?? 'UNAUTHORIZED',
          details: details,
        );

      case 403:
        return AppException(
          message: message.isNotEmpty ? message : 'Access forbidden',
          code: code ?? 'FORBIDDEN',
          details: details,
        );

      case 404:
        return AppException(
          message: message.isNotEmpty ? message : 'Resource not found',
          code: code ?? 'NOT_FOUND',
          details: details,
        );

      case 409:
        return AppException(
          message: message,
          code: code ?? 'CONFLICT',
          details: details,
        );

      case 422:
        return ValidationException(
          message: message,
          code: code ?? 'VALIDATION_ERROR',
          errors: _extractValidationErrors(data),
          details: details,
        );

      case 500:
      case 502:
      case 503:
        return ServerException(
          message: 'Server error. Please try again later.',
          statusCode: statusCode,
          code: code ?? 'SERVER_ERROR',
          details: details,
        );

      default:
        return ServerException(
          message: message,
          statusCode: statusCode,
          code: code,
          details: details,
        );
    }
  }

  static Map<String, List<String>>? _extractValidationErrors(dynamic data) {
    if (data is! Map<String, dynamic>) return null;

    final errors = <String, List<String>>{};

    if (data['errors'] is Map) {
      final errorMap = data['errors'] as Map<String, dynamic>;
      errorMap.forEach((key, value) {
        if (value is List) {
          errors[key] = value.map((e) => e.toString()).toList();
        } else if (value is String) {
          errors[key] = [value];
        }
      });
    }

    return errors.isEmpty ? null : errors;
  }

  static String getErrorMessage(dynamic error) {
    final exception = handleError(error);
    return exception.message;
  }
}
