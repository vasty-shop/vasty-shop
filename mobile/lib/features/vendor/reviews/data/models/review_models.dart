// Helper function to safely parse double from String or num
double _parseDouble(dynamic value) {
  if (value == null) return 0.0;
  if (value is num) return value.toDouble();
  if (value is String) return double.tryParse(value) ?? 0.0;
  return 0.0;
}

// Helper function to safely parse int from String or num
int _parseInt(dynamic value) {
  if (value == null) return 0;
  if (value is int) return value;
  if (value is num) return value.toInt();
  if (value is String) return int.tryParse(value) ?? 0;
  return 0;
}

/// Review reply from vendor
class ReviewReply {
  final String text;
  final DateTime date;

  ReviewReply({
    required this.text,
    required this.date,
  });

  factory ReviewReply.fromJson(Map<String, dynamic> json) {
    return ReviewReply(
      text: json['text'] ?? json['vendorReply'] ?? '',
      date: DateTime.tryParse(json['date'] ?? json['vendorReplyDate'] ?? '') ?? DateTime.now(),
    );
  }
}

/// Review model
class Review {
  final String id;
  final String productId;
  final String productName;
  final String productImage;
  final String customerId;
  final String customerName;
  final String customerAvatar;
  final int rating;
  final String title;
  final String comment;
  final List<String> images;
  final int helpfulCount;
  final DateTime createdAt;
  final bool isFeatured;
  final bool isHidden;
  final ReviewReply? reply;

  Review({
    required this.id,
    required this.productId,
    required this.productName,
    required this.productImage,
    required this.customerId,
    required this.customerName,
    required this.customerAvatar,
    required this.rating,
    required this.title,
    required this.comment,
    required this.images,
    required this.helpfulCount,
    required this.createdAt,
    required this.isFeatured,
    required this.isHidden,
    this.reply,
  });

  factory Review.fromJson(Map<String, dynamic> json) {
    // Parse review images (API returns review_images)
    List<String> imagesList = [];
    final imagesData = json['images'] ?? json['review_images'] ?? json['reviewImages'];
    if (imagesData != null && imagesData is List) {
      imagesList = imagesData.map((e) {
        // Handle both string URLs and image objects with url property
        if (e is String) return e;
        if (e is Map) return e['url']?.toString() ?? '';
        return e.toString();
      }).where((url) => url.isNotEmpty).toList().cast<String>();
    }

    // Parse product image (handle both string URLs and image objects)
    String productImage = '';
    if (json['productImage'] != null) {
      productImage = json['productImage'].toString();
    } else if (json['product_image'] != null) {
      productImage = json['product_image'].toString();
    } else if (json['product']?['images'] != null) {
      final prodImages = json['product']['images'];
      if (prodImages is List && prodImages.isNotEmpty) {
        final firstImage = prodImages[0];
        if (firstImage is String) {
          productImage = firstImage;
        } else if (firstImage is Map) {
          productImage = firstImage['url']?.toString() ?? '';
        }
      }
    }

    // Parse reply (API returns shop_response)
    ReviewReply? reply;
    final vendorReplyText = json['vendorReply'] ?? json['shop_response'] ?? json['shopResponse'];
    if (vendorReplyText != null && vendorReplyText.toString().isNotEmpty) {
      reply = ReviewReply(
        text: vendorReplyText.toString(),
        date: DateTime.tryParse(json['vendorReplyDate'] ?? json['responded_at'] ?? json['respondedAt'] ?? '') ?? DateTime.now(),
      );
    } else if (json['reply'] != null) {
      reply = ReviewReply.fromJson(json['reply']);
    }

    return Review(
      id: json['id'] ?? '',
      productId: json['productId'] ?? json['product_id'] ?? json['product']?['id'] ?? '',
      productName: json['productName'] ?? json['product_name'] ?? json['product']?['name'] ?? 'Unknown Product',
      productImage: productImage,
      customerId: json['userId'] ?? json['user_id'] ?? json['user']?['id'] ?? '',
      customerName: json['customerName'] ?? json['customer_name'] ?? json['userName'] ?? json['user_name'] ?? json['user']?['name'] ?? 'Anonymous',
      customerAvatar: json['customerAvatar'] ?? json['customer_avatar'] ?? json['userAvatar'] ?? json['user_avatar'] ?? json['user']?['avatar'] ?? '',
      rating: _parseInt(json['rating']),
      title: json['title'] ?? '',
      comment: json['comment'] ?? json['review'] ?? json['reviewText'] ?? json['review_text'] ?? '',
      images: imagesList,
      helpfulCount: _parseInt(json['helpfulCount'] ?? json['helpful_count']),
      createdAt: DateTime.tryParse(json['createdAt'] ?? json['created_at'] ?? '') ?? DateTime.now(),
      isFeatured: json['isFeatured'] ?? json['is_featured'] ?? false,
      isHidden: json['isHidden'] ?? json['is_hidden'] ?? false,
      reply: reply,
    );
  }

