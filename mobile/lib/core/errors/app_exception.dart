class AppException implements Exception {
  final String message;
  final String? code;
  final dynamic details;

  AppException({
    required this.message,
    this.code,
    this.details,
  });

  @override
  String toString() => message;
}

class NetworkException extends AppException {
  NetworkException({
    required super.message,
    super.code,
    super.details,
  });
}

class ServerException extends AppException {
  final int? statusCode;

  ServerException({
    required super.message,
    this.statusCode,
    super.code,
    super.details,
  });
}

class UnauthorizedException extends AppException {
  UnauthorizedException({
    super.message = 'Unauthorized access',
    super.code,
    super.details,
  });
}

class ValidationException extends AppException {
  final Map<String, List<String>>? errors;

  ValidationException({
    required super.message,
    this.errors,
    super.code,
    super.details,
  });
}

class CacheException extends AppException {
  CacheException({
    required super.message,
    super.code,
    super.details,
  });
}
