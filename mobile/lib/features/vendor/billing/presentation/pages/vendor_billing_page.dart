import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../../../core/services/stripe_service.dart';
import '../../data/models/billing_models.dart';
import '../providers/billing_provider.dart';

class VendorBillingPage extends ConsumerStatefulWidget {
  const VendorBillingPage({super.key});

  @override
  ConsumerState<VendorBillingPage> createState() => _VendorBillingPageState();
}

class _VendorBillingPageState extends ConsumerState<VendorBillingPage> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(billingProvider.notifier).loadBilling();
    });
  }

  @override
  Widget build(BuildContext context) {
    final billingState = ref.watch(billingProvider);
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: AppBar(
        title: Text('vendorBilling.title'.tr()),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.read(billingProvider.notifier).refresh(),
          ),
        ],
      ),
      body: billingState.isLoading
          ? const Center(child: CircularProgressIndicator())
          : billingState.error != null
              ? _buildErrorView(billingState.error!)
              : RefreshIndicator(
                  onRefresh: () => ref.read(billingProvider.notifier).refresh(),
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildCurrentSubscription(billingState),
                        const SizedBox(height: 24),
                        _buildPlansSection(billingState),
                        const SizedBox(height: 24),
                        _buildPaymentMethodsSection(billingState),
                        const SizedBox(height: 24),
                        _buildInvoicesSection(billingState),
                        const SizedBox(height: 32),
                      ],
                    ),
                  ),
                ),
    );
  }

  Widget _buildErrorView(String error) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, size: 64, color: Colors.grey[400]),
            const SizedBox(height: 16),
            Text(
              'vendorBilling.failedToLoad'.tr(),
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w500,
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 8),
            Text(
              error,
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey[500]),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () => ref.read(billingProvider.notifier).loadBilling(),
              icon: const Icon(Icons.refresh),
              label: Text('common.retry'.tr()),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCurrentSubscription(BillingState billingState) {
    final subscription = billingState.subscription;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            _getPlanColor(subscription.plan),
            _getPlanColor(subscription.plan).withValues(alpha: 0.7),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: _getPlanColor(subscription.plan).withValues(alpha: 0.3),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                'vendorBilling.currentPlan'.tr(),
                style: const TextStyle(
                  color: Colors.white70,
                  fontSize: 14,
                ),
              ),
              const Spacer(),
              _buildStatusBadge(subscription.status),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            subscription.plan.displayName,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 28,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            subscription.interval.displayName,
            style: const TextStyle(
              color: Colors.white70,
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 16),
          if (subscription.currentPeriodEnd != null) ...[
            Row(
              children: [
                Icon(
                  subscription.isCanceled ? Icons.event_busy : Icons.event,
                  color: Colors.white70,
                  size: 16,
                ),
                const SizedBox(width: 6),
                Text(
                  subscription.isCanceled
                      ? '${'vendorBilling.accessUntil'.tr()} ${DateFormat('MMM d, y').format(subscription.currentPeriodEnd!)}'
                      : '${'vendorBilling.nextBilling'.tr()} ${DateFormat('MMM d, y').format(subscription.currentPeriodEnd!)}',
                  style: const TextStyle(
                    color: Colors.white70,
                    fontSize: 13,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
          ],
          if (!subscription.isFree) ...[
            Row(
              children: [
                if (subscription.isCanceled)
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () => _resumeSubscription(),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: _getPlanColor(subscription.plan),
                      ),
                      child: Text('vendorBilling.resume'.tr()),
                    ),
                  )
                else
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => _showCancelDialog(),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.white,
                        side: const BorderSide(color: Colors.white54),
                      ),
                      child: Text('vendorBilling.cancel'.tr()),
                    ),
                  ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildStatusBadge(SubscriptionStatus status) {
    Color bgColor;
    Color textColor;

    switch (status) {
      case SubscriptionStatus.active:
        bgColor = Colors.green.withValues(alpha: 0.2);
        textColor = Colors.greenAccent;
        break;
      case SubscriptionStatus.trialing:
        bgColor = Colors.blue.withValues(alpha: 0.2);
        textColor = Colors.lightBlueAccent;
        break;
      case SubscriptionStatus.canceled:
        bgColor = Colors.orange.withValues(alpha: 0.2);
        textColor = Colors.orangeAccent;
        break;
      case SubscriptionStatus.pastDue:
        bgColor = Colors.red.withValues(alpha: 0.2);
        textColor = Colors.redAccent;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        status.displayName,
        style: TextStyle(
          color: textColor,
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildPlansSection(BillingState billingState) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(
              'vendorBilling.availablePlans'.tr(),
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const Spacer(),
          ],
        ),
        const SizedBox(height: 12),
        _buildIntervalToggle(billingState),
        const SizedBox(height: 16),
        ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: billingState.plans.length,
          separatorBuilder: (context, index) => const SizedBox(height: 12),
          itemBuilder: (context, index) {
            final plan = billingState.plans[index];
            return _PlanCard(
              plan: plan,
              billingState: billingState,
              onUpgrade: () => _handleUpgrade(plan),
            );
          },
        ),
      ],
    );
  }

  Widget _buildIntervalToggle(BillingState billingState) {
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Expanded(
            child: _IntervalButton(
              label: 'vendorBilling.monthly'.tr(),
              isSelected: billingState.selectedInterval == BillingInterval.month,
              onTap: () => ref.read(billingProvider.notifier).setInterval(BillingInterval.month),
            ),
          ),
          Expanded(
            child: _IntervalButton(
              label: 'vendorBilling.yearly'.tr(),
              badge: 'vendorBilling.twoMonthsFree'.tr(),
              isSelected: billingState.selectedInterval == BillingInterval.year,
              onTap: () => ref.read(billingProvider.notifier).setInterval(BillingInterval.year),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentMethodsSection(BillingState billingState) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(
              'vendorBilling.paymentMethods'.tr(),
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const Spacer(),
            TextButton.icon(
              onPressed: () => _addPaymentMethod(),
              icon: const Icon(Icons.add, size: 18),
              label: Text('vendorBilling.addMethod'.tr()),
            ),
          ],
        ),
        const SizedBox(height: 12),
        if (billingState.paymentMethods.isEmpty)
          _buildEmptyState(
            icon: Icons.credit_card_outlined,
            title: 'vendorBilling.noPaymentMethods'.tr(),
            subtitle: 'vendorBilling.noPaymentMethodsDesc'.tr(),
          )
        else
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: billingState.paymentMethods.length,
            separatorBuilder: (context, index) => const SizedBox(height: 8),
            itemBuilder: (context, index) {
              final method = billingState.paymentMethods[index];
              return _PaymentMethodCard(
                method: method,
                onDelete: () => _deletePaymentMethod(method),
              );
            },
          ),
      ],
    );
  }

  Widget _buildInvoicesSection(BillingState billingState) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'vendorBilling.invoiceHistory'.tr(),
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        if (billingState.invoices.isEmpty)
          _buildEmptyState(
            icon: Icons.receipt_long_outlined,
            title: 'vendorBilling.noInvoices'.tr(),
            subtitle: 'vendorBilling.noInvoicesDesc'.tr(),
          )
        else
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: billingState.invoices.length,
            separatorBuilder: (context, index) => const SizedBox(height: 8),
            itemBuilder: (context, index) {
              final invoice = billingState.invoices[index];
              return _InvoiceCard(
                invoice: invoice,
                onDownload: () => _downloadInvoice(invoice),
              );
            },
          ),
      ],
    );
  }

  Widget _buildEmptyState({
    required IconData icon,
    required String title,
    required String subtitle,
  }) {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Column(
        children: [
          Icon(icon, size: 48, color: Colors.grey[400]),
          const SizedBox(height: 12),
          Text(
            title,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w500,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 4),
          Text(
            subtitle,
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 14, color: Colors.grey[500]),
          ),
        ],
      ),
    );
  }

  Color _getPlanColor(PlanTier plan) {
    switch (plan) {
      case PlanTier.free:
        return Colors.grey[700]!;
      case PlanTier.starter:
        return Colors.blue[600]!;
      case PlanTier.pro:
        return Colors.purple[600]!;
      case PlanTier.business:
        return Colors.amber[700]!;
    }
  }

  Future<void> _handleUpgrade(Plan plan) async {
    final stripeService = StripeService();

    // Check if Stripe is configured
    if (!stripeService.isConfigured) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('vendorBilling.stripeNotConfigured'.tr()),
            backgroundColor: Colors.orange,
          ),
        );
      }
      return;
    }

    // Show loading indicator
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: Colors.white,
                ),
              ),
              const SizedBox(width: 12),
              Text('vendorBilling.preparingCheckout'.tr()),
            ],
          ),
          duration: const Duration(seconds: 10),
        ),
      );
    }

    final session = await ref.read(billingProvider.notifier).createCheckout(plan);

    // Clear loading snackbar
    if (mounted) {
      ScaffoldMessenger.of(context).hideCurrentSnackBar();
    }

    if (session != null && mounted) {
      // Open Stripe Checkout in browser
      final success = await stripeService.openCheckoutUrl(session.url);
      if (!success && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('vendorBilling.checkoutFailed'.tr()),
            backgroundColor: Colors.red,
          ),
        );
      }
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('vendorBilling.checkoutFailed'.tr()),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _addPaymentMethod() async {
    final stripeService = StripeService();

    // Check if Stripe is configured
    if (!stripeService.isConfigured) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('vendorBilling.stripeNotConfigured'.tr()),
            backgroundColor: Colors.orange,
          ),
        );
      }
      return;
    }

    final session = await ref.read(billingProvider.notifier).createSetupSession();
    if (session != null && mounted) {
      final success = await stripeService.openCheckoutUrl(session.url);
      if (success) {
        // Refresh billing data after returning from Stripe
        Future.delayed(const Duration(seconds: 2), () {
          if (mounted) {
            ref.read(billingProvider.notifier).refresh();
          }
        });
      }
    }
  }

  void _deletePaymentMethod(PaymentMethod method) {
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: Text('vendorBilling.deleteMethod'.tr()),
        content: Text(
          'vendorBilling.deleteMethodConfirm'.tr(args: ['•••• ${method.last4}']),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: Text('common.cancel'.tr()),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(dialogContext);
              final success = await ref.read(billingProvider.notifier).deletePaymentMethod(method.id);
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(
                      success
                          ? 'vendorBilling.methodDeleted'.tr()
                          : 'vendorBilling.deleteFailed'.tr(),
                    ),
                    backgroundColor: success ? Colors.green : Colors.red,
                  ),
                );
              }
            },
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: Text('common.delete'.tr()),
          ),
        ],
      ),
    );
  }

  Future<void> _downloadInvoice(Invoice invoice) async {
    if (invoice.invoiceUrl != null) {
      final stripeService = StripeService();
      await stripeService.openCheckoutUrl(invoice.invoiceUrl!);
    }
  }

  void _showCancelDialog() {
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: Text('vendorBilling.cancelSubscription'.tr()),
        content: Text('vendorBilling.cancelConfirm'.tr()),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: Text('vendorBilling.keepSubscription'.tr()),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(dialogContext);
              final success = await ref.read(billingProvider.notifier).cancelSubscription();
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(
                      success
                          ? 'vendorBilling.subscriptionCancelled'.tr()
                          : 'vendorBilling.cancelFailed'.tr(),
                    ),
                    backgroundColor: success ? Colors.green : Colors.red,
                  ),
                );
              }
            },
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: Text('vendorBilling.yesCancel'.tr()),
          ),
        ],
      ),
    );
  }

  Future<void> _resumeSubscription() async {
    final success = await ref.read(billingProvider.notifier).resumeSubscription();
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            success
                ? 'vendorBilling.subscriptionResumed'.tr()
                : 'vendorBilling.resumeFailed'.tr(),
          ),
          backgroundColor: success ? Colors.green : Colors.red,
        ),
      );
    }
  }
}

