import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../../core/constants/app_constants.dart';
import '../../data/models/user_model.dart';
import '../../data/models/login_request.dart';
import '../../data/models/register_request.dart';
import '../../data/models/auth_response_model.dart';
import '../../data/repositories/auth_repository.dart';


import 'package:easy_localization/easy_localization.dart';/// Auth State
class AuthState {
  final UserModel? user;
  final bool isAuthenticated;
  final bool isGuestMode;
  final bool isLoading;
  final String? error;

  AuthState({
    this.user,
    this.isAuthenticated = false,
    this.isGuestMode = false,
    this.isLoading = false,
    this.error,
  });

  AuthState copyWith({
    UserModel? user,
    bool? isAuthenticated,
    bool? isGuestMode,
    bool? isLoading,
    String? error,
  }) {
    return AuthState(
      user: user ?? this.user,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      isGuestMode: isGuestMode ?? this.isGuestMode,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

/// Auth State Notifier
class AuthNotifier extends StateNotifier<AuthState> {
  final AuthRepository _authRepository;
  final FlutterSecureStorage _secureStorage;
  final SharedPreferences _prefs;

  AuthNotifier({
    required AuthRepository authRepository,
    required FlutterSecureStorage secureStorage,
    required SharedPreferences prefs,
  })  : _authRepository = authRepository,
        _secureStorage = secureStorage,
        _prefs = prefs,
        super(AuthState());

  /// Initialize auth state - Check if user is logged in
  Future<void> checkAuthStatus() async {
    state = state.copyWith(isLoading: true);

    try {
      final token = await _secureStorage.read(key: AppConstants.authTokenKey);
      if (token != null && token.isNotEmpty) {
        // Load saved user data from secure storage
        final userDataJson = await _secureStorage.read(key: AppConstants.userDataKey);
        if (userDataJson != null && userDataJson.isNotEmpty) {
          final userMap = jsonDecode(userDataJson) as Map<String, dynamic>;
          final user = UserModel.fromJson(userMap);

          state = AuthState(
            user: user,
            isAuthenticated: true,
            isGuestMode: false,
            isLoading: false,
          );
        } else {
          // No saved user data, clear token and logout
          await logout();
          state = AuthState(isLoading: false, isGuestMode: false);
        }
      } else {
        // Check if guest mode was enabled
        final isGuest = _prefs.getBool(AppConstants.guestModeKey) ?? false;
        state = AuthState(isLoading: false, isGuestMode: isGuest);
      }
    } catch (e) {
      // Error loading saved data, clear everything
      await logout();
      state = AuthState(isLoading: false, isGuestMode: false);
    }
  }

  /// Enable guest mode
  Future<void> enableGuestMode() async {
    await _prefs.setBool(AppConstants.guestModeKey, true);
    state = AuthState(
      isAuthenticated: false,
      isGuestMode: true,
      isLoading: false,
    );
  }

  /// Disable guest mode (when user logs in)
  Future<void> disableGuestMode() async {
    await _prefs.remove(AppConstants.guestModeKey);
  }

  /// Login
  Future<bool> login(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final request = LoginRequest(email: email, password: password);

      // Try vendor login first to get shop data
      AuthResponseModel response;
      try {
        response = await _authRepository.vendorLogin(request);
      } catch (vendorError) {
        // If vendor login fails, try regular login
        response = await _authRepository.login(request);
      }

      // Save tokens
      await _secureStorage.write(key: AppConstants.authTokenKey, value: response.token);
      if (response.refreshToken != null) {
        await _secureStorage.write(key: AppConstants.refreshTokenKey, value: response.refreshToken!);
      }

      // Save user data
      await _saveUserData(response.user);

      // Disable guest mode if it was enabled
      await disableGuestMode();

      state = AuthState(
        user: response.user,
        isAuthenticated: true,
        isGuestMode: false,
        isLoading: false,
      );

      return true;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  /// Register
  Future<bool> register({
    required String email,
    required String password,
    String? name,
    String? phone,
  }) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final request = RegisterRequest(
        email: email,
        password: password,
        name: name,
        phone: phone,
      );

      final response = await _authRepository.register(request);

      // If no token in registration response, auto-login
      if (response.token == null) {
        // Registration successful but no token, now login
        return await login(email, password);
      }

      // Save tokens
      await _secureStorage.write(key: AppConstants.authTokenKey, value: response.token!);
      if (response.refreshToken != null) {
        await _secureStorage.write(key: AppConstants.refreshTokenKey, value: response.refreshToken!);
      }

      // Save user data
      await _saveUserData(response.user);

      // Disable guest mode if it was enabled
      await disableGuestMode();

      state = AuthState(
        user: response.user,
        isAuthenticated: true,
        isGuestMode: false,
        isLoading: false,
      );

      return true;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  /// Logout
  Future<void> logout() async {
    try {
      await _authRepository.logout();
    } catch (e) {
      // Continue with local logout even if API call fails
    } finally {
      // Clear all auth data
      await _secureStorage.delete(key: AppConstants.authTokenKey);
      await _secureStorage.delete(key: AppConstants.refreshTokenKey);
      await _secureStorage.delete(key: AppConstants.userDataKey);
      await _prefs.remove(AppConstants.guestModeKey);

      state = AuthState();
    }
  }

  /// Save user data to local storage
  Future<void> _saveUserData(UserModel user) async {
    final userJson = jsonEncode(user.toJson());
    await _secureStorage.write(key: AppConstants.userDataKey, value: userJson);
  }

  /// Clear error
  void clearError() {
    state = state.copyWith(error: null);
  }
}

/// Auth Repository Provider
final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository();
});

/// Secure Storage Provider
final secureStorageProvider = Provider<FlutterSecureStorage>((ref) {
  return const FlutterSecureStorage();
});

/// Shared Preferences Provider
final sharedPreferencesProvider = Provider<SharedPreferences>((ref) {
  throw UnimplementedError('SharedPreferences must be overridden in main.dart');
});

/// Auth Provider
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(
    authRepository: ref.watch(authRepositoryProvider),
    secureStorage: ref.watch(secureStorageProvider),
    prefs: ref.watch(sharedPreferencesProvider),
  );
});

/// Convenience getters
final isAuthenticatedProvider = Provider<bool>((ref) {
  return ref.watch(authProvider).isAuthenticated;
});

final currentUserProvider = Provider<UserModel?>((ref) {
  return ref.watch(authProvider).user;
});
