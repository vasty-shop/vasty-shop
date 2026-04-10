import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import '../../data/repositories/profile_repository.dart';
import '../../data/models/address_model.dart';


/// Profile State
class ProfileState {
  final bool isUpdating;
  final String? error;

  ProfileState({
    this.isUpdating = false,
    this.error,
  });

  ProfileState copyWith({
    bool? isUpdating,
    String? error,
  }) {
    return ProfileState(
      isUpdating: isUpdating ?? this.isUpdating,
      error: error,
    );
  }
}

/// Profile Notifier
class ProfileNotifier extends StateNotifier<ProfileState> {
  final ProfileRepository _repository;

  ProfileNotifier(this._repository) : super(ProfileState());

  /// Update profile
  Future<void> updateProfile({
    String? firstName,
    String? lastName,
    String? email,
    String? phone,
  }) async {
    state = state.copyWith(isUpdating: true, error: null);

    try {
      await _repository.updateProfile(
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
      );

      // TODO: Refresh user data - need to implement refreshUser in auth provider
      // For now, user will see updated data after re-login or app restart

      state = ProfileState(isUpdating: false);
    } catch (e) {
      state = state.copyWith(
        isUpdating: false,
        error: e.toString(),
      );
      rethrow;
    }
  }

  /// Upload avatar
  Future<void> uploadAvatar(XFile imageFile) async {
    state = state.copyWith(isUpdating: true, error: null);

    try {
      await _repository.uploadAvatar(imageFile);

      // TODO: Refresh user data - need to implement refreshUser in auth provider
      // For now, user will see updated data after re-login or app restart

      state = ProfileState(isUpdating: false);
    } catch (e) {
      state = state.copyWith(
        isUpdating: false,
        error: e.toString(),
      );
      rethrow;
    }
  }
}

/// Profile Provider
final profileProvider =
    StateNotifierProvider<ProfileNotifier, ProfileState>((ref) {
  return ProfileNotifier(ProfileRepository());
});

/// Addresses State
class AddressesState {
  final List<AddressModel> addresses;
  final bool isLoading;
  final String? error;

  AddressesState({
    this.addresses = const [],
    this.isLoading = false,
    this.error,
  });

  AddressesState copyWith({
    List<AddressModel>? addresses,
    bool? isLoading,
    String? error,
  }) {
    return AddressesState(
      addresses: addresses ?? this.addresses,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }

  AddressModel? get defaultAddress =>
      addresses.where((a) => a.isDefault).firstOrNull;
}

/// Addresses Notifier
class AddressesNotifier extends StateNotifier<AddressesState> {
  final ProfileRepository _repository;

  AddressesNotifier(this._repository) : super(AddressesState());

  /// Load addresses
  Future<void> loadAddresses() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final addresses = await _repository.getAddresses();

      state = AddressesState(
        addresses: addresses,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  /// Create address
  Future<void> createAddress(AddressModel address) async {
    try {
      final newAddress = await _repository.createAddress(address);

      state = state.copyWith(
        addresses: [...state.addresses, newAddress],
      );
    } catch (e) {
      state = state.copyWith(error: e.toString());
      rethrow;
    }
  }

  /// Update address
  Future<void> updateAddress(String id, AddressModel address) async {
    try {
      final updatedAddress = await _repository.updateAddress(id, address);

      final updatedAddresses = state.addresses.map((a) {
        return a.id == id ? updatedAddress : a;
      }).toList();

      state = state.copyWith(addresses: updatedAddresses);
    } catch (e) {
      state = state.copyWith(error: e.toString());
      rethrow;
    }
  }

  /// Delete address
  Future<void> deleteAddress(String id) async {
    try {
      await _repository.deleteAddress(id);

      final updatedAddresses = state.addresses.where((a) => a.id != id).toList();

      state = state.copyWith(addresses: updatedAddresses);
    } catch (e) {
      state = state.copyWith(error: e.toString());
      rethrow;
    }
  }

  /// Set default address
  Future<void> setDefaultAddress(String id) async {
    try {
      await _repository.setDefaultAddress(id);

      // Update local state: unset all defaults, then set the new one
      final updatedAddresses = state.addresses.map((a) {
        return a.copyWith(isDefault: a.id == id);
      }).toList();

      state = state.copyWith(addresses: updatedAddresses);
    } catch (e) {
      state = state.copyWith(error: e.toString());
      rethrow;
    }
  }
}

/// Addresses Provider
final addressesProvider =
    StateNotifierProvider<AddressesNotifier, AddressesState>((ref) {
  return AddressesNotifier(ProfileRepository());
});
