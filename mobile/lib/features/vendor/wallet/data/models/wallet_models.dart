// Wallet Balance Model
import 'package:easy_localization/easy_localization.dart';
class WalletBalance {
  final double available;
  final double pending;
  final double onHold;
  final double totalEarnings;
  final double totalWithdrawn;
  final String currency;

  WalletBalance({
    required this.available,
    required this.pending,
    required this.onHold,
    required this.totalEarnings,
    required this.totalWithdrawn,
    required this.currency,
  });

  factory WalletBalance.fromJson(Map<String, dynamic> json) {
    return WalletBalance(
      available: (json['available'] ?? 0).toDouble(),
      pending: (json['pending'] ?? 0).toDouble(),
      onHold: (json['onHold'] ?? 0).toDouble(),
      totalEarnings: (json['totalEarnings'] ?? 0).toDouble(),
      totalWithdrawn: (json['totalWithdrawn'] ?? 0).toDouble(),
      currency: json['currency'] ?? 'USD',
    );
  }

  String get formattedAvailable => '\$${available.toStringAsFixed(2)}';
  String get formattedPending => '\$${pending.toStringAsFixed(2)}';
  String get formattedOnHold => '\$${onHold.toStringAsFixed(2)}';
  String get formattedTotalEarnings => '\$${totalEarnings.toStringAsFixed(2)}';
  String get formattedTotalWithdrawn => '\$${totalWithdrawn.toStringAsFixed(2)}';
}

// Payment Method Model
class PaymentMethod {
  final String id;
  final String shopId;
  final String method;
  final Map<String, dynamic> details;
  final bool isDefault;
  final bool isActive;
  final bool isVerified;
  final DateTime createdAt;

  PaymentMethod({
    required this.id,
    required this.shopId,
    required this.method,
    required this.details,
    required this.isDefault,
    required this.isActive,
    required this.isVerified,
    required this.createdAt,
  });

  factory PaymentMethod.fromJson(Map<String, dynamic> json) {
    return PaymentMethod(
      id: json['id'] ?? '',
      shopId: json['shopId'] ?? '',
      method: json['method'] ?? '',
      details: json['details'] ?? {},
      isDefault: json['isDefault'] ?? false,
      isActive: json['isActive'] ?? true,
      isVerified: json['isVerified'] ?? false,
      createdAt: DateTime.parse(json['createdAt']),
    );
  }

  String get displayName {
    switch (method) {
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'stripe_connect':
        return 'Stripe Connect';
      case 'paypal':
        return 'PayPal';
      case 'wallet':
        return 'Wallet';
      case 'check':
        return 'Check';
      default:
        return method;
    }
  }

  String get maskedDetails {
    if (method == 'bank_transfer' && details['accountNumber'] != null) {
      final account = details['accountNumber'] as String;
      if (account.length > 4) {
        return '****${account.substring(account.length - 4)}';
      }
      return account;
    } else if (method == 'paypal' && details['email'] != null) {
      final email = details['email'] as String;
      final parts = email.split('@');
      if (parts.length == 2) {
        return '${parts[0].substring(0, 2)}***@${parts[1]}';
      }
      return email;
    }
    return '';
  }
}

// Disbursement (Withdrawal) Model
class Disbursement {
  final String id;
  final String shopId;
  final double amount;
  final double fee;
  final double netAmount;
  final String currency;
  final String status;
  final String method;
  final String? paymentMethodId;
  final String? externalReference;
  final String? note;
  final DateTime? processedAt;
  final DateTime createdAt;

  Disbursement({
    required this.id,
    required this.shopId,
    required this.amount,
    required this.fee,
    required this.netAmount,
    required this.currency,
    required this.status,
    required this.method,
    this.paymentMethodId,
    this.externalReference,
    this.note,
    this.processedAt,
    required this.createdAt,
  });

  factory Disbursement.fromJson(Map<String, dynamic> json) {
    return Disbursement(
      id: json['id'] ?? '',
      shopId: json['shopId'] ?? '',
      amount: (json['amount'] ?? 0).toDouble(),
      fee: (json['fee'] ?? 0).toDouble(),
      netAmount: (json['netAmount'] ?? 0).toDouble(),
      currency: json['currency'] ?? 'USD',
      status: json['status'] ?? 'pending',
      method: json['method'] ?? '',
      paymentMethodId: json['paymentMethodId'],
      externalReference: json['externalReference'],
      note: json['note'],
      processedAt: json['processedAt'] != null
          ? DateTime.parse(json['processedAt'])
          : null,
      createdAt: DateTime.parse(json['createdAt']),
    );
  }

  String get formattedAmount => '\$${amount.toStringAsFixed(2)}';
  String get formattedFee => '\$${fee.toStringAsFixed(2)}';
  String get formattedNetAmount => '\$${netAmount.toStringAsFixed(2)}';

  bool get isPending => status == 'pending';
  bool get isProcessing => status == 'processing';
  bool get isCompleted => status == 'completed';
  bool get isFailed => status == 'failed';
  bool get isCancelled => status == 'cancelled';
  bool get isOnHold => status == 'on_hold';

  String get displayStatus {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'processing':
        return 'Processing';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      case 'cancelled':
        return 'Cancelled';
      case 'on_hold':
        return 'On Hold';
      default:
        return status;
    }
  }
}

// Disbursement Settings Model
class DisbursementSettings {
  final String shopId;
  final String schedule;
  final double minimumAmount;
  final int holdPeriodDays;
  final bool autoDisburse;
  final int? weeklyDay;
  final int? monthlyDay;

  DisbursementSettings({
    required this.shopId,
    required this.schedule,
    required this.minimumAmount,
    required this.holdPeriodDays,
    required this.autoDisburse,
    this.weeklyDay,
    this.monthlyDay,
  });

  factory DisbursementSettings.fromJson(Map<String, dynamic> json) {
    return DisbursementSettings(
      shopId: json['shopId'] ?? '',
      schedule: json['schedule'] ?? 'on_demand',
      minimumAmount: (json['minimumAmount'] ?? 0).toDouble(),
      holdPeriodDays: json['holdPeriodDays'] ?? 7,
      autoDisburse: json['autoDisburse'] ?? false,
      weeklyDay: json['weeklyDay'],
      monthlyDay: json['monthlyDay'],
    );
  }

  String get displaySchedule {
    switch (schedule) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      case 'biweekly':
        return 'Bi-weekly';
      case 'monthly':
        return 'Monthly';
      case 'on_demand':
        return 'On Demand';
      default:
        return schedule;
    }
  }
}
