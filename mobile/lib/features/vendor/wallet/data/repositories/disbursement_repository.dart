import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../../../../../core/network/dio_client.dart';
import '../../../../../core/errors/error_handler.dart';
import '../models/wallet_models.dart';


import 'package:easy_localization/easy_localization.dart';class DisbursementRepository {
  final DioClient _dioClient = DioClient.instance;

  /// Get wallet balance
  Future<WalletBalance> getBalance(String shopId) async {
    try {
      debugPrint('💰 Fetching wallet balance for shop: $shopId');

      final response = await _dioClient.get('/disbursements/balance/$shopId');

      debugPrint('✅ Balance fetched successfully');

      Map<String, dynamic> balanceData;
      if (response.data is Map && response.data['data'] != null) {
        balanceData = response.data['data'] as Map<String, dynamic>;
      } else if (response.data is Map) {
        balanceData = response.data as Map<String, dynamic>;
      } else {
        throw Exception('Invalid balance data format');
      }

      return WalletBalance.fromJson(balanceData);
    } on DioException catch (e) {
      debugPrint('❌ Error fetching balance: ${e.response?.statusCode}');
      debugPrint('   Error: ${e.response?.data}');
      throw ErrorHandler.handleError(e);
    } catch (e) {
      debugPrint('❌ Unexpected error: $e');
      rethrow;
    }
  }

  /// Get payment methods
  Future<List<PaymentMethod>> getPaymentMethods(String shopId) async {
    try {
      debugPrint('💳 Fetching payment methods for shop: $shopId');

      final response = await _dioClient.get('/disbursements/payment-methods/$shopId');

      debugPrint('✅ Payment methods fetched successfully');

      List<dynamic> methodsData;
      if (response.data is Map && response.data['data'] != null) {
        methodsData = response.data['data'] as List;
      } else if (response.data is List) {
        methodsData = response.data as List;
      } else {
        methodsData = [];
      }

      return methodsData
          .map((json) => PaymentMethod.fromJson(json as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      debugPrint('❌ Error fetching payment methods: ${e.response?.statusCode}');
      throw ErrorHandler.handleError(e);
    }
  }

  /// Add payment method
  Future<PaymentMethod> addPaymentMethod({
    required String shopId,
    required String method,
    required Map<String, dynamic> details,
    bool isDefault = false,
  }) async {
    try {
      debugPrint('➕ Adding payment method: $method');

      final response = await _dioClient.post(
        '/disbursements/payment-methods',
        data: {
          'shopId': shopId,
          'method': method,
          'details': details,
          'isDefault': isDefault,
        },
      );

      debugPrint('✅ Payment method added successfully');

      Map<String, dynamic> methodData;
      if (response.data is Map && response.data['data'] != null) {
        methodData = response.data['data'] as Map<String, dynamic>;
      } else if (response.data is Map) {
        methodData = response.data as Map<String, dynamic>;
      } else {
        throw Exception('Invalid payment method data format');
      }

      return PaymentMethod.fromJson(methodData);
    } on DioException catch (e) {
      debugPrint('❌ Error adding payment method: ${e.response?.statusCode}');
      throw ErrorHandler.handleError(e);
    }
  }

  /// Request disbursement (withdrawal)
  Future<Disbursement> requestDisbursement({
    required String shopId,
    double? amount,
    String? paymentMethodId,
    String? note,
  }) async {
    try {
      debugPrint('💸 Requesting disbursement for shop: $shopId');
      debugPrint('   Amount: ${amount ?? 'full balance'}');

      final response = await _dioClient.post(
        '/disbursements/request',
        data: {
          'shopId': shopId,
          if (amount != null) 'amount': amount,
          if (paymentMethodId != null) 'paymentMethodId': paymentMethodId,
          if (note != null) 'note': note,
        },
      );

      debugPrint('✅ Disbursement requested successfully');

      Map<String, dynamic> disbursementData;
      if (response.data is Map && response.data['data'] != null) {
        disbursementData = response.data['data'] as Map<String, dynamic>;
      } else if (response.data is Map) {
        disbursementData = response.data as Map<String, dynamic>;
      } else {
        throw Exception('Invalid disbursement data format');
      }

      return Disbursement.fromJson(disbursementData);
    } on DioException catch (e) {
      debugPrint('❌ Error requesting disbursement: ${e.response?.statusCode}');
      debugPrint('   Error: ${e.response?.data}');
      throw ErrorHandler.handleError(e);
    }
  }

  /// Get disbursement history
  Future<List<Disbursement>> getDisbursements({
    required String shopId,
    String? status,
    DateTime? startDate,
    DateTime? endDate,
    int limit = 50,
    int offset = 0,
  }) async {
    try {
      debugPrint('📜 Fetching disbursement history for shop: $shopId');

      final queryParams = <String, dynamic>{
        'limit': limit,
        'offset': offset,
        if (status != null) 'status': status,
        if (startDate != null) 'startDate': startDate.toIso8601String(),
        if (endDate != null) 'endDate': endDate.toIso8601String(),
      };

      final response = await _dioClient.get(
        '/disbursements/shop/$shopId',
        queryParameters: queryParams,
      );

      debugPrint('✅ Disbursement history fetched successfully');

      List<dynamic> disbursementsData;
      if (response.data is Map && response.data['data'] != null) {
        disbursementsData = response.data['data'] as List;
      } else if (response.data is List) {
        disbursementsData = response.data as List;
      } else {
        disbursementsData = [];
      }

      return disbursementsData
          .map((json) => Disbursement.fromJson(json as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      debugPrint('❌ Error fetching disbursements: ${e.response?.statusCode}');
      throw ErrorHandler.handleError(e);
    }
  }

  /// Cancel disbursement
  Future<void> cancelDisbursement({
    required String disbursementId,
    required String shopId,
  }) async {
    try {
      debugPrint('🚫 Cancelling disbursement: $disbursementId');

      await _dioClient.delete('/disbursements/$disbursementId/shop/$shopId');

      debugPrint('✅ Disbursement cancelled successfully');
    } on DioException catch (e) {
      debugPrint('❌ Error cancelling disbursement: ${e.response?.statusCode}');
      throw ErrorHandler.handleError(e);
    }
  }

  /// Get disbursement settings
  Future<DisbursementSettings> getSettings(String shopId) async {
    try {
      debugPrint('⚙️ Fetching disbursement settings for shop: $shopId');

      final response = await _dioClient.get('/disbursements/settings/$shopId');

      debugPrint('✅ Settings fetched successfully');

      Map<String, dynamic> settingsData;
      if (response.data is Map && response.data['data'] != null) {
        settingsData = response.data['data'] as Map<String, dynamic>;
      } else if (response.data is Map) {
        settingsData = response.data as Map<String, dynamic>;
      } else {
        throw Exception('Invalid settings data format');
      }

      return DisbursementSettings.fromJson(settingsData);
    } on DioException catch (e) {
      debugPrint('❌ Error fetching settings: ${e.response?.statusCode}');
      throw ErrorHandler.handleError(e);
    }
  }

  /// Update disbursement settings
  Future<DisbursementSettings> updateSettings({
    required String shopId,
    String? schedule,
    double? minimumAmount,
    int? holdPeriodDays,
    bool? autoDisburse,
    int? weeklyDay,
    int? monthlyDay,
  }) async {
    try {
      debugPrint('⚙️ Updating disbursement settings for shop: $shopId');

      final response = await _dioClient.post(
        '/disbursements/settings',
        data: {
          'shopId': shopId,
          if (schedule != null) 'schedule': schedule,
          if (minimumAmount != null) 'minimumAmount': minimumAmount,
          if (holdPeriodDays != null) 'holdPeriodDays': holdPeriodDays,
          if (autoDisburse != null) 'autoDisburse': autoDisburse,
          if (weeklyDay != null) 'weeklyDay': weeklyDay,
          if (monthlyDay != null) 'monthlyDay': monthlyDay,
        },
      );

      debugPrint('✅ Settings updated successfully');

      Map<String, dynamic> settingsData;
      if (response.data is Map && response.data['data'] != null) {
        settingsData = response.data['data'] as Map<String, dynamic>;
      } else if (response.data is Map) {
        settingsData = response.data as Map<String, dynamic>;
      } else {
        throw Exception('Invalid settings data format');
      }

      return DisbursementSettings.fromJson(settingsData);
    } on DioException catch (e) {
      debugPrint('❌ Error updating settings: ${e.response?.statusCode}');
      throw ErrorHandler.handleError(e);
    }
  }
}
