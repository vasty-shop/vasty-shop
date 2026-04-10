import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../../shared/models/review_model.dart';
import '../../../../../shared/repositories/review_repository.dart';

// Review Repository Provider
final reviewRepositoryProvider = Provider<ReviewRepository>((ref) {
  return ReviewRepository();
});

// Review Stats Provider (for a specific product)
final reviewStatsProvider =
    FutureProvider.family<ReviewStatsModel, String>((ref, productId) async {
  final repository = ref.watch(reviewRepositoryProvider);
  return await repository.getReviewStats(productId);
});

// Product Reviews State
class ProductReviewsState {
  final List<ReviewModel> reviews;
  final bool isLoading;
  final bool hasMore;
  final String? error;
  final int currentPage;
  final int? filterRating;
  final String sortBy;

  ProductReviewsState({
    this.reviews = const [],
    this.isLoading = false,
    this.hasMore = true,
    this.error,
    this.currentPage = 1,
    this.filterRating,
    this.sortBy = 'recent',
  });

  ProductReviewsState copyWith({
    List<ReviewModel>? reviews,
    bool? isLoading,
    bool? hasMore,
    String? error,
    int? currentPage,
    int? filterRating,
    String? sortBy,
  }) {
    return ProductReviewsState(
      reviews: reviews ?? this.reviews,
      isLoading: isLoading ?? this.isLoading,
      hasMore: hasMore ?? this.hasMore,
      error: error,
      currentPage: currentPage ?? this.currentPage,
      filterRating: filterRating ?? this.filterRating,
      sortBy: sortBy ?? this.sortBy,
    );
  }
}

// Product Reviews Notifier
class ProductReviewsNotifier extends StateNotifier<ProductReviewsState> {
  final ReviewRepository _repository;
  final String productId;

  ProductReviewsNotifier(this._repository, this.productId)
      : super(ProductReviewsState());

  /// Load initial reviews
  Future<void> loadReviews() async {
    if (state.isLoading) return;

    debugPrint('📝 [ReviewProvider] loadReviews() called for product: $productId');

    state = state.copyWith(
      isLoading: true,
      error: null,
      currentPage: 1,
    );

    try {
      final reviews = await _repository.getProductReviews(
        productId,
        page: 1,
        limit: 10,
        rating: state.filterRating,
        sort: state.sortBy,
      );

      debugPrint('📝 [ReviewProvider] Loaded ${reviews.length} reviews');

      state = ProductReviewsState(
        reviews: reviews,
        isLoading: false,
        hasMore: reviews.length >= 10,
        currentPage: 1,
        filterRating: state.filterRating,
        sortBy: state.sortBy,
      );
    } catch (e) {
      debugPrint('❌ [ReviewProvider] Error loading reviews: $e');
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  /// Load more reviews (pagination)
  Future<void> loadMore() async {
    if (state.isLoading || !state.hasMore) return;

    state = state.copyWith(isLoading: true, error: null);

    try {
      final nextPage = state.currentPage + 1;
      final moreReviews = await _repository.getProductReviews(
        productId,
        page: nextPage,
        limit: 10,
        rating: state.filterRating,
        sort: state.sortBy,
      );

      state = state.copyWith(
        reviews: [...state.reviews, ...moreReviews],
        isLoading: false,
        hasMore: moreReviews.length >= 10,
        currentPage: nextPage,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  /// Filter by rating
  Future<void> filterByRating(int? rating) async {
    state = state.copyWith(
      filterRating: rating,
      currentPage: 1,
    );
    await loadReviews();
  }

  /// Change sort order
  Future<void> changeSortOrder(String sortBy) async {
    state = state.copyWith(
      sortBy: sortBy,
      currentPage: 1,
    );
    await loadReviews();
  }

  /// Add a new review locally
  void addReview(ReviewModel review) {
    state = state.copyWith(
      reviews: [review, ...state.reviews],
    );
  }

  /// Update a review locally
  void updateReview(ReviewModel updatedReview) {
    final updatedReviews = state.reviews.map((review) {
      if (review.id == updatedReview.id) {
        return updatedReview;
      }
      return review;
    }).toList();

    state = state.copyWith(reviews: updatedReviews);
  }

  /// Remove a review locally
  void removeReview(String reviewId) {
    final updatedReviews =
        state.reviews.where((review) => review.id != reviewId).toList();

    state = state.copyWith(reviews: updatedReviews);
  }
}

// Product Reviews Provider (for a specific product)
final productReviewsProvider = StateNotifierProvider.family<
    ProductReviewsNotifier, ProductReviewsState, String>((ref, productId) {
  return ProductReviewsNotifier(
    ref.watch(reviewRepositoryProvider),
    productId,
  );
});

// Write Review State
class WriteReviewState {
  final bool isSubmitting;
  final String? error;
  final ReviewModel? submittedReview;

  WriteReviewState({
    this.isSubmitting = false,
    this.error,
    this.submittedReview,
  });

  WriteReviewState copyWith({
    bool? isSubmitting,
    String? error,
    ReviewModel? submittedReview,
  }) {
    return WriteReviewState(
      isSubmitting: isSubmitting ?? this.isSubmitting,
      error: error,
      submittedReview: submittedReview ?? this.submittedReview,
    );
  }
}

// Write Review Notifier
class WriteReviewNotifier extends StateNotifier<WriteReviewState> {
  final ReviewRepository _repository;

  WriteReviewNotifier(this._repository) : super(WriteReviewState());

  /// Submit a new review
  Future<bool> submitReview(CreateReviewRequest request) async {
    state = WriteReviewState(isSubmitting: true);

    try {
      final review = await _repository.createReview(request);
      state = WriteReviewState(submittedReview: review);
      return true;
    } catch (e) {
      state = WriteReviewState(error: e.toString());
      return false;
    }
  }

  /// Reset state
  void reset() {
    state = WriteReviewState();
  }
}

// Write Review Provider
final writeReviewProvider =
    StateNotifierProvider<WriteReviewNotifier, WriteReviewState>((ref) {
  return WriteReviewNotifier(ref.watch(reviewRepositoryProvider));
});