  Review copyWith({
    String? id,
    String? productId,
    String? productName,
    String? productImage,
    String? customerId,
    String? customerName,
    String? customerAvatar,
    int? rating,
    String? title,
    String? comment,
    List<String>? images,
    int? helpfulCount,
    DateTime? createdAt,
    bool? isFeatured,
    bool? isHidden,
    ReviewReply? reply,
  }) {
    return Review(
      id: id ?? this.id,
      productId: productId ?? this.productId,
      productName: productName ?? this.productName,
      productImage: productImage ?? this.productImage,
      customerId: customerId ?? this.customerId,
      customerName: customerName ?? this.customerName,
      customerAvatar: customerAvatar ?? this.customerAvatar,
      rating: rating ?? this.rating,
      title: title ?? this.title,
      comment: comment ?? this.comment,
      images: images ?? this.images,
      helpfulCount: helpfulCount ?? this.helpfulCount,
      createdAt: createdAt ?? this.createdAt,
      isFeatured: isFeatured ?? this.isFeatured,
      isHidden: isHidden ?? this.isHidden,
      reply: reply ?? this.reply,
    );
  }
}

/// Review statistics model
class ReviewStatistics {
  final int totalReviews;
  final double averageRating;
  final int featuredCount;
  final int helpfulVotes;
  final Map<int, int> ratingDistribution;

  ReviewStatistics({
    required this.totalReviews,
    required this.averageRating,
    required this.featuredCount,
    required this.helpfulVotes,
    required this.ratingDistribution,
  });

  factory ReviewStatistics.fromJson(Map<String, dynamic> json) {
    // Parse rating distribution
    Map<int, int> distribution = {5: 0, 4: 0, 3: 0, 2: 0, 1: 0};
    if (json['ratingDistribution'] != null) {
      final dist = json['ratingDistribution'] as Map<String, dynamic>;
      dist.forEach((key, value) {
        distribution[int.tryParse(key) ?? 0] = _parseInt(value);
      });
    }

    return ReviewStatistics(
      totalReviews: _parseInt(json['totalReviews'] ?? json['total_reviews'] ?? json['total']),
      averageRating: _parseDouble(json['averageRating'] ?? json['average_rating'] ?? json['average']),
      featuredCount: _parseInt(json['featuredCount'] ?? json['featured_count'] ?? json['featured']),
      helpfulVotes: _parseInt(json['helpfulVotes'] ?? json['helpful_votes'] ?? json['helpfulCount']),
      ratingDistribution: distribution,
    );
  }

  factory ReviewStatistics.empty() {
    return ReviewStatistics(
      totalReviews: 0,
      averageRating: 0.0,
      featuredCount: 0,
      helpfulVotes: 0,
      ratingDistribution: {5: 0, 4: 0, 3: 0, 2: 0, 1: 0},
    );
  }
}
