import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../data/models/offer_models.dart';
import '../providers/offer_provider.dart';
import '../../../../../shared/models/product_model.dart';
import '../../../../../shared/repositories/product_repository.dart';

/// Apply To enum for offer targeting
enum ApplyTo { all, categories, products }

class VendorOffersPage extends ConsumerStatefulWidget {
  const VendorOffersPage({super.key});

  @override
  ConsumerState<VendorOffersPage> createState() => _VendorOffersPageState();
}

class _VendorOffersPageState extends ConsumerState<VendorOffersPage> {
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(offerProvider.notifier).loadOffers();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final offerState = ref.watch(offerProvider);

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        title: Text('vendorOffers.title'.tr()),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showCreateOfferSheet(),
        icon: const Icon(Icons.add),
        label: Text('vendorOffers.createOffer'.tr()),
      ),
      body: offerState.isLoading && offerState.offers.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : offerState.error != null && offerState.offers.isEmpty
              ? _buildErrorState(offerState.error!)
              : RefreshIndicator(
                  onRefresh: () async {
                    await ref.read(offerProvider.notifier).refresh();
                  },
                  child: ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      // Stats Cards
                      _buildStatsCards(offerState),
                      const SizedBox(height: 16),

                      // Search & Filter
                      _buildSearchAndFilter(offerState),
                      const SizedBox(height: 16),

                      // Offers List
                      if (offerState.filteredOffers.isEmpty)
                        _buildEmptyState(offerState)
                      else
                        ...offerState.filteredOffers.map((offer) => _buildOfferCard(offer)),
                    ],
                  ),
                ),
    );
  }

  Widget _buildStatsCards(OfferState state) {
    return Row(
      children: [
        Expanded(
          child: _buildStatCard(
            'vendorOffers.activeOffers'.tr(),
            '${state.statistics.activeOffers}',
            Icons.local_offer,
            [Colors.green.shade400, Colors.teal.shade500],
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _buildStatCard(
            'vendorOffers.totalUsage'.tr(),
            '${state.statistics.totalUsage}',
            Icons.people,
            [Colors.blue.shade400, Colors.cyan.shade500],
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _buildStatCard(
            'vendorOffers.revenueImpact'.tr(),
            '\$${state.statistics.revenueImpact.toStringAsFixed(0)}',
            Icons.attach_money,
            [Colors.purple.shade400, Colors.pink.shade400],
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _buildStatCard(
            'vendorOffers.conversion'.tr(),
            '${state.statistics.conversionRate.toStringAsFixed(1)}%',
            Icons.trending_up,
            [Colors.orange.shade400, Colors.red.shade400],
          ),
        ),
      ],
    );
  }

  Widget _buildStatCard(String label, String value, IconData icon, List<Color> gradientColors) {
    return Container(
      height: 90,
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: gradientColors,
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: gradientColors.first.withValues(alpha: 0.3),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Icon(icon, color: Colors.white, size: 18),
          Text(
            value,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          Text(
            label,
            style: TextStyle(
              fontSize: 9,
              color: Colors.white.withValues(alpha: 0.9),
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildSearchAndFilter(OfferState state) {
    final statuses = ['all', 'active', 'scheduled', 'expired'];

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          // Search
          TextField(
            controller: _searchController,
            decoration: InputDecoration(
              hintText: 'vendorOffers.searchPlaceholder'.tr(),
              prefixIcon: const Icon(Icons.search),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: Colors.grey.shade300),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: Colors.grey.shade300),
              ),
              filled: true,
              fillColor: Colors.grey.shade50,
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            ),
            onChanged: (value) {
              ref.read(offerProvider.notifier).setSearchQuery(value);
            },
          ),
          const SizedBox(height: 12),
          // Status filter
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: statuses.map((status) {
                final isSelected = state.selectedStatus == status;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    label: Text(
                      status == 'all'
                          ? 'vendorOffers.all'.tr()
                          : 'vendorOffers.status.$status'.tr(),
                      style: TextStyle(
                        color: isSelected ? Colors.white : Colors.grey.shade700,
                        fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                      ),
                    ),
                    selected: isSelected,
                    onSelected: (selected) {
                      ref.read(offerProvider.notifier).setStatusFilter(status);
                    },
                    selectedColor: Theme.of(context).colorScheme.primary,
                    backgroundColor: Colors.grey.shade100,
                    checkmarkColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOfferCard(Offer offer) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
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
          // Header
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: _getTypeGradient(offer.type),
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(
                  _getTypeIcon(offer.type),
                  color: Colors.white,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      offer.name,
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 15,
                      ),
                    ),
                    Text(
                      offer.type.displayName,
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey.shade500,
                      ),
                    ),
                  ],
                ),
              ),
              _buildStatusBadge(offer.status),
            ],
          ),
          const SizedBox(height: 12),

          // Coupon Code
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.grey.shade50,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: Colors.grey.shade300,
                style: BorderStyle.solid,
                width: 1,
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'vendorOffers.couponCode'.tr(),
                      style: TextStyle(
                        fontSize: 10,
                        color: Colors.grey.shade500,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      offer.code,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                        fontFamily: 'monospace',
                        letterSpacing: 1,
                      ),
                    ),
                  ],
                ),
                IconButton(
                  icon: const Icon(Icons.copy, size: 18),
                  onPressed: () => _copyCode(offer.code),
                  color: Colors.grey.shade600,
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),

          // Stats
          Row(
            children: [
              Expanded(
                child: _buildOfferStat(
                  'vendorOffers.discount'.tr(),
                  offer.formattedDiscount,
                ),
              ),
              Expanded(
                child: _buildOfferStat(
                  'vendorOffers.used'.tr(),
                  '${offer.usedCount}',
                ),
              ),
              Expanded(
                child: _buildOfferStat(
                  'vendorOffers.remaining'.tr(),
                  offer.usageLimit > 0 ? '${offer.remainingUses}' : '∞',
                ),
              ),
            ],
          ),

          // Progress bar (if usage limit)
          if (offer.usageLimit > 0) ...[
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'vendorOffers.usage'.tr(),
                  style: TextStyle(fontSize: 11, color: Colors.grey.shade500),
                ),
                Text(
                  '${offer.usagePercentage.toStringAsFixed(0)}%',
                  style: TextStyle(fontSize: 11, color: Colors.grey.shade500),
                ),
              ],
            ),
            const SizedBox(height: 4),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: offer.usagePercentage / 100,
                backgroundColor: Colors.grey.shade200,
                valueColor: AlwaysStoppedAnimation<Color>(
                  _getTypeGradient(offer.type).first,
                ),
                minHeight: 6,
              ),
            ),
          ],
          const SizedBox(height: 12),

          // Dates
          Row(
            children: [
              Icon(Icons.calendar_today, size: 14, color: Colors.grey.shade500),
              const SizedBox(width: 6),
              Text(
                '${_formatDate(offer.startDate)} - ${_formatDate(offer.endDate)}',
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey.shade500,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Actions
          const Divider(height: 1),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _buildActionButton(
                  icon: offer.status == OfferStatus.active
                      ? Icons.toggle_on
                      : Icons.toggle_off,
                  label: offer.status == OfferStatus.active
                      ? 'vendorOffers.active'.tr()
                      : 'vendorOffers.inactive'.tr(),
                  color: offer.status == OfferStatus.active
                      ? Colors.green
                      : Colors.grey,
                  onTap: () => _toggleStatus(offer),
                ),
              ),
              const SizedBox(width: 8),
              IconButton(
                icon: Icon(Icons.edit, color: Colors.blue.shade400, size: 20),
                onPressed: () => _showEditOfferSheet(offer),
              ),
              IconButton(
                icon: Icon(Icons.delete, color: Colors.red.shade400, size: 20),
                onPressed: () => _deleteOffer(offer),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildOfferStat(String label, String value) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: TextStyle(
            fontSize: 10,
            color: Colors.grey.shade500,
          ),
        ),
      ],
    );
  }

  Widget _buildStatusBadge(OfferStatus status) {
    Color color;
    switch (status) {
      case OfferStatus.active:
        color = Colors.green;
        break;
      case OfferStatus.scheduled:
        color = Colors.blue;
        break;
      case OfferStatus.expired:
        color = Colors.red;
        break;
      case OfferStatus.disabled:
        color = Colors.grey;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        status.displayName,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: color,
        ),
      ),
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: Colors.grey.shade100,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 18, color: color),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey.shade700,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState(OfferState state) {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.local_offer_outlined, size: 64, color: Colors.grey.shade300),
          const SizedBox(height: 16),
          Text(
            'vendorOffers.noOffers'.tr(),
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            state.searchQuery.isNotEmpty
                ? 'vendorOffers.noMatchingOffers'.tr()
                : 'vendorOffers.noOffersYet'.tr(),
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey.shade600,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: () => _showCreateOfferSheet(),
            icon: const Icon(Icons.add),
            label: Text('vendorOffers.createFirstOffer'.tr()),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState(String error) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, size: 64, color: Colors.red.shade300),
            const SizedBox(height: 16),
            Text(
              'vendorOffers.failedToLoad'.tr(),
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              error,
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey.shade600,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () {
                ref.read(offerProvider.notifier).loadOffers();
              },
              icon: const Icon(Icons.refresh),
              label: Text('common.retry'.tr()),
            ),
          ],
        ),
      ),
    );
  }

  IconData _getTypeIcon(OfferType type) {
    switch (type) {
      case OfferType.percentage:
        return Icons.percent;
      case OfferType.fixed:
        return Icons.attach_money;
      case OfferType.freeShipping:
        return Icons.local_shipping;
      case OfferType.bogo:
        return Icons.card_giftcard;
    }
  }

  List<Color> _getTypeGradient(OfferType type) {
    switch (type) {
      case OfferType.percentage:
        return [Colors.purple.shade400, Colors.pink.shade400];
      case OfferType.fixed:
        return [Colors.green.shade400, Colors.teal.shade400];
      case OfferType.freeShipping:
        return [Colors.blue.shade400, Colors.cyan.shade400];
      case OfferType.bogo:
        return [Colors.orange.shade400, Colors.red.shade400];
    }
  }

  String _formatDate(DateTime date) {
    return DateFormat('MMM d, y').format(date);
  }

  void _copyCode(String code) {
    Clipboard.setData(ClipboardData(text: code));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('vendorOffers.codeCopied'.tr()),
        backgroundColor: Colors.green,
        duration: const Duration(seconds: 2),
      ),
    );
  }

  Future<void> _toggleStatus(Offer offer) async {
    final success = await ref.read(offerProvider.notifier).toggleStatus(offer.id);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            success
                ? (offer.status == OfferStatus.active
                    ? 'vendorOffers.offerDeactivated'.tr()
                    : 'vendorOffers.offerActivated'.tr())
                : 'vendorOffers.updateFailed'.tr(),
          ),
          backgroundColor: success ? Colors.green : Colors.red,
        ),
      );
    }
  }

  Future<void> _deleteOffer(Offer offer) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('vendorOffers.deleteOffer'.tr()),
        content: Text('vendorOffers.deleteConfirm'.tr(args: [offer.name])),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text('common.cancel'.tr()),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: Text('common.delete'.tr()),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      final success = await ref.read(offerProvider.notifier).deleteOffer(offer.id);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              success
                  ? 'vendorOffers.offerDeleted'.tr()
                  : 'vendorOffers.deleteFailed'.tr(),
            ),
            backgroundColor: success ? Colors.green : Colors.red,
          ),
        );
      }
    }
  }

  void _showCreateOfferSheet() {
    _showOfferFormSheet(null);
  }

  void _showEditOfferSheet(Offer offer) {
    _showOfferFormSheet(offer);
  }

  void _showOfferFormSheet(Offer? existingOffer) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) => OfferFormSheet(
        existingOffer: existingOffer,
        onSave: (offer) async {
          String? error;
          if (existingOffer != null) {
            error = await ref.read(offerProvider.notifier).updateOffer(existingOffer.id, offer);
          } else {
            error = await ref.read(offerProvider.notifier).createOffer(offer);
          }

          if (mounted && sheetContext.mounted) {
            if (error == null) {
              // Success
              Navigator.pop(sheetContext);
              ScaffoldMessenger.of(sheetContext).showSnackBar(
                SnackBar(
                  content: Text(
                    existingOffer != null
                        ? 'vendorOffers.offerUpdated'.tr()
                        : 'vendorOffers.offerCreated'.tr(),
                  ),
                  backgroundColor: Colors.green,
                ),
              );
            } else {
              // Error - close sheet and show the actual error message
              Navigator.pop(sheetContext);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(error),
                  backgroundColor: Colors.red,
                  duration: const Duration(seconds: 4),
                ),
              );
            }
          }
        },
      ),
    );
  }
}

