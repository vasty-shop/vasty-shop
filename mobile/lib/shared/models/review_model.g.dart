// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'review_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ReviewModel _$ReviewModelFromJson(Map<String, dynamic> json) => ReviewModel(
  id: json['id'] as String,
  productId: ReviewModel._readWithFallback(json, 'product_id') as String,
  userId: ReviewModel._readWithFallback(json, 'user_id') as String,
  userName: ReviewModel._readWithFallback(json, 'user_name') as String,
  userAvatar: ReviewModel._readWithFallback(json, 'user_avatar') as String?,
  rating: (json['rating'] as num).toInt(),
  comment: ReviewModel._readWithFallback(json, 'review_text') as String?,
  images:
      (ReviewModel._readImagesWithFallback(json, 'review_images')
              as List<dynamic>?)
          ?.map((e) => e as String)
          .toList() ??
      const [],
  verified:
      ReviewModel._readWithFallback(json, 'is_verified_purchase') as bool? ??
      false,
  helpfulCount:
      (ReviewModel._readWithFallback(json, 'helpful_count') as num?)?.toInt() ??
      0,
  createdAt: DateTime.parse(
    ReviewModel._readWithFallback(json, 'created_at') as String,
  ),
  updatedAt: ReviewModel._readWithFallback(json, 'updated_at') == null
      ? null
      : DateTime.parse(
          ReviewModel._readWithFallback(json, 'updated_at') as String,
        ),
);

Map<String, dynamic> _$ReviewModelToJson(ReviewModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'product_id': instance.productId,
      'user_id': instance.userId,
      'user_name': instance.userName,
      'user_avatar': instance.userAvatar,
      'rating': instance.rating,
      'review_text': instance.comment,
      'review_images': instance.images,
      'is_verified_purchase': instance.verified,
      'helpful_count': instance.helpfulCount,
      'created_at': instance.createdAt.toIso8601String(),
      'updated_at': instance.updatedAt?.toIso8601String(),
    };

ReviewStatsModel _$ReviewStatsModelFromJson(Map<String, dynamic> json) =>
    ReviewStatsModel(
      averageRating: (json['averageRating'] as num).toDouble(),
      totalReviews: (json['totalReviews'] as num).toInt(),
      ratingDistribution: (json['ratingDistribution'] as Map<String, dynamic>)
          .map((k, e) => MapEntry(int.parse(k), (e as num).toInt())),
    );

Map<String, dynamic> _$ReviewStatsModelToJson(ReviewStatsModel instance) =>
    <String, dynamic>{
      'averageRating': instance.averageRating,
      'totalReviews': instance.totalReviews,
      'ratingDistribution': instance.ratingDistribution.map(
        (k, e) => MapEntry(k.toString(), e),
      ),
    };

CreateReviewRequest _$CreateReviewRequestFromJson(Map<String, dynamic> json) =>
    CreateReviewRequest(
      productId: json['productId'] as String,
      rating: (json['rating'] as num).toInt(),
      title: json['title'] as String,
      reviewText: json['reviewText'] as String,
      images:
          (json['images'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
    );

Map<String, dynamic> _$CreateReviewRequestToJson(
  CreateReviewRequest instance,
) => <String, dynamic>{
  'productId': instance.productId,
  'rating': instance.rating,
  'title': instance.title,
  'reviewText': instance.reviewText,
  'images': instance.images,
};
