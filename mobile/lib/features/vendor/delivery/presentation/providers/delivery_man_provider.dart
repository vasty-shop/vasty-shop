import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../../shared/models/delivery_man_model.dart';
import '../../../../../shared/repositories/delivery_man_repository.dart';

class DeliveryManState {
  final List<DeliveryManModel> deliveryMen;
  final List<DeliveryZoneModel> zones;
  final bool isLoading;
  final String? error;
  final bool isRegistering;
  final String? successMessage;

  DeliveryManState({
    this.deliveryMen = const [],
    this.zones = const [],
    this.isLoading = false,
    this.error,
    this.isRegistering = false,
    this.successMessage,
  });

  DeliveryManState copyWith({
    List<DeliveryManModel>? deliveryMen,
    List<DeliveryZoneModel>? zones,
    bool? isLoading,
    String? error,
    bool? isRegistering,
    String? successMessage,
  }) {
    return DeliveryManState(
      deliveryMen: deliveryMen ?? this.deliveryMen,
      zones: zones ?? this.zones,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      isRegistering: isRegistering ?? this.isRegistering,
      successMessage: successMessage,
    );
  }

  int get totalDeliveryMen => deliveryMen.length;

  int get activeDeliveryMen => deliveryMen.where((dm) => dm.status.toLowerCase() == 'active').length;

  int get pendingDeliveryMen => deliveryMen.where((dm) => dm.status.toLowerCase() == 'pending').length;
}

class DeliveryManNotifier extends StateNotifier<DeliveryManState> {
  final DeliveryManRepository _repository;
  final String? shopId;

  DeliveryManNotifier(this._repository, this.shopId) : super(DeliveryManState());

  Future<void> loadDeliveryMen() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final deliveryMen = await _repository.getDeliveryMen(shopId: shopId);
      state = state.copyWith(deliveryMen: deliveryMen, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> loadDeliveryZones() async {
    try {
      final zones = await _repository.getDeliveryZones(shopId: shopId);
      state = state.copyWith(zones: zones);
    } catch (e) {
      // Zones are optional, don't set error
      debugPrint('Failed to load zones: $e');
    }
  }

  Future<void> refreshDeliveryMen() async {
    await loadDeliveryMen();
  }

  Future<bool> registerDeliveryMan({
    required String name,
    required String email,
    required String phone,
    required String password,
    String? zoneId,
  }) async {
    state = state.copyWith(isRegistering: true, error: null, successMessage: null);
    try {
      final deliveryMan = await _repository.registerDeliveryMan(
        name: name,
        email: email,
        phone: phone,
        password: password,
        zoneId: zoneId,
        shopId: shopId,
      );

      // Add to list
      final updatedList = [...state.deliveryMen, deliveryMan];
      state = state.copyWith(
        deliveryMen: updatedList,
        isRegistering: false,
        successMessage: 'Delivery man registered successfully!',
      );

      return true;
    } catch (e) {
      state = state.copyWith(isRegistering: false, error: e.toString());
      return false;
    }
  }

  Future<bool> assignOrderToDeliveryMan({
    required String orderId,
    required String deliveryManId,
    String? notes,
  }) async {
    try {
      await _repository.assignOrderToDeliveryMan(
        orderId: orderId,
        deliveryManId: deliveryManId,
        shopId: shopId,
        notes: notes,
      );
      return true;
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return false;
    }
  }

  Future<bool> updateDeliveryManZone({
    required String deliveryManId,
    String? zoneId,
  }) async {
    try {
      final updatedDeliveryMan = await _repository.updateDeliveryManZone(
        deliveryManId: deliveryManId,
        zoneId: zoneId,
        shopId: shopId,
      );

      // Update in list
      final updatedList = state.deliveryMen.map((dm) {
        if (dm.id == deliveryManId) {
          return updatedDeliveryMan;
        }
        return dm;
      }).toList();

      state = state.copyWith(
        deliveryMen: updatedList,
        successMessage: 'Zone assignment updated',
      );

      return true;
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return false;
    }
  }

  Future<bool> deleteDeliveryMan(String deliveryManId) async {
    try {
      await _repository.deleteDeliveryMan(deliveryManId, shopId: shopId);

      // Remove from list
      final updatedList = state.deliveryMen.where((dm) => dm.id != deliveryManId).toList();
      state = state.copyWith(
        deliveryMen: updatedList,
        successMessage: 'Delivery man removed successfully',
      );

      return true;
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return false;
    }
  }

  void clearMessages() {
    state = state.copyWith(error: null, successMessage: null);
  }
}

final deliveryManRepositoryProvider = Provider<DeliveryManRepository>((ref) {
  return DeliveryManRepository();
});

final deliveryManProvider = StateNotifierProvider.family<DeliveryManNotifier, DeliveryManState, String?>(
  (ref, shopId) {
    final repository = ref.watch(deliveryManRepositoryProvider);
    return DeliveryManNotifier(repository, shopId);
  },
);
