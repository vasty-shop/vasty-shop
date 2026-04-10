import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../constants/api_constants.dart';
import '../constants/app_constants.dart';
import '../network/dio_client.dart';
import 'mobile_config_model.dart';

class MobileConfigService {
  final DioClient _dioClient = DioClient.instance;

  /// Fetch mobile configuration from API
  Future<MobileConfig> fetchMobileConfig() async {
    try {
      final response = await _dioClient.get(
        ApiConstants.mobileConfig,
        options: Options(
          headers: {
            'x-shop-id': AppConstants.shopId,
          },
        ),
      );

      // Parse response
      final data = response.data['data'] as Map<String, dynamic>;
      debugPrint('📱 Mobile config received from API:');
      debugPrint('  - theme: ${data['theme']}');
      debugPrint('  - fontFamily: ${data['theme']?['fontFamily']}');
      return MobileConfig.fromJson(data);
    } on DioException catch (e) {
      print('❌ Error loading mobile config: $e');
      // Return default config on error
      return _getDefaultConfig();
    } catch (e) {
      print('❌ Unexpected error loading mobile config: $e');
      return _getDefaultConfig();
    }
  }

  /// Get default configuration (fallback)
  MobileConfig _getDefaultConfig() {
    return MobileConfig(
      theme: ThemeConfig(
        darkMode: false,
        textColor: '#1A2E05',
        fontFamily: 'Poppins',
        accentColor: '#A3E635',
        colorScheme: 'lime',
        borderRadius: 'large',
        primaryColor: '#65A30D',
        styleVariant: 'modern',
        surfaceColor: '#FFFFFF',
        secondaryColor: '#84CC16',
        backgroundColor: '#F7FEE7',
        textSecondaryColor: '#6B7280',
      ),
      navigation: NavigationConfig(
        type: 'bottom-tabs',
        style: 'default',
        showLabels: true,
        hapticFeedback: true,
      ),
      features: FeaturesConfig(
        darkMode: true,
        biometricAuth: true,
        pushNotifications: true,
      ),
      shopInfo: ShopInfo(
        id: AppConstants.shopId,
        name: 'database Shop',
        logo: null,
        description: null,
        category: null,
        businessEmail: 'info@database.com',
      ),
    );
  }
}

// Riverpod Providers
final mobileConfigServiceProvider = Provider<MobileConfigService>((ref) {
  return MobileConfigService();
});

final mobileConfigProvider = FutureProvider<MobileConfig>((ref) async {
  final service = ref.read(mobileConfigServiceProvider);
  return service.fetchMobileConfig();
});