// Interval Toggle Button
class _IntervalButton extends StatelessWidget {
  final String label;
  final String? badge;
  final bool isSelected;
  final VoidCallback onTap;

  const _IntervalButton({
    required this.label,
    this.badge,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? Colors.white : Colors.transparent,
          borderRadius: BorderRadius.circular(10),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: Column(
          children: [
            Text(
              label,
              style: TextStyle(
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                color: isSelected ? Colors.black : Colors.grey[600],
              ),
            ),
            if (badge != null) ...[
              const SizedBox(height: 2),
              Text(
                badge!,
                style: TextStyle(
                  fontSize: 10,
                  color: Colors.green[600],
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

// Plan Card Widget
class _PlanCard extends StatelessWidget {
  final Plan plan;
  final BillingState billingState;
  final VoidCallback onUpgrade;

  const _PlanCard({
    required this.plan,
    required this.billingState,
    required this.onUpgrade,
  });

  @override
  Widget build(BuildContext context) {
    final isCurrentPlan = billingState.isCurrentPlan(plan);
    final canUpgrade = billingState.canUpgradeTo(plan);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isCurrentPlan
              ? Colors.blue
              : plan.isPopular
                  ? Colors.purple[300]!
                  : Colors.grey[200]!,
          width: isCurrentPlan || plan.isPopular ? 2 : 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          plan.name,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        if (plan.isPopular) ...[
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.purple[100],
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              'vendorBilling.popular'.tr(),
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w600,
                                color: Colors.purple[700],
                              ),
                            ),
                          ),
                        ],
                        if (isCurrentPlan) ...[
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.blue[100],
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              'vendorBilling.current'.tr(),
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w600,
                                color: Colors.blue[700],
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      plan.description,
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    billingState.getPriceForPlan(plan),
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    '/mo',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[600],
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Divider(),
          const SizedBox(height: 12),
          ...plan.features.take(4).map((feature) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Row(
                  children: [
                    Icon(Icons.check_circle, size: 16, color: Colors.green[600]),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        feature,
                        style: TextStyle(
                          fontSize: 13,
                          color: Colors.grey[700],
                        ),
                      ),
                    ),
                  ],
                ),
              )),
          if (plan.features.length > 4)
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Text(
                '+${plan.features.length - 4} ${'vendorBilling.moreFeatures'.tr()}',
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey[500],
                ),
              ),
            ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: isCurrentPlan || plan.tier == PlanTier.free ? null : onUpgrade,
              style: ElevatedButton.styleFrom(
                backgroundColor: canUpgrade ? Colors.blue : Colors.grey[300],
                foregroundColor: canUpgrade ? Colors.white : Colors.grey[600],
                padding: const EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: Text(
                isCurrentPlan
                    ? 'vendorBilling.currentPlan'.tr()
                    : canUpgrade
                        ? 'vendorBilling.upgrade'.tr()
                        : 'vendorBilling.downgrade'.tr(),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// Payment Method Card Widget
class _PaymentMethodCard extends StatelessWidget {
  final PaymentMethod method;
  final VoidCallback onDelete;

  const _PaymentMethodCard({
    required this.method,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.grey[100],
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              _getCardIcon(method.brand),
              size: 24,
              color: Colors.grey[700],
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      '${method.displayBrand} •••• ${method.last4}',
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    if (method.isDefault) ...[
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 6,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.green[100],
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          'vendorBilling.default'.tr(),
                          style: TextStyle(
                            fontSize: 10,
                            color: Colors.green[700],
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
                if (method.expiryDisplay.isNotEmpty)
                  Text(
                    '${'vendorBilling.expires'.tr()} ${method.expiryDisplay}',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[600],
                    ),
                  ),
              ],
            ),
          ),
          IconButton(
            onPressed: onDelete,
            icon: Icon(Icons.delete_outline, color: Colors.red[400]),
          ),
        ],
      ),
    );
  }

  IconData _getCardIcon(String? brand) {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return Icons.credit_card;
      case 'mastercard':
        return Icons.credit_card;
      case 'amex':
        return Icons.credit_card;
      default:
        return Icons.credit_card;
    }
  }
}

// Invoice Card Widget
class _InvoiceCard extends StatelessWidget {
  final Invoice invoice;
  final VoidCallback onDownload;

