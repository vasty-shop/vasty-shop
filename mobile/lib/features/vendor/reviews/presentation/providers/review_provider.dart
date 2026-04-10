import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/review_models.dart';
import '../../data/repositories/review_repository.dart';

// Review State
class ReviewState {
  final List<Review> reviews;
  final ReviewStatistics statistics;
  final bool isLoading;
  final String? error;
  final String selectedRating;
  final String searchQuery;

  ReviewState({
    this.reviews = const [],
    ReviewStatistics? statistics,
    this.isLoading = false,
    this.error,
    this.selectedRating = 'all',
    this.searchQuery = '',
  }) : statistics = statistics ?? ReviewStatistics.empty();

  ReviewState copyWith({
    List<Review>? reviews,
    ReviewStatistics? statistics,
    bool? isLoading,
    String? error,
    String? selectedRating,
    String? searchQuery,
  }) {
    return ReviewState(
      reviews: reviews ?? this.reviews,
      statistics: statistics ?? this.statistics,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      selectedRating: selectedRating ?? this.selectedRating,
      searchQuery: searchQuery ?? this.searchQuery,
    );
  }

  List<Review> get filteredReviews {
    return reviews.where((review) {
      final matchesSearch = searchQuery.isEmpty ||
          review.productName.toLowerCase().contains(searchQuery.toLowerCase()) ||
          review.customerName.toLowerCase().contains(searchQuery.toLowerCase()) ||
          review.comment.toLowerCase().contains(searchQuery.toLowerCase());
      final matchesRating = selectedRating == 'all' ||
          review.rating.toString() == selectedRating;
      return matchesSearch && matchesRating;
    }).toList();
  }

  double get averageRating {
    if (reviews.isEmpty) return 0.0;
    return reviews.fold<double>(0, (sum, r) => sum + r.rating) / reviews.length;
  }

  int get featuredCount => reviews.where((r) => r.isFeatured).length;

  int get totalHelpfulVotes => reviews.fold<int>(0, (sum, r) => sum + r.helpfulCount);

  Map<int, int> get ratingDistribution {
    final dist = {5: 0, 4: 0, 3: 0, 2: 0, 1: 0};
    for (final review in reviews) {
      if (dist.containsKey(review.rating)) {
        dist[review.rating] = dist[review.rating]! + 1;
      }
    }
    return dist;
  }
}

// Review Notifier
class ReviewNotifier extends StateNotifier<ReviewState> {
  final ReviewRepository _repository;

  ReviewNotifier(this._repository) : super(ReviewState());

  /// Load reviews and statistics
  Future<void> loadReviews() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      debugPrint('📝 Loading reviews...');
      final results = await Future.wait([
        _repository.getReviews(),
        _repository.getStatistics(),
      ]);

      final reviews = results[0] as List<Review>;
      final statistics = results[1] as ReviewStatistics;

      state = ReviewState(
        reviews: reviews,
        statistics: statistics,
        isLoading: false,
        selectedRating: state.selectedRating,
        searchQuery: state.searchQuery,
      );

      debugPrint('✅ Reviews loaded successfully: ${reviews.length} reviews');
    } catch (e) {
      debugPrint('❌ Error loading reviews: $e');
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  /// Set search query
  void setSearchQuery(String query) {
    state = state.copyWith(searchQuery: query);
  }

  /// Set rating filter
  void setRatingFilter(String rating) {
    state = state.copyWith(selectedRating: rating);
  }

  /// Reply to a review
  Future<bool> replyToReview(String reviewId, String replyText) async {
    try {
      final review = state.reviews.firstWhere((r) => r.id == reviewId);

      if (review.reply != null) {
        await _repository.updateReply(reviewId, replyText);
      } else {
        await _repository.replyToReview(reviewId, replyText);
      }

      // Update local state
      final updatedReviews = state.reviews.map((r) {
        if (r.id == reviewId) {
          return r.copyWith(
            reply: ReviewReply(text: replyText, date: DateTime.now()),
          );
        }
        return r;
      }).toList();

      state = state.copyWith(reviews: updatedReviews);
      return true;
    } catch (e) {
      debugPrint('❌ Error replying to review: $e');
      return false;
    }
  }

  /// Toggle featured status
  Future<bool> toggleFeatured(String reviewId) async {
    try {
      await _repository.toggleFeatured(reviewId);

      // Update local state
      final updatedReviews = state.reviews.map((r) {
        if (r.id == reviewId) {
          return r.copyWith(isFeatured: !r.isFeatured);
        }
        return r;
      }).toList();

      state = state.copyWith(reviews: updatedReviews);
      return true;
    } catch (e) {
      debugPrint('❌ Error toggling featured: $e');
      return false;
    }
  }

  /// Toggle visibility
  Future<bool> toggleVisibility(String reviewId) async {
    try {
      await _repository.toggleVisibility(reviewId);

      // Update local state
      final updatedReviews = state.reviews.map((r) {
        if (r.id == reviewId) {
          return r.copyWith(isHidden: !r.isHidden);
        }
        return r;
      }).toList();

      state = state.copyWith(reviews: updatedReviews);
      return true;
    } catch (e) {
      debugPrint('❌ Error toggling visibility: $e');
      return false;
    }
  }

  /// Report review
  Future<bool> reportReview(String reviewId, String reason) async {
    try {
      await _repository.reportReview(reviewId, reason);
      return true;
    } catch (e) {
      debugPrint('❌ Error reporting review: $e');
      return false;
    }
  }

  /// Refresh reviews
  Future<void> refresh() async {
    await loadReviews();
  }
}

// Provider
final reviewProvider = StateNotifierProvider<ReviewNotifier, ReviewState>(
  (ref) => ReviewNotifier(ReviewRepository()),
);
