import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/offer_models.dart';
import '../../data/repositories/offer_repository.dart';

// Offer State
class OfferState {
  final List<Offer> offers;
  final OfferStatistics statistics;
  final bool isLoading;
  final String? error;
  final String selectedStatus;
  final String searchQuery;

  OfferState({
    this.offers = const [],
    OfferStatistics? statistics,
    this.isLoading = false,
    this.error,
    this.selectedStatus = 'all',
    this.searchQuery = '',
  }) : statistics = statistics ?? OfferStatistics.empty();

  OfferState copyWith({
    List<Offer>? offers,
    OfferStatistics? statistics,
    bool? isLoading,
    String? error,
    String? selectedStatus,
    String? searchQuery,
  }) {
    return OfferState(
      offers: offers ?? this.offers,
      statistics: statistics ?? this.statistics,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      selectedStatus: selectedStatus ?? this.selectedStatus,
      searchQuery: searchQuery ?? this.searchQuery,
    );
  }

  List<Offer> get filteredOffers {
    return offers.where((offer) {
      final matchesSearch = searchQuery.isEmpty ||
          offer.name.toLowerCase().contains(searchQuery.toLowerCase()) ||
          offer.code.toLowerCase().contains(searchQuery.toLowerCase());
      return matchesSearch;
    }).toList();
  }
}

// Offer Notifier
class OfferNotifier extends StateNotifier<OfferState> {
  final OfferRepository _repository;

  OfferNotifier(this._repository) : super(OfferState());

  /// Load offers
  Future<void> loadOffers() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      debugPrint('🎫 Loading offers...');
      final offers = await _repository.getOffers(
        status: state.selectedStatus != 'all' ? state.selectedStatus : null,
      );

      final statistics = OfferStatistics.fromOffers(offers);

      state = OfferState(
        offers: offers,
        statistics: statistics,
        isLoading: false,
        selectedStatus: state.selectedStatus,
        searchQuery: state.searchQuery,
      );

      debugPrint('✅ Offers loaded successfully: ${offers.length} offers');
    } catch (e) {
      debugPrint('❌ Error loading offers: $e');
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

  /// Set status filter
  void setStatusFilter(String status) {
    if (status != state.selectedStatus) {
      state = state.copyWith(selectedStatus: status);
      loadOffers();
    }
  }

  /// Create offer - returns error message on failure, null on success
  Future<String?> createOffer(Offer offer) async {
    try {
      final newOffer = await _repository.createOffer(offer);

      // Update local state
      final updatedOffers = [newOffer, ...state.offers];
      state = state.copyWith(
        offers: updatedOffers,
        statistics: OfferStatistics.fromOffers(updatedOffers),
      );

      return null; // Success
    } catch (e) {
      debugPrint('❌ Error creating offer: $e');
      return e.toString();
    }
  }

  /// Update offer - returns error message on failure, null on success
  Future<String?> updateOffer(String offerId, Offer offer) async {
    try {
      final updatedOffer = await _repository.updateOffer(offerId, offer);

      // Update local state
      final updatedOffers = state.offers.map((o) {
        if (o.id == offerId) {
          return updatedOffer;
        }
        return o;
      }).toList();

      state = state.copyWith(
        offers: updatedOffers,
        statistics: OfferStatistics.fromOffers(updatedOffers),
      );

      return null; // Success
    } catch (e) {
      debugPrint('❌ Error updating offer: $e');
      return e.toString();
    }
  }

  /// Delete offer
  Future<bool> deleteOffer(String offerId) async {
    try {
      await _repository.deleteOffer(offerId);

      // Update local state
      final updatedOffers = state.offers.where((o) => o.id != offerId).toList();
      state = state.copyWith(
        offers: updatedOffers,
        statistics: OfferStatistics.fromOffers(updatedOffers),
      );

      return true;
    } catch (e) {
      debugPrint('❌ Error deleting offer: $e');
      return false;
    }
  }

  /// Toggle offer status
  Future<bool> toggleStatus(String offerId) async {
    try {
      final offer = state.offers.firstWhere((o) => o.id == offerId);
      final newStatus = offer.status == OfferStatus.active ? 'disabled' : 'active';

      await _repository.changeOfferStatus(offerId, newStatus);

      // Update local state
      final updatedOffers = state.offers.map((o) {
        if (o.id == offerId) {
          return o.copyWith(status: OfferStatus.fromString(newStatus));
        }
        return o;
      }).toList();

      state = state.copyWith(
        offers: updatedOffers,
        statistics: OfferStatistics.fromOffers(updatedOffers),
      );

      return true;
    } catch (e) {
      debugPrint('❌ Error toggling offer status: $e');
      return false;
    }
  }

  /// Refresh offers
  Future<void> refresh() async {
    await loadOffers();
  }
}

// Provider
final offerProvider = StateNotifierProvider<OfferNotifier, OfferState>(
  (ref) => OfferNotifier(OfferRepository()),
);