  const _InvoiceCard({
    required this.invoice,
    required this.onDownload,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.blue[50],
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(Icons.receipt, size: 24, color: Colors.blue[600]),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  invoice.description ?? 'Subscription',
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  DateFormat('MMM d, y').format(invoice.date),
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                invoice.formattedAmount,
                style: const TextStyle(
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 2),
              _buildInvoiceStatusBadge(invoice.status),
            ],
          ),
          const SizedBox(width: 8),
          if (invoice.invoiceUrl != null)
            IconButton(
              onPressed: onDownload,
              icon: Icon(Icons.download, color: Colors.blue[600]),
              tooltip: 'Download',
            ),
        ],
      ),
    );
  }

  Widget _buildInvoiceStatusBadge(InvoiceStatus status) {
    Color bgColor;
    Color textColor;

    switch (status) {
      case InvoiceStatus.paid:
        bgColor = Colors.green[100]!;
        textColor = Colors.green[700]!;
        break;
      case InvoiceStatus.pending:
        bgColor = Colors.orange[100]!;
        textColor = Colors.orange[700]!;
        break;
      case InvoiceStatus.failed:
        bgColor = Colors.red[100]!;
        textColor = Colors.red[700]!;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        status.displayName,
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w600,
          color: textColor,
        ),
      ),
    );
  }
}
