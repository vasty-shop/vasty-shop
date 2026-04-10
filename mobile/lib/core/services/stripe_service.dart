import 'package:flutter/material.dart';
import 'package:flutter_stripe/flutter_stripe.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:url_launcher/url_launcher.dart';

/// Stripe service for handling payment operations
class StripeService {
  static final StripeService _instance = StripeService._internal();
  factory StripeService() => _instance;
  StripeService._internal();

  bool _isInitialized = false;
  bool _hasPublishableKey = false;

  /// Initialize Stripe with publishable key
  Future<void> initialize() async {
    if (_isInitialized) {
      debugPrint('ℹ️ Stripe already initialized');
      return;
    }

    debugPrint('🔄 Initializing Stripe...');
    debugPrint('🔄 dotenv keys available: ${dotenv.env.keys.toList()}');

    final publishableKey = dotenv.env['STRIPE_PUBLISHABLE_KEY'] ?? '';
    final merchantId = dotenv.env['STRIPE_MERCHANT_ID'];

    debugPrint('🔄 STRIPE_PUBLISHABLE_KEY length: ${publishableKey.length}');

    if (publishableKey.isEmpty || !publishableKey.startsWith('pk_')) {
      debugPrint('⚠️ Stripe publishable key not configured or invalid');
      debugPrint('⚠️ Key value: ${publishableKey.isEmpty ? "(empty)" : "${publishableKey.substring(0, publishableKey.length.clamp(0, 10))}..."}');
      // Still set flag to allow URL-based checkout
      _hasPublishableKey = false;
      return;
    }

    _hasPublishableKey = true;
    debugPrint('✅ Stripe publishable key found: ${publishableKey.substring(0, 15)}...');

    try {
      Stripe.publishableKey = publishableKey;

      if (merchantId != null && merchantId.isNotEmpty) {
        Stripe.merchantIdentifier = merchantId;
      }

      // Set URL scheme for return URLs (iOS)
      Stripe.urlScheme = 'databaseshop';

      await Stripe.instance.applySettings();
      _isInitialized = true;
      debugPrint('✅ Stripe SDK initialized successfully');
    } catch (e) {
      debugPrint('⚠️ Stripe SDK init failed (URL checkout still works): $e');
      // URL-based checkout will still work even if SDK init fails
    }
  }

  /// Check if Stripe is properly configured for URL-based checkout
  /// (subscriptions use hosted checkout which only needs URL launching)
  bool get isConfigured => _hasPublishableKey || _isInitialized;

  /// Check if Stripe SDK is fully initialized (for Payment Sheet)
  bool get isSdkInitialized => _isInitialized;

  /// Open Stripe Checkout URL in browser
  /// Used for subscription checkout sessions
  Future<bool> openCheckoutUrl(String url) async {
    try {
      final uri = Uri.parse(url);
      if (await canLaunchUrl(uri)) {
        await launchUrl(
          uri,
          mode: LaunchMode.externalApplication,
        );
        return true;
      } else {
        debugPrint('Could not launch Stripe checkout URL');
        return false;
      }
    } catch (e) {
      debugPrint('Error opening checkout URL: $e');
      return false;
    }
  }

  /// Present Payment Sheet for one-time payments
  /// Requires clientSecret from PaymentIntent
  Future<bool> presentPaymentSheet({
    required String clientSecret,
    String? merchantDisplayName,
    String? customerId,
    String? customerEphemeralKeySecret,
  }) async {
    if (!_isInitialized) {
      debugPrint('Stripe not initialized');
      return false;
    }

    try {
      // Initialize the payment sheet
      await Stripe.instance.initPaymentSheet(
        paymentSheetParameters: SetupPaymentSheetParameters(
          paymentIntentClientSecret: clientSecret,
          merchantDisplayName: merchantDisplayName ?? 'database Shop',
          customerId: customerId,
          customerEphemeralKeySecret: customerEphemeralKeySecret,
          style: ThemeMode.system,
          appearance: const PaymentSheetAppearance(
            colors: PaymentSheetAppearanceColors(
              primary: Color(0xFF84cc16), // lime color matching frontend
            ),
            shapes: PaymentSheetShape(
              borderRadius: 12,
              shadow: PaymentSheetShadowParams(color: Colors.black12),
            ),
          ),
        ),
      );

      // Present the payment sheet
      await Stripe.instance.presentPaymentSheet();
      debugPrint('✅ Payment completed successfully');
      return true;
    } on StripeException catch (e) {
      debugPrint('Stripe error: ${e.error.localizedMessage}');
      return false;
    } catch (e) {
      debugPrint('Payment sheet error: $e');
      return false;
    }
  }

  /// Present Setup Sheet for adding payment methods
  /// Used when setting up payment methods without immediate payment
  Future<bool> presentSetupSheet({
    required String setupIntentClientSecret,
    String? merchantDisplayName,
    String? customerId,
    String? customerEphemeralKeySecret,
  }) async {
    if (!_isInitialized) {
      debugPrint('Stripe not initialized');
      return false;
    }

    try {
      await Stripe.instance.initPaymentSheet(
        paymentSheetParameters: SetupPaymentSheetParameters(
          setupIntentClientSecret: setupIntentClientSecret,
          merchantDisplayName: merchantDisplayName ?? 'database Shop',
          customerId: customerId,
          customerEphemeralKeySecret: customerEphemeralKeySecret,
          style: ThemeMode.system,
          appearance: const PaymentSheetAppearance(
            colors: PaymentSheetAppearanceColors(
              primary: Color(0xFF84cc16),
            ),
            shapes: PaymentSheetShape(
              borderRadius: 12,
            ),
          ),
        ),
      );

      await Stripe.instance.presentPaymentSheet();
      debugPrint('✅ Payment method added successfully');
      return true;
    } on StripeException catch (e) {
      if (e.error.code == FailureCode.Canceled) {
        debugPrint('User canceled setup');
        return false;
      }
      debugPrint('Stripe setup error: ${e.error.localizedMessage}');
      return false;
    } catch (e) {
      debugPrint('Setup sheet error: $e');
      return false;
    }
  }

  /// Confirm a card payment with Payment Intent
  Future<PaymentIntent?> confirmPayment(String clientSecret) async {
    if (!_isInitialized) {
      debugPrint('Stripe not initialized');
      return null;
    }

    try {
      final paymentIntent = await Stripe.instance.confirmPayment(
        paymentIntentClientSecret: clientSecret,
      );
      return paymentIntent;
    } on StripeException catch (e) {
      debugPrint('Confirm payment error: ${e.error.localizedMessage}');
      return null;
    }
  }

  /// Check if Apple Pay is available (iOS only)
  Future<bool> isApplePayAvailable() async {
    try {
      return await Stripe.instance.isPlatformPaySupported();
    } catch (e) {
      return false;
    }
  }

  /// Check if Google Pay is available (Android only)
  Future<bool> isGooglePayAvailable() async {
    try {
      return await Stripe.instance.isPlatformPaySupported();
    } catch (e) {
      return false;
    }
  }
}
