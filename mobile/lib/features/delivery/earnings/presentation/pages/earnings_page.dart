import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../orders/data/repositories/delivery_repository.dart';

class EarningsPage extends ConsumerStatefulWidget {
  const EarningsPage({super.key});

  @override
  ConsumerState<EarningsPage> createState() => _EarningsPageState();
}

class _EarningsPageState extends ConsumerState<EarningsPage> {
  final DeliveryRepository _repository = DeliveryRepository();

  // Controllers for withdrawal
  final TextEditingController _amountController = TextEditingController();
  final TextEditingController _accountNumberController = TextEditingController();
  final TextEditingController _accountNameController = TextEditingController();
  final TextEditingController _bankNameController = TextEditingController();

  String _selectedPeriod = 'week';
  String _selectedPaymentMethod = 'bank';
  bool _isLoading = true;
  bool _isWithdrawing = false;
  String? _error;

  // Earnings data
  Map<String, dynamic> _earningsData = {};
  final List<Map<String, dynamic>> _transactions = [];

  @override
  void initState() {
    super.initState();
    _loadEarnings();
  }

  @override
  void dispose() {
    _amountController.dispose();
    _accountNumberController.dispose();
    _accountNameController.dispose();
    _bankNameController.dispose();
    super.dispose();
  }

  Future<void> _loadEarnings() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final earnings = await _repository.getEarnings(period: _selectedPeriod);

