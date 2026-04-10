import 'package:json_annotation/json_annotation.dart';


part 'review_model.g.dart';

@JsonSerializable()
class ReviewModel {
  final String id;
  @JsonKey(name: 'product_id', readValue: _readWithFallback)
  final String productId;
  @JsonKey(name: 'user_id', readValue: _readWithFallback)
  final String userId;
  @JsonKey(name: 'user_name', readValue: _readWithFallback)
  final String userName;
  @JsonKey(name: 'user_avatar', readValue: _readWithFallback)
  final String? userAvatar;
  final int rating;
  @JsonKey(name: 'review_text', readValue: _readWithFallback)
  final String? comment;
  @JsonKey(name: 'review_images', readValue: _readImagesWithFallback)
  final List<String> images;
  @JsonKey(name: 'is_verified_purchase', readValue: _readWithFallback)
  final bool verified;
  @JsonKey(name: 'helpful_count', readValue: _readWithFallback)
  final int helpfulCount;
  @JsonKey(name: 'created_at', readValue: _readWithFallback)
  final DateTime createdAt;
  @JsonKey(name: 'updated_at', readValue: _readWithFallback)
  final DateTime? updatedAt;

  ReviewModel({
    required this.id,
    required this.productId,
    required this.userId,
    required this.userName,
    this.userAvatar,
    required this.rating,
    this.comment,
    this.images = const [],
    this.verified = false,
    this.helpfulCount = 0,
    required this.createdAt,
    this.updatedAt,
  });

  // Helper to read snake_case or camelCase field
  static Object? _readWithFallback(Map json, String key) {
    // Convert snake_case key to camelCase
    final camelKey = key.replaceAllMapped(
      RegExp(r'_([a-z])'),
      (m) => m.group(1)!.toUpperCase(),
    );
    final value = json[key] ?? json[camelKey];
    // Return default for userName if null
    if (key == 'user_name' && value == null) {
      return 'Anonymous';
    }
    return value;
  }

  // Helper for images array
  static Object? _readImagesWithFallback(Map json, String key) {
    return json['review_images'] ?? json['reviewImages'] ?? json['images'] ?? [];
  }

  factory ReviewModel.fromJson(Map<String, dynamic> json) =>
      _$ReviewModelFromJson(json);

  Map<String, dynamic> toJson() => _$ReviewModelToJson(this);

  /// Helper method to get time ago string
  String get timeAgo {
    final now = DateTime.now();
    final difference = now.difference(createdAt);

    if (difference.inDays > 365) {
      final years = (difference.inDays / 365).floor();
      return '$years ${years == 1 ? 'year' : 'years'} ago';
    } else if (difference.inDays > 30) {
      final months = (difference.inDays / 30).floor();
      return '$months ${months == 1 ? 'month' : 'months'} ago';
    } else if (difference.inDays > 0) {
      return '${difference.inDays} ${difference.inDays == 1 ? 'day' : 'days'} ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours} ${difference.inHours == 1 ? 'hour' : 'hours'} ago';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes} ${difference.inMinutes == 1 ? 'minute' : 'minutes'} ago';
    } else {
      return 'Just now';
    }
  }

  /// Get user initials
  String get userInitials {
    final parts = userName.split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return userName.isNotEmpty ? userName[0].toUpperCase() : '?';
  }
}

@JsonSerializable()
class ReviewStatsModel {
  final double averageRating;
  final int totalReviews;
  final Map<int, int> ratingDistribution;

  ReviewStatsModel({
    required this.averageRating,
    required this.totalReviews,
    required this.ratingDistribution,
  });

  factory ReviewStatsModel.fromJson(Map<String, dynamic> json) =>
      _$ReviewStatsModelFromJson(json);

  Map<String, dynamic> toJson() => _$ReviewStatsModelToJson(this);

  /// Get percentage for a specific rating
  double getPercentage(int rating) {
    if (totalReviews == 0) return 0;
    final count = ratingDistribution[rating] ?? 0;
    return (count / totalReviews) * 100;
  }
}

@JsonSerializable()
class CreateReviewRequest {
  final String productId;
  final int rating;
  final String title;
  final String reviewText;
  final List<String> images;

  CreateReviewRequest({
    required this.productId,
    required this.rating,
    required this.title,
    required this.reviewText,
    this.images = const [],
  });

  factory CreateReviewRequest.fromJson(Map<String, dynamic> json) =>
      _$CreateReviewRequestFromJson(json);

  Map<String, dynamic> toJson() => _$CreateReviewRequestToJson(this);
}