// Offer Form Sheet Widget
class OfferFormSheet extends StatefulWidget {
  final Offer? existingOffer;
  final Function(Offer) onSave;

  const OfferFormSheet({
    super.key,
    this.existingOffer,
    required this.onSave,
  });

  @override
  State<OfferFormSheet> createState() => _OfferFormSheetState();
}

class _OfferFormSheetState extends State<OfferFormSheet> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _codeController;
  late TextEditingController _discountController;
  late TextEditingController _minPurchaseController;
  late TextEditingController _usageLimitController;
  late TextEditingController _perCustomerController;
  late OfferType _selectedType;
  DateTime? _startDate;
  DateTime? _endDate;

  // Apply To fields
  ApplyTo _applyTo = ApplyTo.all;
  List<String> _selectedProducts = [];
  List<String> _selectedCategories = [];
  List<ProductModel> _products = [];
  List<CategoryModel> _categories = [];
  bool _isLoadingData = true;

  @override
  void initState() {
    super.initState();
    final offer = widget.existingOffer;
    _nameController = TextEditingController(text: offer?.name ?? '');
    _codeController = TextEditingController(text: offer?.code ?? '');
    _discountController = TextEditingController(
      text: offer?.discountValue.toString() ?? '',
    );
    _minPurchaseController = TextEditingController(
      text: offer?.minPurchase.toString() ?? '0',
    );
    _usageLimitController = TextEditingController(
      text: offer?.usageLimit.toString() ?? '0',
    );
    _perCustomerController = TextEditingController(
      text: offer?.perCustomerLimit.toString() ?? '1',
    );
    _selectedType = offer?.type ?? OfferType.percentage;
    _startDate = offer?.startDate;
    _endDate = offer?.endDate;

    // Initialize Apply To from existing offer
    if (offer != null) {
      _selectedProducts = List.from(offer.products);
      _selectedCategories = List.from(offer.categories);
      if (offer.categories.isNotEmpty) {
        _applyTo = ApplyTo.categories;
      } else if (offer.products.isNotEmpty) {
        _applyTo = ApplyTo.products;
      } else {
        _applyTo = ApplyTo.all;
      }
    }

    _loadCategoriesAndProducts();
  }

  Future<void> _loadCategoriesAndProducts() async {
    try {
      final repository = ProductRepository();
      final results = await Future.wait([
        repository.getCategories(),
        repository.getVendorProducts(shopId: '', limit: 1000),
      ]);

      if (mounted) {
        setState(() {
          _categories = results[0] as List<CategoryModel>;
          _products = results[1] as List<ProductModel>;
          _isLoadingData = false;
        });
      }
    } catch (e) {
      debugPrint('Failed to load categories/products: $e');
      if (mounted) {
        setState(() => _isLoadingData = false);
      }
    }
  }

  Widget _buildApplyToOption(ApplyTo value, String label, IconData icon) {
    final isSelected = _applyTo == value;
    final theme = Theme.of(context);

    return InkWell(
      onTap: () {
        setState(() {
          _applyTo = value;
          // Clear selections when switching
          if (value == ApplyTo.all) {
            _selectedProducts.clear();
            _selectedCategories.clear();
          } else if (value == ApplyTo.categories) {
            _selectedProducts.clear();
          } else if (value == ApplyTo.products) {
            _selectedCategories.clear();
          }
        });
      },
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isSelected
              ? theme.colorScheme.primary.withValues(alpha: 0.1)
              : Colors.grey.shade100,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? theme.colorScheme.primary : Colors.grey.shade300,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Column(
          children: [
            Icon(
              icon,
              color: isSelected ? theme.colorScheme.primary : Colors.grey.shade600,
              size: 24,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                color: isSelected ? theme.colorScheme.primary : Colors.grey.shade700,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _nameController.dispose();
    _codeController.dispose();
    _discountController.dispose();
    _minPurchaseController.dispose();
    _usageLimitController.dispose();
    _perCustomerController.dispose();
    super.dispose();
  }

  void _generateCode() {
    final code = 'PROMO${DateTime.now().millisecondsSinceEpoch.toString().substring(7).toUpperCase()}';
    _codeController.text = code;
  }

  Future<void> _selectDate(bool isStart) async {
    final initialDate = isStart
        ? (_startDate ?? DateTime.now())
        : (_endDate ?? DateTime.now().add(const Duration(days: 30)));

    final picked = await showDatePicker(
      context: context,
      initialDate: initialDate,
      firstDate: DateTime.now().subtract(const Duration(days: 1)),
      lastDate: DateTime.now().add(const Duration(days: 365 * 2)),
    );

    if (picked != null) {
      setState(() {
        if (isStart) {
          _startDate = picked;
        } else {
          _endDate = picked;
        }
      });
    }
  }

  void _submit() {
    if (!_formKey.currentState!.validate()) return;

    if (_startDate == null || _endDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('vendorOffers.selectDates'.tr())),
      );
      return;
    }

    if (_startDate!.isAfter(_endDate!)) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('vendorOffers.invalidDates'.tr())),
      );
      return;
    }

    // Determine products and categories based on applyTo
    List<String> products = [];
    List<String> categories = [];
    switch (_applyTo) {
      case ApplyTo.products:
        products = _selectedProducts;
        break;
      case ApplyTo.categories:
        categories = _selectedCategories;
        break;
      case ApplyTo.all:
        // Both empty means applies to all
        break;
    }

    final offer = Offer(
      id: widget.existingOffer?.id ?? '',
      name: _nameController.text.trim(),
      code: _codeController.text.trim().toUpperCase(),
      type: _selectedType,
      discountValue: double.tryParse(_discountController.text) ?? 0,
      minPurchase: double.tryParse(_minPurchaseController.text) ?? 0,
      startDate: _startDate!,
      endDate: _endDate!,
      usageLimit: int.tryParse(_usageLimitController.text) ?? 0,
      usedCount: widget.existingOffer?.usedCount ?? 0,
      perCustomerLimit: int.tryParse(_perCustomerController.text) ?? 1,
      status: widget.existingOffer?.status ?? OfferStatus.active,
      products: products,
      categories: categories,
    );

    widget.onSave(offer);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.9,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        children: [
          // Handle
          Container(
            margin: const EdgeInsets.only(top: 12),
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.grey.shade300,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          // Header
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  widget.existingOffer != null
                      ? 'vendorOffers.editOffer'.tr()
                      : 'vendorOffers.createOffer'.tr(),
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),
          const Divider(height: 1),
          // Form
          Expanded(
            child: Form(
              key: _formKey,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // Name
                  TextFormField(
                    controller: _nameController,
                    decoration: InputDecoration(
                      labelText: 'vendorOffers.offerName'.tr(),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'vendorOffers.nameRequired'.tr();
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),

                  // Code
                  Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: _codeController,
                          textCapitalization: TextCapitalization.characters,
                          decoration: InputDecoration(
                            labelText: 'vendorOffers.couponCode'.tr(),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'vendorOffers.codeRequired'.tr();
                            }
                            if (value.length < 3) {
                              return 'vendorOffers.codeMinLength'.tr();
                            }
                            return null;
                          },
                        ),
                      ),
                      const SizedBox(width: 8),
                      ElevatedButton(
                        onPressed: _generateCode,
                        child: Text('vendorOffers.generate'.tr()),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Type
                  Text(
                    'vendorOffers.offerType'.tr(),
                    style: const TextStyle(fontWeight: FontWeight.w500),
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: OfferType.values.map((type) {
                      final isSelected = _selectedType == type;
                      return ChoiceChip(
                        label: Text(type.displayName),
                        selected: isSelected,
                        onSelected: (selected) {
                          if (selected) {
                            setState(() => _selectedType = type);
                          }
                        },
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 16),

                  // Discount Value (if not free shipping)
                  if (_selectedType != OfferType.freeShipping) ...[
                    TextFormField(
                      controller: _discountController,
                      keyboardType: TextInputType.number,
                      decoration: InputDecoration(
                        labelText: _selectedType == OfferType.percentage
                            ? 'vendorOffers.discountPercent'.tr()
                            : 'vendorOffers.discountAmount'.tr(),
                        suffixText: _selectedType == OfferType.percentage ? '%' : '\$',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'vendorOffers.discountRequired'.tr();
                        }
                        final num = double.tryParse(value);
                        if (num == null || num <= 0) {
                          return 'vendorOffers.invalidDiscount'.tr();
                        }
                        if (_selectedType == OfferType.percentage && num > 100) {
                          return 'vendorOffers.maxPercent'.tr();
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                  ],

                  // Min Purchase
                  TextFormField(
                    controller: _minPurchaseController,
                    keyboardType: TextInputType.number,
                    decoration: InputDecoration(
                      labelText: 'vendorOffers.minPurchase'.tr(),
                      prefixText: '\$ ',
                      helperText: 'vendorOffers.minPurchaseHint'.tr(),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Apply To Section
                  Text(
                    'Apply To',
                    style: const TextStyle(fontWeight: FontWeight.w500),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: _buildApplyToOption(
                          ApplyTo.all,
                          'All Products',
                          Icons.shopping_bag_outlined,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: _buildApplyToOption(
                          ApplyTo.categories,
                          'Categories',
                          Icons.category_outlined,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: _buildApplyToOption(
                          ApplyTo.products,
                          'Products',
                          Icons.inventory_2_outlined,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Category Selection
                  if (_applyTo == ApplyTo.categories) ...[
                    if (_isLoadingData)
                      const Center(child: CircularProgressIndicator())
                    else if (_categories.isEmpty)
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.grey.shade100,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          'No categories available',
                          style: TextStyle(color: Colors.grey.shade600),
                          textAlign: TextAlign.center,
                        ),
                      )
                    else ...[
                      Text(
                        'Select Categories',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey.shade600,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Container(
                        decoration: BoxDecoration(
                          border: Border.all(color: Colors.grey.shade300),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        constraints: const BoxConstraints(maxHeight: 200),
                        child: ListView.builder(
                          shrinkWrap: true,
                          itemCount: _categories.length,
                          itemBuilder: (context, index) {
                            final category = _categories[index];
                            final isSelected = _selectedCategories.contains(category.id);
                            return CheckboxListTile(
                              title: Text(category.name),
                              value: isSelected,
                              onChanged: (value) {
                                setState(() {
                                  if (value == true) {
                                    _selectedCategories.add(category.id);
                                  } else {
                                    _selectedCategories.remove(category.id);
                                  }
                                });
                              },
                              dense: true,
                              controlAffinity: ListTileControlAffinity.leading,
                            );
                          },
                        ),
                      ),
                      if (_selectedCategories.isNotEmpty) ...[
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: _selectedCategories.map((catId) {
                            final cat = _categories.firstWhere(
                              (c) => c.id == catId,
                              orElse: () => CategoryModel(id: catId, name: 'Unknown', slug: ''),
                            );
                            return Chip(
                              label: Text(cat.name, style: const TextStyle(fontSize: 12)),
                              deleteIcon: const Icon(Icons.close, size: 16),
                              onDeleted: () {
                                setState(() => _selectedCategories.remove(catId));
                              },
                            );
                          }).toList(),
                        ),
                      ],
                    ],
                    const SizedBox(height: 16),
                  ],

                  // Product Selection
                  if (_applyTo == ApplyTo.products) ...[
                    if (_isLoadingData)
                      const Center(child: CircularProgressIndicator())
                    else if (_products.isEmpty)
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.grey.shade100,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          'No products available',
                          style: TextStyle(color: Colors.grey.shade600),
                          textAlign: TextAlign.center,
                        ),
                      )
                    else ...[
                      Text(
                        'Select Products',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey.shade600,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Container(
                        decoration: BoxDecoration(
                          border: Border.all(color: Colors.grey.shade300),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        constraints: const BoxConstraints(maxHeight: 200),
                        child: ListView.builder(
                          shrinkWrap: true,
                          itemCount: _products.length,
                          itemBuilder: (context, index) {
                            final product = _products[index];
                            final isSelected = _selectedProducts.contains(product.id);
                            return CheckboxListTile(
                              title: Text(
                                product.name,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              subtitle: Text(
                                '\$${product.price.toStringAsFixed(2)}',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.grey.shade600,
                                ),
                              ),
                              value: isSelected,
                              onChanged: (value) {
                                setState(() {
                                  if (value == true) {
                                    _selectedProducts.add(product.id);
                                  } else {
                                    _selectedProducts.remove(product.id);
                                  }
                                });
                              },
                              dense: true,
                              controlAffinity: ListTileControlAffinity.leading,
                            );
                          },
                        ),
                      ),
                      if (_selectedProducts.isNotEmpty) ...[
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: _selectedProducts.map((prodId) {
                            final prod = _products.firstWhere(
                              (p) => p.id == prodId,
                              orElse: () => ProductModel(
                                id: prodId,
                                name: 'Unknown',
                                brand: '',
                                price: 0,
                                images: [],
                                sizes: [],
                                rating: 0,
                                category: '',
                              ),
                            );
                            return Chip(
                              label: Text(prod.name, style: const TextStyle(fontSize: 12)),
                              deleteIcon: const Icon(Icons.close, size: 16),
                              onDeleted: () {
                                setState(() => _selectedProducts.remove(prodId));
                              },
                            );
                          }).toList(),
                        ),
                      ],
                    ],
                    const SizedBox(height: 16),
                  ],

                  // Dates
                  Row(
                    children: [
                      Expanded(
                        child: InkWell(
                          onTap: () => _selectDate(true),
                          child: InputDecorator(
                            decoration: InputDecoration(
                              labelText: 'vendorOffers.startDate'.tr(),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            child: Text(
                              _startDate != null
                                  ? DateFormat('MMM d, y').format(_startDate!)
                                  : 'vendorOffers.selectDate'.tr(),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: InkWell(
                          onTap: () => _selectDate(false),
                          child: InputDecorator(
                            decoration: InputDecoration(
                              labelText: 'vendorOffers.endDate'.tr(),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            child: Text(
                              _endDate != null
                                  ? DateFormat('MMM d, y').format(_endDate!)
                                  : 'vendorOffers.selectDate'.tr(),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Usage Limits
                  Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: _usageLimitController,
                          keyboardType: TextInputType.number,
                          decoration: InputDecoration(
                            labelText: 'vendorOffers.usageLimit'.tr(),
                            helperText: 'vendorOffers.usageLimitHint'.tr(),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: TextFormField(
                          controller: _perCustomerController,
                          keyboardType: TextInputType.number,
                          decoration: InputDecoration(
                            labelText: 'vendorOffers.perCustomer'.tr(),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 32),
                ],
              ),
            ),
          ),
          // Submit Button
          Padding(
            padding: EdgeInsets.only(
              left: 16,
              right: 16,
              bottom: MediaQuery.of(context).padding.bottom + 16,
            ),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _submit,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: Text(
                  widget.existingOffer != null
                      ? 'vendorOffers.updateOffer'.tr()
                      : 'vendorOffers.createOffer'.tr(),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
