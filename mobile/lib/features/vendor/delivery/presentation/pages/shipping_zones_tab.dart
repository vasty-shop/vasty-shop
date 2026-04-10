import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../../shared/models/delivery_method_model.dart';
import '../../../../../shared/repositories/delivery_repository.dart';

import 'package:easy_localization/easy_localization.dart';

final shippingZonesProvider = FutureProvider.family<List<ShippingZoneModel>, String?>((ref, shopId) async {
  final repository = DeliveryRepository();
  return repository.getShippingZones(shopId: shopId);
});

class ShippingZonesTab extends ConsumerWidget {
  final String? shopId;

  const ShippingZonesTab({super.key, this.shopId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final zonesAsync = ref.watch(shippingZonesProvider(shopId));

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showAddZoneDialog(context, ref),
        icon: const Icon(Icons.add),
        label: Text('vendorDelivery.addZone'.tr()),
      ),
      body: zonesAsync.when(
        data: (zones) => RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(shippingZonesProvider(shopId));
          },
          child: zones.isEmpty
              ? ListView(
                  children: [
                    SizedBox(height: MediaQuery.of(context).size.height * 0.25),
                    Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.map_outlined, size: 100, color: Colors.grey.shade300),
                          const SizedBox(height: 16),
                          Text('vendorDelivery.noShippingZones'.tr(), style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 8),
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 32),
                            child: Text(
                              'vendorDelivery.shippingZonesDescription'.tr(),
                              style: TextStyle(color: Colors.grey.shade600),
                              textAlign: TextAlign.center,
                            ),
                          ),
                          const SizedBox(height: 24),
                          ElevatedButton.icon(
                            onPressed: () => _showAddZoneDialog(context, ref),
                            icon: const Icon(Icons.add),
                            label: Text('vendorDelivery.addZone'.tr()),
                          ),
                        ],
                      ),
                    ),
                  ],
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: zones.length,
                  itemBuilder: (context, index) {
                    final zone = zones[index];
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
                            // Header Row
                            Row(
                              children: [
                                // Gradient Icon
                                Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    gradient: LinearGradient(
                                      colors: zone.isActive
                                          ? [Colors.green.shade400, Colors.teal.shade500]
                                          : [Colors.grey.shade400, Colors.grey.shade500],
                                      begin: Alignment.topLeft,
                                      end: Alignment.bottomRight,
                                    ),
                                    borderRadius: BorderRadius.circular(12),
                                    boxShadow: [
                                      BoxShadow(
                                        color: (zone.isActive ? Colors.green : Colors.grey).withValues(alpha: 0.3),
                                        blurRadius: 8,
                                        offset: const Offset(0, 4),
                                      ),
                                    ],
                                  ),
                                  child: const Icon(Icons.map, color: Colors.white, size: 20),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        zone.name,
                                        style: const TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 16,
                                        ),
                                      ),
                                      if (zone.description != null &&
                                          zone.description!.isNotEmpty) ...[
                                        const SizedBox(height: 2),
                                        Text(
                                          zone.description!,
                                          style: TextStyle(
                                            fontSize: 12,
                                            color: Colors.grey.shade600,
                                          ),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ],
                                    ],
                                  ),
                                ),
                                // Status Badge
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                  decoration: BoxDecoration(
                                    color: zone.isActive
                                        ? Colors.green.shade100
                                        : Colors.grey.shade200,
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: Text(
                                    zone.isActive
                                        ? 'vendorDelivery.active'.tr()
                                        : 'vendorDelivery.inactive'.tr(),
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w600,
                                      color: zone.isActive
                                          ? Colors.green.shade700
                                          : Colors.grey.shade600,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),

                            // Zone Details
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: Colors.grey.shade50,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Column(
                                children: [
                                  Row(
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                        decoration: BoxDecoration(
                                          color: Colors.blue.shade100,
                                          borderRadius: BorderRadius.circular(8),
                                        ),
                                        child: Text(
                                          zone.typeDisplay,
                                          style: TextStyle(
                                            fontSize: 12,
                                            fontWeight: FontWeight.w600,
                                            color: Colors.blue.shade700,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  if (zone.locationDisplay.isNotEmpty) ...[
                                    const SizedBox(height: 10),
                                    Row(
                                      children: [
                                        Icon(Icons.location_on, size: 16, color: Colors.grey.shade600),
                                        const SizedBox(width: 6),
                                        Expanded(
                                          child: Text(
                                            zone.locationDisplay,
                                            style: TextStyle(
                                              fontSize: 13,
                                              color: Colors.grey.shade700,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                  if (zone.type == 'circle' && zone.radius != null) ...[
                                    const SizedBox(height: 8),
                                    Row(
                                      children: [
                                        Icon(Icons.radar, size: 16, color: Colors.grey.shade600),
                                        const SizedBox(width: 6),
                                        Text(
                                          '${zone.radius} km ${'vendorDelivery.coverageRadius'.tr().toLowerCase()}',
                                          style: TextStyle(
                                            fontSize: 13,
                                            color: Colors.grey.shade700,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ],
                              ),
                            ),
                            const SizedBox(height: 12),

                            // Action buttons
                            const Divider(height: 1),
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                Expanded(
                                  child: OutlinedButton.icon(
                                    onPressed: () => _showEditZoneDialog(context, ref, zone),
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
                                    onPressed: () => _confirmDeleteZone(context, ref, zone),
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
                  },
                ),
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(child: Text('Error: $error')),
      ),
    );
  }

  void _showAddZoneDialog(BuildContext context, WidgetRef ref) {
    final nameController = TextEditingController();
    final descriptionController = TextEditingController();
    final radiusController = TextEditingController(text: '10');
    final cityController = TextEditingController();
    final stateController = TextEditingController();
    final countryController = TextEditingController();
    final formKey = GlobalKey<FormState>();
    String selectedType = 'city';
    bool isActive = true;
    bool isLoading = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => Container(
          height: MediaQuery.of(context).size.height * 0.85,
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            children: [
              // Handle bar
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
                  children: [
                    Icon(Icons.map, color: Theme.of(context).colorScheme.primary),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'vendorDelivery.addZone'.tr(),
                        style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                      ),
                    ),
                    IconButton(
                      onPressed: () => Navigator.pop(context),
                      icon: const Icon(Icons.close),
                    ),
                  ],
                ),
              ),
              const Divider(height: 1),
              // Form
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Form(
                    key: formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Zone Name
                        TextFormField(
                          controller: nameController,
                          decoration: InputDecoration(
                            labelText: '${'vendorDelivery.zoneName'.tr()} *',
                            hintText: 'e.g., New York City Downtown',
                            border: const OutlineInputBorder(),
                            prefixIcon: const Icon(Icons.label),
                          ),
                          validator: (value) {
                            if (value == null || value.trim().isEmpty) {
                              return 'vendorDelivery.zoneNameRequired'.tr();
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 16),

                        // Description
                        TextFormField(
                          controller: descriptionController,
                          maxLines: 2,
                          decoration: InputDecoration(
                            labelText: 'vendorDelivery.description'.tr(),
                            hintText: 'vendorDelivery.zoneDescriptionPlaceholder'.tr(),
                            border: const OutlineInputBorder(),
                            prefixIcon: const Icon(Icons.description),
                          ),
                        ),
                        const SizedBox(height: 16),

                        // Zone Type
                        DropdownButtonFormField<String>(
                          value: selectedType,
                          decoration: InputDecoration(
                            labelText: '${'vendorDelivery.zoneType'.tr()} *',
                            border: const OutlineInputBorder(),
                            prefixIcon: const Icon(Icons.category),
                          ),
                          items: [
                            DropdownMenuItem(
                              value: 'city',
                              child: Text('vendorDelivery.zoneTypeCity'.tr()),
                            ),
                            DropdownMenuItem(
                              value: 'circle',
                              child: Text('vendorDelivery.zoneTypeCircle'.tr()),
                            ),
                            DropdownMenuItem(
                              value: 'postal_code',
                              child: Text('vendorDelivery.zoneTypePostalCode'.tr()),
                            ),
                          ],
                          onChanged: (value) {
                            setState(() => selectedType = value ?? 'city');
                          },
                        ),
                        const SizedBox(height: 16),

                        // Radius (only for circle type)
                        if (selectedType == 'circle') ...[
                          TextFormField(
                            controller: radiusController,
                            keyboardType: TextInputType.number,
                            decoration: InputDecoration(
                              labelText: '${'vendorDelivery.coverageRadius'.tr()} *',
                              hintText: '10',
                              border: const OutlineInputBorder(),
                              prefixIcon: const Icon(Icons.radar),
                              suffixText: 'km',
                            ),
                            validator: (value) {
                              if (selectedType == 'circle') {
                                if (value == null || value.isEmpty) {
                                  return 'vendorDelivery.radiusRequired'.tr();
                                }
                                final radius = double.tryParse(value);
                                if (radius == null || radius <= 0) {
                                  return 'vendorDelivery.invalidRadius'.tr();
                                }
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 16),
                        ],

                        // City and State Row
                        Row(
                          children: [
                            Expanded(
                              child: TextFormField(
                                controller: cityController,
                                decoration: InputDecoration(
                                  labelText: 'vendorDelivery.city'.tr(),
                                  hintText: 'e.g., New York',
                                  border: const OutlineInputBorder(),
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: TextFormField(
                                controller: stateController,
                                decoration: InputDecoration(
                                  labelText: 'vendorDelivery.stateProvince'.tr(),
                                  hintText: 'e.g., NY',
                                  border: const OutlineInputBorder(),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),

                        // Country
                        TextFormField(
                          controller: countryController,
                          decoration: InputDecoration(
                            labelText: 'vendorDelivery.country'.tr(),
                            hintText: 'e.g., USA',
                            border: const OutlineInputBorder(),
                            prefixIcon: const Icon(Icons.public),
                          ),
                        ),
                        const SizedBox(height: 16),

                        // Active Status
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.grey.shade100,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'vendorDelivery.activeStatus'.tr(),
                                      style: const TextStyle(fontWeight: FontWeight.w600),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      'vendorDelivery.enableZoneForDelivery'.tr(),
                                      style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                                    ),
                                  ],
                                ),
                              ),
                              Switch(
                                value: isActive,
                                onChanged: (value) => setState(() => isActive = value),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 24),
                      ],
                    ),
                  ),
                ),
              ),
              // Actions
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  border: Border(top: BorderSide(color: Colors.grey.shade200)),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: isLoading ? null : () => Navigator.pop(context),
                        child: Text('common.cancel'.tr()),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      flex: 2,
                      child: ElevatedButton(
                        onPressed: isLoading
                            ? null
                            : () async {
                                if (!formKey.currentState!.validate()) return;

                                if (shopId == null || shopId!.isEmpty) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Text('vendorDelivery.shopNotFound'.tr()),
                                      backgroundColor: Colors.red,
                                    ),
                                  );
                                  return;
                                }

                                setState(() => isLoading = true);

                                try {
                                  await DeliveryRepository().createShippingZone(
                                    name: nameController.text.trim(),
                                    description: descriptionController.text.trim(),
                                    type: selectedType,
                                    radius: selectedType == 'circle'
                                        ? double.tryParse(radiusController.text)
                                        : null,
                                    city: cityController.text.trim(),
                                    state: stateController.text.trim(),
                                    country: countryController.text.trim(),
                                    isActive: isActive,
                                    shopId: shopId!,
                                  );

                                  ref.invalidate(shippingZonesProvider(shopId));

                                  if (context.mounted) {
                                    Navigator.pop(context);
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                        content: Text('vendorDelivery.zoneCreated'.tr()),
                                        backgroundColor: Colors.green,
                                      ),
                                    );
                                  }
                                } catch (e) {
                                  setState(() => isLoading = false);
                                  if (context.mounted) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                        content: Text('Error: $e'),
                                        backgroundColor: Colors.red,
                                      ),
                                    );
                                  }
                                }
                              },
                        child: isLoading
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                              )
                            : Text('vendorDelivery.createZone'.tr()),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showEditZoneDialog(BuildContext context, WidgetRef ref, ShippingZoneModel zone) {
    final nameController = TextEditingController(text: zone.name);
    final descriptionController = TextEditingController(text: zone.description ?? '');
    final radiusController = TextEditingController(text: zone.radius?.toString() ?? '10');
    final formKey = GlobalKey<FormState>();
    bool isActive = zone.isActive;
    bool isLoading = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => Container(
          height: MediaQuery.of(context).size.height * 0.75,
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            children: [
              // Handle bar
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
                  children: [
                    Icon(Icons.edit, color: Theme.of(context).colorScheme.primary),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'vendorDelivery.editZone'.tr(),
                        style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                      ),
                    ),
                    IconButton(
                      onPressed: () => Navigator.pop(context),
                      icon: const Icon(Icons.close),
                    ),
                  ],
                ),
              ),
              const Divider(height: 1),
              // Form
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Form(
                    key: formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Read-only zone info (type, location)
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.blue.shade50,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: Colors.blue.shade100),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Icon(Icons.info_outline, size: 16, color: Colors.blue.shade700),
                                  const SizedBox(width: 8),
                                  Text(
                                    'vendorDelivery.zoneInfo'.tr(),
                                    style: TextStyle(
                                      fontWeight: FontWeight.w600,
                                      color: Colors.blue.shade700,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  Text(
                                    '${'vendorDelivery.zoneType'.tr()}: ',
                                    style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
                                  ),
                                  Text(
                                    zone.typeDisplay,
                                    style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 13),
                                  ),
                                ],
                              ),
                              if (zone.locationDisplay.isNotEmpty) ...[
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    Text(
                                      '${'vendorDelivery.location'.tr()}: ',
                                      style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
                                    ),
                                    Expanded(
                                      child: Text(
                                        zone.locationDisplay,
                                        style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 13),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),

                        // Zone Name
                        TextFormField(
                          controller: nameController,
                          decoration: InputDecoration(
                            labelText: '${'vendorDelivery.zoneName'.tr()} *',
                            hintText: 'e.g., New York City Downtown',
                            border: const OutlineInputBorder(),
                            prefixIcon: const Icon(Icons.label),
                          ),
                          validator: (value) {
                            if (value == null || value.trim().isEmpty) {
                              return 'vendorDelivery.zoneNameRequired'.tr();
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 16),

                        // Description
                        TextFormField(
                          controller: descriptionController,
                          maxLines: 2,
                          decoration: InputDecoration(
                            labelText: 'vendorDelivery.description'.tr(),
                            hintText: 'vendorDelivery.zoneDescriptionPlaceholder'.tr(),
                            border: const OutlineInputBorder(),
                            prefixIcon: const Icon(Icons.description),
                          ),
                        ),
                        const SizedBox(height: 16),

                        // Radius (only for circle type)
                        if (zone.type == 'circle') ...[
                          TextFormField(
                            controller: radiusController,
                            keyboardType: TextInputType.number,
                            decoration: InputDecoration(
                              labelText: '${'vendorDelivery.coverageRadius'.tr()} *',
                              hintText: '10',
                              border: const OutlineInputBorder(),
                              prefixIcon: const Icon(Icons.radar),
                              suffixText: 'km',
                            ),
                            validator: (value) {
                              if (zone.type == 'circle') {
                                if (value == null || value.isEmpty) {
                                  return 'vendorDelivery.radiusRequired'.tr();
                                }
                                final radius = double.tryParse(value);
                                if (radius == null || radius <= 0) {
                                  return 'vendorDelivery.invalidRadius'.tr();
                                }
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 16),
                        ],

                        // Active Status
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.grey.shade100,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'vendorDelivery.activeStatus'.tr(),
                                      style: const TextStyle(fontWeight: FontWeight.w600),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      'vendorDelivery.enableZoneForDelivery'.tr(),
                                      style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                                    ),
                                  ],
                                ),
                              ),
                              Switch(
                                value: isActive,
                                onChanged: (value) => setState(() => isActive = value),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 24),
                      ],
                    ),
                  ),
                ),
              ),
              // Actions
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  border: Border(top: BorderSide(color: Colors.grey.shade200)),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: isLoading ? null : () => Navigator.pop(context),
                        child: Text('common.cancel'.tr()),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      flex: 2,
                      child: ElevatedButton(
                        onPressed: isLoading
                            ? null
                            : () async {
                                if (!formKey.currentState!.validate()) return;

                                setState(() => isLoading = true);

                                try {
                                  await DeliveryRepository().updateShippingZone(
                                    id: zone.id,
                                    name: nameController.text.trim(),
                                    description: descriptionController.text.trim(),
                                    radius: zone.type == 'circle'
                                        ? double.tryParse(radiusController.text)
                                        : null,
                                    isActive: isActive,
                                    shopId: shopId,
                                  );

                                  ref.invalidate(shippingZonesProvider(shopId));

                                  if (context.mounted) {
                                    Navigator.pop(context);
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                        content: Text('vendorDelivery.zoneUpdated'.tr()),
                                        backgroundColor: Colors.green,
                                      ),
                                    );
                                  }
                                } catch (e) {
                                  setState(() => isLoading = false);
                                  if (context.mounted) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                        content: Text('Error: $e'),
                                        backgroundColor: Colors.red,
                                      ),
                                    );
                                  }
                                }
                              },
                        child: isLoading
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                              )
                            : Text('vendorDelivery.updateZone'.tr()),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _confirmDeleteZone(BuildContext context, WidgetRef ref, ShippingZoneModel zone) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('vendorDelivery.deleteZone'.tr()),
        content: Text('vendorDelivery.deleteZoneConfirm'.tr(args: [zone.name])),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('common.cancel'.tr()),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              try {
                await DeliveryRepository().deleteShippingZone(zone.id, shopId: shopId);
                ref.invalidate(shippingZonesProvider(shopId));
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('vendorDelivery.zoneDeleted'.tr())),
                  );
                }
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
                  );
                }
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: Text('common.delete'.tr()),
          ),
        ],
      ),
    );
  }
}
