import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../../shared/models/delivery_method_model.dart';
import '../../../../../shared/repositories/delivery_repository.dart';


import 'package:easy_localization/easy_localization.dart';final deliveryMethodsProvider = FutureProvider.family<List<DeliveryMethodModel>, String?>((ref, shopId) async {
  final repository = DeliveryRepository();
  return repository.getDeliveryMethods(shopId: shopId);
});

class DeliveryMethodsTab extends ConsumerStatefulWidget {
  final String? shopId;

  const DeliveryMethodsTab({super.key, this.shopId});

  @override
  ConsumerState<DeliveryMethodsTab> createState() => _DeliveryMethodsTabState();
}

class _DeliveryMethodsTabState extends ConsumerState<DeliveryMethodsTab> {
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final methodsAsync = ref.watch(deliveryMethodsProvider(widget.shopId));

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showMethodSheet(null),
        backgroundColor: theme.colorScheme.primary,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add),
        label: Text('vendorDelivery.addMethod'.tr()),
      ),
      body: methodsAsync.when(
        data: (methods) => RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(deliveryMethodsProvider(widget.shopId));
          },
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              // Methods List
              if (methods.isEmpty)
                _buildEmptyState(theme)
              else
                ...methods.map((method) => _buildMethodCard(context, theme, method)),
            ],
          ),
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 48, color: Colors.red),
              const SizedBox(height: 16),
              Text('Error: ${error.toString()}'),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => ref.invalidate(deliveryMethodsProvider(widget.shopId)),
                child: Text('common.retry'.tr()),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showMethodSheet(DeliveryMethodModel? method) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) => _DeliveryMethodSheet(
        existingMethod: method,
        shopId: widget.shopId,
        onSaved: () {
          ref.invalidate(deliveryMethodsProvider(widget.shopId));
        },
      ),
    );
  }

  Widget _buildMethodCard(BuildContext context, ThemeData theme, DeliveryMethodModel method) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header with icon and toggle
            Row(
              children: [
                // Gradient Icon Container
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: method.isActive
                          ? [Colors.green.shade400, Colors.teal.shade500]
                          : [Colors.grey.shade400, Colors.grey.shade500],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: (method.isActive ? Colors.green : Colors.grey).withValues(alpha: 0.3),
                        blurRadius: 8,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: const Icon(Icons.local_shipping, color: Colors.white, size: 20),
                ),
                const SizedBox(width: 12),
                // Title and type
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        method.name,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        method.typeLabel,
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey.shade600,
                        ),
                      ),
                    ],
                  ),
                ),
                // Active Toggle
                Switch(
                  value: method.isActive,
                  onChanged: (value) {
                    // Toggle handled via edit
                  },
                  activeTrackColor: theme.colorScheme.primary.withValues(alpha: 0.5),
                  activeThumbColor: theme.colorScheme.primary,
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Stats Grid
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.grey.shade50,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: _buildStatItem(
                      'vendorDelivery.rate'.tr(),
                      method.baseCost == 0
                          ? 'vendorDelivery.free'.tr()
                          : '\$${method.baseCost.toStringAsFixed(2)}',
                    ),
                  ),
                  Container(
                    width: 1,
                    height: 36,
                    color: Colors.grey.shade300,
                  ),
                  Expanded(
                    child: _buildStatItem(
                      'vendorDelivery.delivery'.tr(),
                      '${method.estimatedDays} ${'vendorDelivery.days'.tr()}',
                    ),
                  ),
                  Container(
                    width: 1,
                    height: 36,
                    color: Colors.grey.shade300,
                  ),
                  Expanded(
                    child: _buildStatItem(
                      'vendorDelivery.carrier'.tr(),
                      method.carrier?.isNotEmpty == true ? method.carrier! : '-',
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Tracking badge
            if (method.trackingEnabled) ...[
              Row(
                children: [
                  Icon(Icons.check_circle, size: 16, color: Colors.green.shade600),
                  const SizedBox(width: 4),
                  Text(
                    'vendorDelivery.trackingEnabled'.tr(),
                    style: TextStyle(fontSize: 12, color: Colors.green.shade600),
                  ),
                ],
              ),
              const SizedBox(height: 12),
            ],

            // Action Buttons
            const Divider(height: 1),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => _handleEdit(method),
                    icon: Icon(Icons.edit, size: 16, color: Colors.blue.shade600),
                    label: Text(
                      'common.edit'.tr(),
                      style: TextStyle(color: Colors.blue.shade600),
                    ),
                    style: OutlinedButton.styleFrom(
                      side: BorderSide(color: Colors.blue.shade200),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => _handleDelete(method),
                    icon: Icon(Icons.delete, size: 16, color: Colors.red.shade600),
                    label: Text(
                      'common.delete'.tr(),
                      style: TextStyle(color: Colors.red.shade600),
                    ),
                    style: OutlinedButton.styleFrom(
                      side: BorderSide(color: Colors.red.shade200),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem(String label, String value) {
    return Column(
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 10,
            color: Colors.grey.shade600,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  void _handleEdit(DeliveryMethodModel method) {
    _showMethodSheet(method);
  }

  Widget _buildEmptyState(ThemeData theme) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.local_shipping_outlined,
              size: 100,
              color: Colors.grey.shade300,
            ),
            const SizedBox(height: 24),
            Text(
              'vendorDelivery.noDeliveryMethods'.tr(),
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.grey.shade700,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              'vendorDelivery.addDeliveryMethodsDescription'.tr(),
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 16,
                color: Colors.grey.shade600,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _handleDelete(DeliveryMethodModel method) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('vendorDelivery.deleteMethod'.tr()),
        content: Text('vendorDelivery.confirmDeleteMethod'.tr().replaceAll('{name}', method.name)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text('common.cancel'.tr()),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: Text('common.delete'.tr()),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        final repository = DeliveryRepository();
        await repository.deleteDeliveryMethod(method.id, shopId: widget.shopId);

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('vendorDelivery.methodDeletedSuccessfully'.tr()),
              backgroundColor: Colors.green,
            ),
          );
        }

        ref.invalidate(deliveryMethodsProvider(widget.shopId));
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Error: ${e.toString()}'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    }
  }

}

// Delivery Method Bottom Sheet
class _DeliveryMethodSheet extends StatefulWidget {
  final DeliveryMethodModel? existingMethod;
  final String? shopId;
  final VoidCallback onSaved;

  const _DeliveryMethodSheet({
    this.existingMethod,
    this.shopId,
    required this.onSaved,
  });

  @override
  State<_DeliveryMethodSheet> createState() => _DeliveryMethodSheetState();
}

class _DeliveryMethodSheetState extends State<_DeliveryMethodSheet> {
  final _nameController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _baseCostController = TextEditingController();
  final _estimatedDaysController = TextEditingController();
  final _carrierController = TextEditingController();
  String _selectedType = 'flat_rate';
  bool _isActive = true;
  bool _trackingEnabled = true;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    final method = widget.existingMethod;
    if (method != null) {
      _selectedType = method.type;
      _nameController.text = method.name;
      _descriptionController.text = method.description;
      _baseCostController.text = method.baseCost.toString();
      _estimatedDaysController.text = method.estimatedDays;
      _carrierController.text = method.carrier ?? '';
      _isActive = method.isActive;
      _trackingEnabled = method.trackingEnabled;
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _descriptionController.dispose();
    _baseCostController.dispose();
    _estimatedDaysController.dispose();
    _carrierController.dispose();
    super.dispose();
  }

  Future<void> _handleSave() async {
    if (_nameController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('vendorDelivery.pleaseEnterMethodName'.tr())),
      );
      return;
    }

    setState(() => _isSaving = true);

    try {
      final repository = DeliveryRepository();

      if (widget.existingMethod == null) {
        // Create new method
        await repository.createDeliveryMethod(
          type: _selectedType,
          name: _nameController.text.trim(),
          baseCost: double.tryParse(_baseCostController.text) ?? 0.0,
          estimatedDays: _estimatedDaysController.text.trim().isEmpty
              ? '3-5'
              : _estimatedDaysController.text.trim(),
          description: _descriptionController.text.trim(),
          isActive: _isActive,
          carrier: _carrierController.text.trim().isEmpty ? null : _carrierController.text.trim(),
          trackingEnabled: _trackingEnabled,
          shopId: widget.shopId,
        );
      } else {
        // Update existing method
        await repository.updateDeliveryMethod(
          id: widget.existingMethod!.id,
          type: _selectedType,
          name: _nameController.text.trim(),
          baseCost: double.tryParse(_baseCostController.text) ?? 0.0,
          estimatedDays: _estimatedDaysController.text.trim().isEmpty
              ? '3-5'
              : _estimatedDaysController.text.trim(),
          description: _descriptionController.text.trim(),
          isActive: _isActive,
          carrier: _carrierController.text.trim().isEmpty ? null : _carrierController.text.trim(),
          trackingEnabled: _trackingEnabled,
          zones: widget.existingMethod!.zones,
          shopId: widget.shopId,
        );
      }

      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              widget.existingMethod == null
                  ? 'vendorDelivery.deliveryMethodAddedSuccessfully'.tr()
                  : 'vendorDelivery.deliveryMethodUpdatedSuccessfully'.tr(),
            ),
            backgroundColor: Colors.green,
          ),
        );
        widget.onSaved();
      }
    } catch (e) {
      setState(() => _isSaving = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      height: MediaQuery.of(context).size.height * 0.85,
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
                  widget.existingMethod == null
                      ? 'vendorDelivery.addDeliveryMethod'.tr()
                      : 'vendorDelivery.editMethod'.tr(),
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
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                DropdownButtonFormField<String>(
                  initialValue: _selectedType,
                  decoration: InputDecoration(
                    labelText: 'vendorDelivery.type'.tr(),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  items: [
                    DropdownMenuItem(value: 'own_delivery', child: Text('vendorDelivery.ownDeliveryMan'.tr())),
                    DropdownMenuItem(value: 'flat_rate', child: Text('vendorDelivery.flatRate'.tr())),
                    DropdownMenuItem(value: 'free', child: Text('vendorDelivery.freeShipping'.tr())),
                    DropdownMenuItem(value: 'local_pickup', child: Text('vendorDelivery.localPickup'.tr())),
                    DropdownMenuItem(value: 'express', child: Text('vendorDelivery.express'.tr())),
                    DropdownMenuItem(value: 'same_day', child: Text('vendorDelivery.sameDayDelivery'.tr())),
                    DropdownMenuItem(value: 'next_day', child: Text('vendorDelivery.nextDayDelivery'.tr())),
                  ],
                  onChanged: (value) {
                    setState(() => _selectedType = value!);
                  },
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _nameController,
                  decoration: InputDecoration(
                    labelText: 'vendorDelivery.methodName'.tr(),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _descriptionController,
                  maxLines: 2,
                  decoration: InputDecoration(
                    labelText: 'vendorDelivery.description'.tr(),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _baseCostController,
                        keyboardType: TextInputType.number,
                        decoration: InputDecoration(
                          labelText: 'vendorDelivery.baseCost'.tr(),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: TextField(
                        controller: _estimatedDaysController,
                        decoration: InputDecoration(
                          labelText: 'vendorDelivery.estDays'.tr(),
                          hintText: '3-5',
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _carrierController,
                  decoration: InputDecoration(
                    labelText: 'vendorDelivery.carrier'.tr(),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: SwitchListTile(
                        value: _isActive,
                        onChanged: (value) => setState(() => _isActive = value),
                        title: Text('vendorDelivery.active'.tr()),
                        contentPadding: EdgeInsets.zero,
                      ),
                    ),
                    Expanded(
                      child: SwitchListTile(
                        value: _trackingEnabled,
                        onChanged: (value) => setState(() => _trackingEnabled = value),
                        title: Text('vendorDelivery.tracking'.tr()),
                        contentPadding: EdgeInsets.zero,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          // Save Button
          Padding(
            padding: EdgeInsets.only(
              left: 16,
              right: 16,
              bottom: MediaQuery.of(context).padding.bottom + 16,
            ),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isSaving ? null : _handleSave,
                style: ElevatedButton.styleFrom(
                  backgroundColor: theme.colorScheme.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: _isSaving
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      )
                    : Text(
                        widget.existingMethod == null
                            ? 'vendorDelivery.addMethod'.tr()
                            : 'vendorDelivery.updateMethod'.tr(),
                      ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