      setState(() {
        _earningsData = {
          'totalEarnings': earnings.totalEarnings,
          'pendingEarnings': earnings.totalEarnings, // Available balance
          'cashInHand': 0.0, // Will be from API if available
          'periodEarnings': _getPeriodEarnings(earnings),
          'periodDeliveries': _getPeriodDeliveries(earnings),
          'periodDeliveryFees': _getPeriodEarnings(earnings) * 0.85, // Estimate
          'periodTips': _getPeriodEarnings(earnings) * 0.15, // Estimate
        };
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
        _error = e.toString();
      });
    }
  }

  double _getPeriodEarnings(dynamic earnings) {
    switch (_selectedPeriod) {
      case 'today':
        return earnings.todayEarnings;
      case 'week':
        return earnings.weekEarnings;
      case 'month':
        return earnings.monthEarnings;
      default:
        return earnings.totalEarnings;
    }
  }

  int _getPeriodDeliveries(dynamic earnings) {
    switch (_selectedPeriod) {
      case 'today':
        return earnings.todayDeliveries;
      case 'week':
        return earnings.weekDeliveries;
      case 'month':
        return earnings.monthDeliveries;
      default:
        return earnings.totalDeliveries;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      body: _isLoading
          ? _buildLoadingState()
          : _error != null
              ? _buildErrorState()
              : RefreshIndicator(
                  onRefresh: _loadEarnings,
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Period Filter
                        _buildPeriodFilter(theme),
                        const SizedBox(height: 16),

                        // 4 Stats Cards
                        _buildStatsCards(theme),
                        const SizedBox(height: 16),

                        // Period Breakdown
                        _buildPeriodBreakdown(theme),
                        const SizedBox(height: 16),

                        // Recent Transactions
                        _buildRecentTransactions(theme),
                        const SizedBox(height: 100),
                      ],
                    ),
                  ),
                ),
    );
  }

  Widget _buildLoadingState() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          // Loading skeleton for 4 cards
          Row(
            children: [
              Expanded(child: _buildSkeletonCard()),
              const SizedBox(width: 12),
              Expanded(child: _buildSkeletonCard()),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(child: _buildSkeletonCard()),
              const SizedBox(width: 12),
              Expanded(child: _buildSkeletonCard()),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSkeletonCard() {
    return Container(
      height: 120,
      decoration: BoxDecoration(
        color: Colors.grey.shade200,
        borderRadius: BorderRadius.circular(16),
      ),
    );
  }

  Widget _buildErrorState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, size: 64, color: Colors.red.shade300),
            const SizedBox(height: 16),
            Text(
              'delivery.earnings.loadFailed'.tr(),
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _loadEarnings,
              child: Text('common.retry'.tr()),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPeriodFilter(ThemeData theme) {
    final periods = ['today', 'week', 'month', 'all'];

    return Row(
      children: [
        Icon(Icons.calendar_today, size: 20, color: theme.hintColor),
        const SizedBox(width: 8),
        Expanded(
          child: Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: theme.colorScheme.surfaceContainerHighest,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: periods.map((period) {
                final isSelected = _selectedPeriod == period;
                return Expanded(
                  child: GestureDetector(
                    onTap: () {
                      setState(() {
                        _selectedPeriod = period;
                      });
                      _loadEarnings();
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      decoration: BoxDecoration(
                        color: isSelected ? theme.colorScheme.surface : Colors.transparent,
                        borderRadius: BorderRadius.circular(6),
                        boxShadow: isSelected
                            ? [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.05),
                                  blurRadius: 4,
                                  offset: const Offset(0, 2),
                                )
                              ]
                            : null,
                      ),
                      child: Text(
                        'delivery.earnings.$period'.tr(),
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                          color: isSelected ? theme.colorScheme.onSurface : theme.hintColor,
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildStatsCards(ThemeData theme) {
    final totalEarnings = _earningsData['totalEarnings'] ?? 0.0;
    final pendingEarnings = _earningsData['pendingEarnings'] ?? 0.0;
    final cashInHand = _earningsData['cashInHand'] ?? 0.0;
    final periodEarnings = _earningsData['periodEarnings'] ?? 0.0;
    final periodDeliveries = _earningsData['periodDeliveries'] ?? 0;

    return Column(
      children: [
        // Row 1: Total Earnings & Available Balance
        IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Total Earnings (Green Gradient)
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [Colors.green.shade500, Colors.green.shade600],
                    ),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              'delivery.earnings.totalEarnings'.tr(),
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.green.shade100,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Icon(Icons.account_balance_wallet,
                              size: 16, color: Colors.white),
                          ),
                        ],
                      ),
                      const Spacer(),
                      Text(
                        '\$${totalEarnings.toStringAsFixed(2)}',
                        style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'delivery.earnings.lifetimeEarnings'.tr(),
                        style: TextStyle(
                          fontSize: 10,
                          color: Colors.green.shade100,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 12),
              // Available Balance
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.surface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: theme.dividerColor),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              'delivery.earnings.availableBalance'.tr(),
                              style: TextStyle(
                                fontSize: 12,
                                color: theme.hintColor,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: Colors.orange.shade100,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Icon(Icons.attach_money,
                              size: 16, color: Colors.orange.shade600),
                          ),
                        ],
                      ),
                      const Spacer(),
                      Text(
                        '\$${pendingEarnings.toStringAsFixed(2)}',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: theme.colorScheme.onSurface,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'delivery.earnings.readyToWithdraw'.tr(),
                        style: TextStyle(
                          fontSize: 10,
                          color: Colors.green.shade600,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        // Row 2: Cash In Hand & Period Earnings
        IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Cash In Hand
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.surface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: theme.dividerColor),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              'delivery.earnings.cashInHand'.tr(),
                              style: TextStyle(
                                fontSize: 12,
                                color: theme.hintColor,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: Colors.blue.shade100,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Icon(Icons.account_balance_wallet,
                              size: 16, color: Colors.blue.shade600),
                          ),
                        ],
                      ),
                      const Spacer(),
                      Text(
                        '\$${cashInHand.toStringAsFixed(2)}',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: theme.colorScheme.onSurface,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'delivery.earnings.toBeDeposited'.tr(),
                        style: TextStyle(
                          fontSize: 10,
                          color: theme.hintColor,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 12),
              // Period Earnings
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.surface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: theme.dividerColor),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              _getPeriodLabel(),
                              style: TextStyle(
                                fontSize: 12,
                                color: theme.hintColor,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: Colors.purple.shade100,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Icon(Icons.trending_up,
                              size: 16, color: Colors.purple.shade600),
                          ),
                        ],
                      ),
                      const Spacer(),
                      Text(
                        '\$${periodEarnings.toStringAsFixed(2)}',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: theme.colorScheme.onSurface,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '$periodDeliveries ${'delivery.dashboard.deliveries'.tr()}',
                        style: TextStyle(
                          fontSize: 10,
                          color: theme.hintColor,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        // Withdraw Button
        SizedBox(
          width: double.infinity,
          child: ElevatedButton.icon(
            onPressed: pendingEarnings > 0 ? () => _showWithdrawModal(pendingEarnings) : null,
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.orange.shade500,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            icon: const Icon(Icons.account_balance_wallet),
            label: Text(
              'delivery.earnings.withdrawFunds'.tr(),
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ),
      ],
    );
  }

  String _getPeriodLabel() {
    switch (_selectedPeriod) {
      case 'today':
        return 'delivery.earnings.today'.tr();
      case 'week':
        return 'delivery.earnings.thisWeek'.tr();
      case 'month':
        return 'delivery.earnings.thisMonth'.tr();
      default:
        return 'delivery.earnings.allTime'.tr();
    }
  }

  Widget _buildPeriodBreakdown(ThemeData theme) {
    final periodDeliveryFees = _earningsData['periodDeliveryFees'] ?? 0.0;
    final periodTips = _earningsData['periodTips'] ?? 0.0;
    final periodEarnings = _earningsData['periodEarnings'] ?? 0.0;

    if (periodEarnings <= 0) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: theme.dividerColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '${_getPeriodLabel()} ${'delivery.earnings.breakdown'.tr()}',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: theme.colorScheme.onSurface,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              // Delivery Fees
              Expanded(
                child: _buildBreakdownItem(
                  icon: Icons.local_shipping,
                  iconColor: Colors.green,
                  label: 'delivery.earnings.deliveryFees'.tr(),
                  value: '\$${periodDeliveryFees.toStringAsFixed(2)}',
                  theme: theme,
                ),
              ),
              const SizedBox(width: 12),
              // Tips
              Expanded(
                child: _buildBreakdownItem(
                  icon: Icons.card_giftcard,
                  iconColor: Colors.blue,
                  label: 'delivery.earnings.tips'.tr(),
                  value: '\$${periodTips.toStringAsFixed(2)}',
                  theme: theme,
                ),
              ),
              const SizedBox(width: 12),
              // Total
              Expanded(
                child: _buildBreakdownItem(
                  icon: Icons.trending_up,
                  iconColor: Colors.orange,
                  label: 'delivery.earnings.total'.tr(),
                  value: '\$${periodEarnings.toStringAsFixed(2)}',
                  theme: theme,
                  isTotal: true,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildBreakdownItem({
    required IconData icon,
    required Color iconColor,
    required String label,
    required String value,
    required ThemeData theme,
    bool isTotal = false,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isTotal ? Colors.orange.shade50 : theme.colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: iconColor.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, size: 20, color: iconColor),
          ),
          const SizedBox(height: 8),
          Text(
            label,
            style: TextStyle(
              fontSize: 10,
              color: theme.hintColor,
            ),
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: isTotal ? Colors.orange.shade600 : theme.colorScheme.onSurface,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRecentTransactions(ThemeData theme) {
    return Container(
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: theme.dividerColor),
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Text(
                  'delivery.earnings.recentTransactions'.tr(),
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: theme.colorScheme.onSurface,
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1),
          if (_transactions.isEmpty)
            Padding(
              padding: const EdgeInsets.all(32),
              child: Column(
                children: [
                  Icon(Icons.attach_money, size: 48, color: theme.hintColor),
                  const SizedBox(height: 16),
                  Text(
                    'delivery.earnings.noTransactions'.tr(),
                    style: TextStyle(color: theme.hintColor),
                  ),
                ],
              ),
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _transactions.length,
              separatorBuilder: (context, index) => const Divider(height: 1),
              itemBuilder: (context, index) {
                final transaction = _transactions[index];
                return _buildTransactionItem(transaction, theme);
              },
            ),
        ],
      ),
    );
  }

  Widget _buildTransactionItem(Map<String, dynamic> transaction, ThemeData theme) {
    final isWithdrawal = transaction['type'] == 'WITHDRAWAL';
    final amount = transaction['amount'] as double? ?? 0.0;

    return ListTile(
      leading: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: theme.colorScheme.surfaceContainerHighest,
          shape: BoxShape.circle,
        ),
        child: Icon(
          isWithdrawal ? Icons.arrow_upward : Icons.arrow_downward,
          size: 20,
          color: isWithdrawal ? Colors.red : Colors.green,
        ),
      ),
      title: Text(
        transaction['description'] ?? '',
        style: TextStyle(
          fontWeight: FontWeight.w500,
          color: theme.colorScheme.onSurface,
        ),
      ),
      subtitle: Text(
        transaction['date'] ?? '',
        style: TextStyle(
          fontSize: 12,
          color: theme.hintColor,
        ),
      ),
      trailing: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Text(
            '${amount >= 0 ? '+' : ''}\$${amount.abs().toStringAsFixed(2)}',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: amount >= 0 ? Colors.green : Colors.red,
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: Colors.green.shade100,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              'delivery.earnings.completed'.tr(),
              style: TextStyle(
                fontSize: 10,
                color: Colors.green.shade700,
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showWithdrawModal(double availableBalance) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) {
          final theme = Theme.of(context);
          return Container(
            decoration: BoxDecoration(
              color: theme.colorScheme.surface,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
            ),
            padding: EdgeInsets.only(
              bottom: MediaQuery.of(context).viewInsets.bottom,
            ),
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'delivery.earnings.withdrawFunds'.tr(),
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: () => Navigator.pop(context),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Available Balance
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [Colors.green.shade50, Colors.green.shade100],
                      ),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.green.shade200),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'delivery.earnings.availableBalance'.tr(),
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.green.shade700,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '\$${availableBalance.toStringAsFixed(2)}',
                          style: TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.bold,
                            color: Colors.green.shade700,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Amount Input
                  Text(
                    'delivery.earnings.withdrawalAmount'.tr(),
                    style: const TextStyle(fontWeight: FontWeight.w500),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _amountController,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    decoration: InputDecoration(
                      prefixText: '\$ ',
                      hintText: '0.00',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      suffixIcon: TextButton(
                        onPressed: () {
                          _amountController.text = availableBalance.toStringAsFixed(2);
                        },
                        child: Text('delivery.earnings.withdrawAll'.tr()),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Payment Method
                  Text(
                    'delivery.earnings.paymentMethod'.tr(),
                    style: const TextStyle(fontWeight: FontWeight.w500),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: _buildPaymentOption(
                          'bank',
                          'delivery.earnings.bank'.tr(),
                          Icons.account_balance,
                          setModalState,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _buildPaymentOption(
                          'cash',
                          'delivery.earnings.cash'.tr(),
                          Icons.money,
                          setModalState,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Bank Details
                  if (_selectedPaymentMethod == 'bank') ...[
                    TextField(
                      controller: _bankNameController,
                      decoration: InputDecoration(
                        labelText: 'delivery.earnings.bankName'.tr(),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _accountNumberController,
                      decoration: InputDecoration(
                        labelText: 'delivery.earnings.accountNumber'.tr(),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _accountNameController,
                      decoration: InputDecoration(
                        labelText: 'delivery.earnings.accountHolderName'.tr(),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ],

                  // Cash Note
                  if (_selectedPaymentMethod == 'cash')
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.yellow.shade50,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.yellow.shade200),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.info_outline, color: Colors.orange),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              'delivery.earnings.cashWithdrawalNote'.tr(),
                              style: const TextStyle(fontSize: 12),
                            ),
                          ),
                        ],
                      ),
                    ),
                  const SizedBox(height: 24),

                  // Action Buttons
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () {
                            Navigator.pop(context);
                            _clearWithdrawForm();
                          },
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: Text('common.cancel'.tr()),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: _isWithdrawing ? null : () => _handleWithdraw(context),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.orange.shade500,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: _isWithdrawing
                              ? const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: Colors.white,
                                  ),
                                )
                              : Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    const Icon(Icons.arrow_upward, size: 18),
                                    const SizedBox(width: 8),
                                    Text('delivery.earnings.withdraw'.tr()),
                                  ],
                                ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildPaymentOption(
    String value,
    String label,
    IconData icon,
    StateSetter setModalState,
  ) {
    final isSelected = _selectedPaymentMethod == value;
    return GestureDetector(
      onTap: () {
        setModalState(() {
          _selectedPaymentMethod = value;
        });
        setState(() {});
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected ? Colors.orange.shade50 : Colors.grey.shade100,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? Colors.orange.shade500 : Colors.grey.shade300,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Column(
          children: [
            Icon(
              icon,
              size: 28,
              color: isSelected ? Colors.orange.shade600 : Colors.grey.shade600,
            ),
            const SizedBox(height: 8),
            Text(
              label,
              style: TextStyle(
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                color: isSelected ? Colors.orange.shade700 : Colors.grey.shade700,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _clearWithdrawForm() {
    _amountController.clear();
    _accountNumberController.clear();
    _accountNameController.clear();
    _bankNameController.clear();
    setState(() {
      _selectedPaymentMethod = 'bank';
    });
  }

  Future<void> _handleWithdraw(BuildContext modalContext) async {
    final amount = double.tryParse(_amountController.text);
    final navigator = Navigator.of(modalContext);
    final messenger = ScaffoldMessenger.of(context);

    if (amount == null || amount <= 0) {
      messenger.showSnackBar(
        SnackBar(content: Text('delivery.earnings.invalidAmount'.tr())),
      );
      return;
    }

    final availableBalance = _earningsData['pendingEarnings'] ?? 0.0;

    if (amount > availableBalance) {
      messenger.showSnackBar(
        SnackBar(
          content: Text('${'delivery.earnings.insufficientBalance'.tr()}: \$${availableBalance.toStringAsFixed(2)}'),
        ),
      );
      return;
    }

    if (_selectedPaymentMethod == 'bank' &&
        (_accountNumberController.text.isEmpty || _bankNameController.text.isEmpty)) {
      messenger.showSnackBar(
        SnackBar(content: Text('delivery.earnings.enterBankDetails'.tr())),
      );
      return;
    }

    setState(() {
      _isWithdrawing = true;
    });

    try {
      await _repository.requestWithdrawal(
        amount: amount,
        paymentMethod: _selectedPaymentMethod,
        paymentDetails: {
          'accountNumber': _accountNumberController.text,
          'accountName': _accountNameController.text,
          'bankName': _bankNameController.text,
          'method': _selectedPaymentMethod,
        },
      );

      if (mounted) {
        navigator.pop();
        messenger.showSnackBar(
          SnackBar(
            content: Text('delivery.earnings.withdrawalSuccess'.tr()),
            backgroundColor: Colors.green,
          ),
        );
        _clearWithdrawForm();
        _loadEarnings();
      }
    } catch (e) {
      if (mounted) {
        messenger.showSnackBar(
          SnackBar(
            content: Text('delivery.earnings.withdrawalFailed'.tr()),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isWithdrawing = false;
        });
      }
    }
  }
}
