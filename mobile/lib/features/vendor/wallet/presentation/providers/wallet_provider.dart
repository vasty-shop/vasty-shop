import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/wallet_models.dart';
import '../../data/repositories/disbursement_repository.dart';


import 'package:easy_localization/easy_localization.dart';// Wallet State
class WalletState {
  final WalletBalance? balance;
  final List<PaymentMethod> paymentMethods;
  final List<Disbursement> disbursements;
  final DisbursementSettings? settings;
  final bool isLoading;
  final bool isLoadingMethods;
  final bool isLoadingDisbursements;
  final String? error;

  WalletState({
    this.balance,
    this.paymentMethods = const [],
    this.disbursements = const [],
    this.settings,
    this.isLoading = false,
    this.isLoadingMethods = false,
    this.isLoadingDisbursements = false,
    this.error,
  });

  WalletState copyWith({
    WalletBalance? balance,
    List<PaymentMethod>? paymentMethods,
    List<Disbursement>? disbursements,
    DisbursementSettings? settings,
    bool? isLoading,
    bool? isLoadingMethods,
    bool? isLoadingDisbursements,
    String? error,
  }) {
    return WalletState(
      balance: balance ?? this.balance,
      paymentMethods: paymentMethods ?? this.paymentMethods,
      disbursements: disbursements ?? this.disbursements,
      settings: settings ?? this.settings,
      isLoading: isLoading ?? this.isLoading,
      isLoadingMethods: isLoadingMethods ?? this.isLoadingMethods,
      isLoadingDisbursements: isLoadingDisbursements ?? this.isLoadingDisbursements,
      error: error,
    );
  }
}

// Wallet Notifier
class WalletNotifier extends StateNotifier<WalletState> {
  final DisbursementRepository _repository;
  final String shopId;

  WalletNotifier(this._repository, this.shopId) : super(WalletState());

  /// Load all wallet data
  Future<void> loadWalletData() async {
    await Future.wait([
      loadBalance(),
      loadPaymentMethods(),
      loadDisbursements(),
      loadSettings(),
    ]);
  }

  /// Load balance
  Future<void> loadBalance() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      debugPrint('💰 Loading wallet balance...');
      final balance = await _repository.getBalance(shopId);

      state = WalletState(
        balance: balance,
        paymentMethods: state.paymentMethods,
        disbursements: state.disbursements,
        settings: state.settings,
        isLoading: false,
      );

      debugPrint('✅ Balance loaded successfully');
    } catch (e) {
      debugPrint('❌ Error loading balance: $e');
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  /// Load payment methods
  Future<void> loadPaymentMethods() async {
    state = state.copyWith(isLoadingMethods: true, error: null);

    try {
      debugPrint('💳 Loading payment methods...');
      final methods = await _repository.getPaymentMethods(shopId);

      state = state.copyWith(
        paymentMethods: methods,
        isLoadingMethods: false,
      );

      debugPrint('✅ Payment methods loaded: ${methods.length}');
    } catch (e) {
      debugPrint('❌ Error loading payment methods: $e');
      state = state.copyWith(
        isLoadingMethods: false,
        error: e.toString(),
      );
    }
  }

  /// Add payment method
  Future<PaymentMethod?> addPaymentMethod({
    required String method,
    required Map<String, dynamic> details,
    bool isDefault = false,
  }) async {
    try {
      debugPrint('➕ Adding payment method...');

      final newMethod = await _repository.addPaymentMethod(
        shopId: shopId,
        method: method,
        details: details,
        isDefault: isDefault,
      );

      // Reload payment methods
      await loadPaymentMethods();

      debugPrint('✅ Payment method added successfully');
      return newMethod;
    } catch (e) {
      debugPrint('❌ Error adding payment method: $e');
      state = state.copyWith(error: e.toString());
      return null;
    }
  }

  /// Load disbursements
  Future<void> loadDisbursements({String? status}) async {
    state = state.copyWith(isLoadingDisbursements: true, error: null);

    try {
      debugPrint('📜 Loading disbursements...');
      final disbursements = await _repository.getDisbursements(
        shopId: shopId,
        status: status,
      );

      state = state.copyWith(
        disbursements: disbursements,
        isLoadingDisbursements: false,
      );

      debugPrint('✅ Disbursements loaded: ${disbursements.length}');
    } catch (e) {
      debugPrint('❌ Error loading disbursements: $e');
      state = state.copyWith(
        isLoadingDisbursements: false,
        error: e.toString(),
      );
    }
  }

  /// Request withdrawal
  Future<Disbursement?> requestWithdrawal({
    double? amount,
    String? paymentMethodId,
    String? note,
  }) async {
    try {
      debugPrint('💸 Requesting withdrawal...');

      final disbursement = await _repository.requestDisbursement(
        shopId: shopId,
        amount: amount,
        paymentMethodId: paymentMethodId,
        note: note,
      );

      // Reload wallet data
      await Future.wait([
        loadBalance(),
        loadDisbursements(),
      ]);

      debugPrint('✅ Withdrawal requested successfully');
      return disbursement;
    } catch (e) {
      debugPrint('❌ Error requesting withdrawal: $e');
      state = state.copyWith(error: e.toString());
      return null;
    }
  }

  /// Cancel disbursement
  Future<bool> cancelDisbursement(String disbursementId) async {
    try {
      debugPrint('🚫 Cancelling disbursement...');

      await _repository.cancelDisbursement(
        disbursementId: disbursementId,
        shopId: shopId,
      );

      // Reload disbursements
      await loadDisbursements();

      debugPrint('✅ Disbursement cancelled successfully');
      return true;
    } catch (e) {
      debugPrint('❌ Error cancelling disbursement: $e');
      state = state.copyWith(error: e.toString());
      return false;
    }
  }

  /// Load settings
  Future<void> loadSettings() async {
    try {
      debugPrint('⚙️ Loading disbursement settings...');
      final settings = await _repository.getSettings(shopId);

      state = state.copyWith(settings: settings);

      debugPrint('✅ Settings loaded successfully');
    } catch (e) {
      debugPrint('❌ Error loading settings: $e');
      // Don't set error state for settings, it's optional
    }
  }

  /// Refresh all data
  Future<void> refresh() async {
    await loadWalletData();
  }
}

// Provider
final walletProvider = StateNotifierProvider.family<WalletNotifier, WalletState, String>(
  (ref, shopId) => WalletNotifier(DisbursementRepository(), shopId),
);
