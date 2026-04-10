import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../../../../../core/network/dio_client.dart';
import '../../../../../core/errors/error_handler.dart';
import '../models/billing_models.dart';

class BillingRepository {
  final DioClient _dioClient = DioClient.instance;

  /// Get current subscription
  Future<Subscription> getSubscription() async {
    try {
      debugPrint('Getting subscription...');

      final response = await _dioClient.get('/billing/subscription');

      debugPrint('Subscription fetched successfully');

      Map<String, dynamic> subscriptionData;
      if (response.data is Map && response.data['data'] != null) {
        subscriptionData = response.data['data'] as Map<String, dynamic>;
      } else if (response.data is Map) {
        subscriptionData = response.data as Map<String, dynamic>;
      } else {
        return Subscription.empty();
      }

      return Subscription.fromJson(subscriptionData);
    } on DioException catch (e) {
      debugPrint('Error fetching subscription: ${e.response?.statusCode}');
      // Return empty subscription for free users or on error
      if (e.response?.statusCode == 404) {
        return Subscription.empty();
      }
      throw ErrorHandler.handleError(e);
    } catch (e) {
      debugPrint('Unexpected error: $e');
      return Subscription.empty();
    }
  }

  /// Get available plans
  Future<List<Plan>> getPlans() async {
    try {
      debugPrint('Getting plans...');

      final response = await _dioClient.get('/billing/plans');

      debugPrint('Plans fetched successfully');

      List<dynamic> plansData;
      if (response.data is Map && response.data['plans'] != null) {
        plansData = response.data['plans'] as List<dynamic>;
      } else if (response.data is Map && response.data['data'] != null) {
        plansData = response.data['data'] as List<dynamic>;
      } else if (response.data is List) {
        plansData = response.data as List<dynamic>;
      } else {
        return Plan.getDefaultPlans();
      }

      return plansData.map((json) => Plan.fromJson(json)).toList();
    } on DioException catch (e) {
      debugPrint('Error fetching plans: ${e.response?.statusCode}');
      // Return default plans on error
      return Plan.getDefaultPlans();
    } catch (e) {
      debugPrint('Unexpected error: $e');
      return Plan.getDefaultPlans();
    }
  }

  /// Get usage and limits
  Future<BillingUsage> getUsage() async {
    try {
      debugPrint('Getting usage...');

      final response = await _dioClient.get('/billing/usage');

      debugPrint('Usage fetched successfully');

      if (response.data is Map) {
        return BillingUsage.fromJson(response.data);
      }
      return BillingUsage.empty();
    } on DioException catch (e) {
      debugPrint('Error fetching usage: ${e.response?.statusCode}');
      return BillingUsage.empty();
    } catch (e) {
      debugPrint('Unexpected error: $e');
      return BillingUsage.empty();
    }
  }

  /// Get invoices
  Future<List<Invoice>> getInvoices({int? limit, int? offset}) async {
    try {
      debugPrint('Getting invoices...');

      final queryParams = <String, dynamic>{
        if (limit != null) 'limit': limit,
        if (offset != null) 'offset': offset,
      };

      final response = await _dioClient.get(
        '/billing/invoices',
        queryParameters: queryParams,
      );

      debugPrint('Invoices fetched successfully');

      List<dynamic> invoicesData;
      if (response.data is Map && response.data['invoices'] != null) {
        invoicesData = response.data['invoices'] as List<dynamic>;
      } else if (response.data is Map && response.data['data'] != null) {
        invoicesData = response.data['data'] as List<dynamic>;
      } else if (response.data is List) {
        invoicesData = response.data as List<dynamic>;
      } else {
        return [];
      }

      return invoicesData.map((json) => Invoice.fromJson(json)).toList();
    } on DioException catch (e) {
      debugPrint('Error fetching invoices: ${e.response?.statusCode}');
      return [];
    } catch (e) {
      debugPrint('Unexpected error: $e');
      return [];
    }
  }

