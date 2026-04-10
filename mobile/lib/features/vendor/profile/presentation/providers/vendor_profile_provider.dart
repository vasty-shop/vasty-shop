import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/vendor_profile_model.dart';
import '../../data/repositories/vendor_profile_repository.dart';

/// Vendor Profile State
class VendorProfileState {
  final VendorProfileModel? profile;
  final bool isLoading;
  final bool isSaving;
  final bool isUploadingAvatar;
  final String? error;

  VendorProfileState({
    this.profile,
    this.isLoading = false,
    this.isSaving = false,
    this.isUploadingAvatar = false,
    this.error,
  });

  VendorProfileState copyWith({
    VendorProfileModel? profile,
    bool? isLoading,
    bool? isSaving,
    bool? isUploadingAvatar,
    String? error,
  }) {
    return VendorProfileState(
      profile: profile ?? this.profile,
      isLoading: isLoading ?? this.isLoading,
      isSaving: isSaving ?? this.isSaving,
      isUploadingAvatar: isUploadingAvatar ?? this.isUploadingAvatar,
      error: error,
    );
  }
}

/// Vendor Profile Notifier
class VendorProfileNotifier extends StateNotifier<VendorProfileState> {
  final VendorProfileRepository _repository;

  VendorProfileNotifier(this._repository) : super(VendorProfileState());

  /// Load vendor profile
  Future<void> loadProfile() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final profile = await _repository.getProfile();
      state = state.copyWith(
        profile: profile,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  /// Update vendor profile
  Future<bool> updateProfile({
    String? firstName,
    String? lastName,
    String? phone,
    String? address,
    String? bio,
    String? avatar,
  }) async {
    if (state.profile == null) {
      state = state.copyWith(error: 'Profile not loaded');
      return false;
    }

    state = state.copyWith(isSaving: true, error: null);

    try {
      final updatedProfile = await _repository.updateProfile(
        currentProfile: state.profile!,
        firstName: firstName,
        lastName: lastName,
        phone: phone,
        address: address,
        bio: bio,
        avatar: avatar,
      );

      state = state.copyWith(
        profile: updatedProfile,
        isSaving: false,
      );

      return true;
    } catch (e) {
      state = state.copyWith(
        isSaving: false,
        error: e.toString(),
      );
      return false;
    }
  }

  /// Upload avatar
  Future<String?> uploadAvatar(String filePath) async {
    state = state.copyWith(isUploadingAvatar: true, error: null);

    try {
      final avatarUrl = await _repository.uploadAvatar(filePath);

      // Update profile with new avatar URL
      if (state.profile != null) {
        state = state.copyWith(
          profile: state.profile!.copyWith(avatar: avatarUrl),
          isUploadingAvatar: false,
        );
      } else {
        state = state.copyWith(isUploadingAvatar: false);
      }

      return avatarUrl;
    } catch (e) {
      state = state.copyWith(
        isUploadingAvatar: false,
        error: e.toString(),
      );
      return null;
    }
  }

  /// Delete account
  Future<bool> deleteAccount() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      await _repository.deleteAccount();
      state = VendorProfileState(); // Reset state
      return true;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      return false;
    }
  }

  /// Clear error
  void clearError() {
    state = state.copyWith(error: null);
  }
}

/// Repository Provider
final vendorProfileRepositoryProvider = Provider<VendorProfileRepository>((ref) {
  return VendorProfileRepository();
});

/// Vendor Profile Provider
final vendorProfileProvider =
    StateNotifierProvider<VendorProfileNotifier, VendorProfileState>((ref) {
  final repository = ref.watch(vendorProfileRepositoryProvider);
  return VendorProfileNotifier(repository);
});