  /// Get payment methods
  Future<List<PaymentMethod>> getPaymentMethods() async {
    try {
      debugPrint('Getting payment methods...');

      final response = await _dioClient.get('/billing/payment-methods');

      debugPrint('Payment methods fetched successfully');

      List<dynamic> methodsData;
      if (response.data is Map && response.data['paymentMethods'] != null) {
        methodsData = response.data['paymentMethods'] as List<dynamic>;
      } else if (response.data is Map && response.data['data'] != null) {
        methodsData = response.data['data'] as List<dynamic>;
      } else if (response.data is List) {
        methodsData = response.data as List<dynamic>;
      } else {
        return [];
      }

      return methodsData.map((json) => PaymentMethod.fromJson(json)).toList();
    } on DioException catch (e) {
      debugPrint('Error fetching payment methods: ${e.response?.statusCode}');
      return [];
    } catch (e) {
      debugPrint('Unexpected error: $e');
      return [];
    }
  }

  /// Create checkout session for plan upgrade
  Future<CheckoutSession> createCheckout(String priceId) async {
    try {
      debugPrint('Creating checkout session for: $priceId');

      final response = await _dioClient.post(
        '/billing/checkout',
        data: {'priceId': priceId},
      );

      debugPrint('Checkout session created successfully');

      Map<String, dynamic> sessionData;
      if (response.data is Map && response.data['data'] != null) {
        sessionData = response.data['data'] as Map<String, dynamic>;
      } else if (response.data is Map) {
        sessionData = response.data as Map<String, dynamic>;
      } else {
        throw Exception('Invalid checkout response format');
      }

      return CheckoutSession.fromJson(sessionData);
    } on DioException catch (e) {
      debugPrint('Error creating checkout: ${e.response?.statusCode}');
      throw ErrorHandler.handleError(e);
    }
  }

  /// Create setup session for adding payment method
  Future<CheckoutSession> createSetupSession() async {
    try {
      debugPrint('Creating setup session...');

      final response = await _dioClient.post(
        '/billing/setup-session',
        data: {},
      );

      debugPrint('Setup session created successfully');

      Map<String, dynamic> sessionData;
      if (response.data is Map && response.data['data'] != null) {
        sessionData = response.data['data'] as Map<String, dynamic>;
      } else if (response.data is Map) {
        sessionData = response.data as Map<String, dynamic>;
      } else {
        throw Exception('Invalid setup session response format');
      }

      return CheckoutSession.fromJson(sessionData);
    } on DioException catch (e) {
      debugPrint('Error creating setup session: ${e.response?.statusCode}');
      throw ErrorHandler.handleError(e);
    }
  }

  /// Cancel subscription
  Future<Subscription> cancelSubscription({String? reason}) async {
    try {
      debugPrint('Cancelling subscription...');

      final response = await _dioClient.post(
        '/billing/subscription/cancel',
        data: {if (reason != null) 'reason': reason},
      );

      debugPrint('Subscription cancelled successfully');

      Map<String, dynamic> subscriptionData;
      if (response.data is Map && response.data['data'] != null) {
        subscriptionData = response.data['data'] as Map<String, dynamic>;
      } else if (response.data is Map) {
        subscriptionData = response.data as Map<String, dynamic>;
      } else {
        throw Exception('Invalid cancellation response format');
      }

      return Subscription.fromJson(subscriptionData);
    } on DioException catch (e) {
      debugPrint('Error cancelling subscription: ${e.response?.statusCode}');
      throw ErrorHandler.handleError(e);
    }
  }

  /// Resume subscription
  Future<Subscription> resumeSubscription() async {
    try {
      debugPrint('Resuming subscription...');

      final response = await _dioClient.post(
        '/billing/subscription/resume',
        data: {},
      );

      debugPrint('Subscription resumed successfully');

      Map<String, dynamic> subscriptionData;
      if (response.data is Map && response.data['data'] != null) {
        subscriptionData = response.data['data'] as Map<String, dynamic>;
      } else if (response.data is Map) {
        subscriptionData = response.data as Map<String, dynamic>;
      } else {
        throw Exception('Invalid resume response format');
      }

      return Subscription.fromJson(subscriptionData);
    } on DioException catch (e) {
      debugPrint('Error resuming subscription: ${e.response?.statusCode}');
      throw ErrorHandler.handleError(e);
    }
  }

  /// Delete payment method
  Future<void> deletePaymentMethod(String paymentMethodId) async {
    try {
      debugPrint('Deleting payment method: $paymentMethodId');

      await _dioClient.delete('/billing/payment-methods/$paymentMethodId');

      debugPrint('Payment method deleted successfully');
    } on DioException catch (e) {
      debugPrint('Error deleting payment method: ${e.response?.statusCode}');
      throw ErrorHandler.handleError(e);
    }
  }
}
