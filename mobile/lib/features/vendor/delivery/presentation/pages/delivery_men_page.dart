import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../../shared/models/delivery_man_model.dart';
import '../../../../../shared/repositories/delivery_man_repository.dart';
import '../providers/delivery_man_provider.dart';


import 'package:easy_localization/easy_localization.dart';class DeliveryMenPage extends ConsumerStatefulWidget {
  final String? shopId;

  const DeliveryMenPage({super.key, this.shopId});

  @override
  ConsumerState<DeliveryMenPage> createState() => _DeliveryMenPageState();
}

class _DeliveryMenPageState extends ConsumerState<DeliveryMenPage> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(deliveryManProvider(widget.shopId).notifier).loadDeliveryMen();
      ref.read(deliveryManProvider(widget.shopId).notifier).loadDeliveryZones();
    });
  }

  void _showAddDeliveryManSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) => _DeliveryManSheet(
        shopId: widget.shopId,
        zones: ref.read(deliveryManProvider(widget.shopId)).zones,
        onSaved: () {
          ref.read(deliveryManProvider(widget.shopId).notifier).refreshDeliveryMen();
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final deliveryState = ref.watch(deliveryManProvider(widget.shopId));

    // Listen to messages
    ref.listen<DeliveryManState>(
      deliveryManProvider(widget.shopId),
      (previous, next) {
        if (next.error != null) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(next.error!),
              backgroundColor: Colors.red,
            ),
          );
          ref.read(deliveryManProvider(widget.shopId).notifier).clearMessages();
        }
        if (next.successMessage != null) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(next.successMessage!),
              backgroundColor: Colors.green,
            ),
          );
          ref.read(deliveryManProvider(widget.shopId).notifier).clearMessages();
        }
      },
    );

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showAddDeliveryManSheet,
        icon: const Icon(Icons.person_add),
        label: Text('vendorDelivery.addNewDeliveryMan'.tr()),
      ),
      body: deliveryState.isLoading && deliveryState.deliveryMen.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: () => ref.read(deliveryManProvider(widget.shopId).notifier).refreshDeliveryMen(),
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // Delivery Men List
                  if (deliveryState.deliveryMen.isEmpty)
                    _buildEmptyState(theme)
                  else
                    ...deliveryState.deliveryMen.map((dm) => _buildDeliveryManCard(context, theme, dm, deliveryState.zones)),
                ],
              ),
            ),
    );
  }

  Widget _buildEmptyState(ThemeData theme) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.people_outline,
              size: 100,
              color: Colors.grey.shade300,
            ),
            const SizedBox(height: 24),
            Text(
              'vendorDelivery.noDeliveryMenYet'.tr(),
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.grey.shade700,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              'vendorDelivery.addDeliveryMenDescription'.tr(),
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 16,
                color: Colors.grey.shade600,
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _showAddDeliveryManSheet,
              style: ElevatedButton.styleFrom(
                backgroundColor: theme.colorScheme.primary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
              ),
              child: Text('vendorDelivery.addYourFirstDeliveryMan'.tr()),
            ),
          ],
        ),
      ),
    );
  }

  void _showEditZoneSheet(DeliveryManModel dm) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) => _EditZoneSheet(
        deliveryMan: dm,
        shopId: widget.shopId,
        zones: ref.read(deliveryManProvider(widget.shopId)).zones,
        onSaved: () {
          ref.read(deliveryManProvider(widget.shopId).notifier).refreshDeliveryMen();
        },
      ),
    );
  }

  Widget _buildDeliveryManCard(BuildContext context, ThemeData theme, DeliveryManModel dm, List<DeliveryZoneModel> zones) {
    // Look up zone name from zones list (matching frontend behavior)
    final zone = dm.zoneId != null
        ? zones.cast<DeliveryZoneModel?>().firstWhere((z) => z?.id == dm.zoneId, orElse: () => null)
        : null;
    final zoneName = zone?.name ?? dm.zoneName;
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Row(
              children: [
                // Avatar
                Container(
                  width: 50,
                  height: 50,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [theme.colorScheme.primary, Colors.green.shade400],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(25),
                  ),
                  child: Center(
                    child: Text(
                      dm.initials,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 16),

                // Info
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              dm.name,
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: dm.status.toLowerCase() == 'active'
                                  ? Colors.green.shade100
                                  : Colors.orange.shade100,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              dm.statusLabel,
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: dm.status.toLowerCase() == 'active'
                                    ? Colors.green.shade700
                                    : Colors.orange.shade700,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          const Icon(Icons.phone, size: 14, color: Colors.grey),
                          const SizedBox(width: 4),
                          Text(
                            dm.fullPhone,
                            style: const TextStyle(
                              fontSize: 14,
                              color: Colors.grey,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          const Icon(Icons.location_on, size: 14, color: Colors.grey),
                          const SizedBox(width: 4),
                          Text(
                            zoneName ?? 'vendorDelivery.noZoneAssigned'.tr(),
                            style: TextStyle(
                              fontSize: 14,
                              color: zoneName != null ? Colors.green.shade600 : Colors.grey,
                              fontWeight: zoneName != null ? FontWeight.w500 : FontWeight.normal,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            // Footer with ID and Edit Zone button
            Container(
              padding: const EdgeInsets.only(top: 12),
              decoration: BoxDecoration(
                border: Border(top: BorderSide(color: Colors.grey.shade200)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      'ID: ${dm.id.substring(0, 12)}...',
                      style: TextStyle(
                        fontSize: 10,
                        color: Colors.grey.shade700,
                        fontFamily: 'monospace',
                      ),
                    ),
                  ),
                  InkWell(
                    onTap: () => _showEditZoneSheet(dm),
                    borderRadius: BorderRadius.circular(8),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.blue.shade50,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.edit, size: 14, color: Colors.blue.shade700),
                          const SizedBox(width: 4),
                          Text(
                            'vendorDelivery.editZone'.tr(),
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.blue.shade700,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

}

// Delivery Man Bottom Sheet
class _DeliveryManSheet extends StatefulWidget {
  final String? shopId;
  final List<dynamic> zones;
  final VoidCallback onSaved;

  const _DeliveryManSheet({
    this.shopId,
    required this.zones,
    required this.onSaved,
  });

  @override
  State<_DeliveryManSheet> createState() => _DeliveryManSheetState();
}

class _DeliveryManSheetState extends State<_DeliveryManSheet> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  String _selectedCountryKey = '+880-BD';
  String? _selectedZoneId;
  bool _isRegistering = false;
  String? _createdDeliveryManId;

  final List<Map<String, String>> _countryCodes = [
    {'code': '+880', 'flag': '🇧🇩', 'country': 'BD', 'name': 'Bangladesh'},
    {'code': '+1', 'flag': '🇺🇸', 'country': 'US', 'name': 'United States'},
    {'code': '+1', 'flag': '🇨🇦', 'country': 'CA', 'name': 'Canada'},
    {'code': '+44', 'flag': '🇬🇧', 'country': 'GB', 'name': 'United Kingdom'},
    {'code': '+91', 'flag': '🇮🇳', 'country': 'IN', 'name': 'India'},
    {'code': '+86', 'flag': '🇨🇳', 'country': 'CN', 'name': 'China'},
    {'code': '+81', 'flag': '🇯🇵', 'country': 'JP', 'name': 'Japan'},
    {'code': '+82', 'flag': '🇰🇷', 'country': 'KR', 'name': 'South Korea'},
    {'code': '+49', 'flag': '🇩🇪', 'country': 'DE', 'name': 'Germany'},
    {'code': '+33', 'flag': '🇫🇷', 'country': 'FR', 'name': 'France'},
    {'code': '+92', 'flag': '🇵🇰', 'country': 'PK', 'name': 'Pakistan'},
    {'code': '+971', 'flag': '🇦🇪', 'country': 'AE', 'name': 'UAE'},
    {'code': '+966', 'flag': '🇸🇦', 'country': 'SA', 'name': 'Saudi Arabia'},
    {'code': '+60', 'flag': '🇲🇾', 'country': 'MY', 'name': 'Malaysia'},
    {'code': '+65', 'flag': '🇸🇬', 'country': 'SG', 'name': 'Singapore'},
    {'code': '+61', 'flag': '🇦🇺', 'country': 'AU', 'name': 'Australia'},
  ];

  String _getCodeFromKey(String key) {
    final parts = key.split('-');
    return parts.isNotEmpty ? parts[0] : key;
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleRegister() async {
    if (_nameController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('vendorDelivery.pleaseEnterName'.tr()),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    if (_emailController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('vendorDelivery.pleaseEnterEmail'.tr()),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    if (_phoneController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('vendorDelivery.pleaseEnterPhoneNumber'.tr()),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    if (_passwordController.text.length < 6) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('vendorDelivery.passwordMinLength'.tr()),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    setState(() => _isRegistering = true);

    try {
      final repository = DeliveryManRepository();
      final countryCode = _getCodeFromKey(_selectedCountryKey);

      final deliveryMan = await repository.registerDeliveryMan(
        name: _nameController.text.trim(),
        email: _emailController.text.trim(),
        phone: '$countryCode${_phoneController.text.trim()}',
        password: _passwordController.text,
        zoneId: _selectedZoneId,
        shopId: widget.shopId,
      );

      if (mounted) {
        setState(() {
          _createdDeliveryManId = deliveryMan.id;
          _isRegistering = false;
        });
      }
    } catch (e) {
      setState(() => _isRegistering = false);
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
                  'vendorDelivery.addNewDeliveryMan'.tr(),
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
          // Content
          Expanded(
            child: _createdDeliveryManId != null
                ? _buildSuccessContent(theme)
                : _buildFormContent(theme),
          ),
        ],
      ),
    );
  }

  Widget _buildSuccessContent(ThemeData theme) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Colors.green.shade50,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    Icons.check_circle,
                    color: Colors.green.shade600,
                    size: 64,
                  ),
                ),
                const SizedBox(height: 24),
                Text(
                  'vendorDelivery.deliveryManCreatedSuccessfully'.tr(),
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'vendorDelivery.nextSteps'.tr(),
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 12),
                      _buildStepItem('1. ${'vendorDelivery.step1'.tr()}'),
                      _buildStepItem('2. ${'vendorDelivery.step2'.tr()}'),
                      _buildStepItem('3. ${'vendorDelivery.step3'.tr()}'),
                    ],
                  ),
                ),
              ],
            ),
          ),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                widget.onSaved();
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: theme.colorScheme.primary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: Text('common.done'.tr()),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStepItem(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.check, size: 16, color: Colors.green.shade600),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey.shade700,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFormContent(ThemeData theme) {
    return Column(
      children: [
        Expanded(
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              TextField(
                controller: _nameController,
                decoration: InputDecoration(
                  labelText: 'vendorDelivery.fullName'.tr(),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: InputDecoration(
                  labelText: 'vendorDelivery.email'.tr(),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  SizedBox(
                    width: 130,
                    child: DropdownButtonFormField<String>(
                      initialValue: _selectedCountryKey,
                      decoration: InputDecoration(
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                      ),
                      isExpanded: true,
                      items: _countryCodes.map((cc) {
                        final key = '${cc['code']}-${cc['country']}';
                        return DropdownMenuItem(
                          value: key,
                          child: Text(
                            '${cc['flag']} ${cc['code']}',
                            style: const TextStyle(fontSize: 14),
                          ),
                        );
                      }).toList(),
                      onChanged: (value) => setState(() => _selectedCountryKey = value!),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextField(
                      controller: _phoneController,
                      keyboardType: TextInputType.phone,
                      decoration: InputDecoration(
                        labelText: 'vendorDelivery.phone'.tr(),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                initialValue: _selectedZoneId,
                decoration: InputDecoration(
                  labelText: 'vendorDelivery.deliveryZone'.tr(),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
                items: [
                  DropdownMenuItem(
                    value: null,
                    child: Text('vendorDelivery.selectDeliveryZone'.tr()),
                  ),
                  ...widget.zones.map((zone) {
                    return DropdownMenuItem(
                      value: zone.id,
                      child: Text(zone.name),
                    );
                  }),
                ],
                onChanged: (value) => setState(() => _selectedZoneId = value),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _passwordController,
                obscureText: true,
                decoration: InputDecoration(
                  labelText: 'vendorDelivery.password'.tr(),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ],
          ),
        ),
        // Register Button
        Padding(
          padding: EdgeInsets.only(
            left: 16,
            right: 16,
            bottom: MediaQuery.of(context).padding.bottom + 16,
          ),
          child: SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _isRegistering ? null : _handleRegister,
              style: ElevatedButton.styleFrom(
                backgroundColor: theme.colorScheme.primary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: _isRegistering
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                      ),
                    )
                  : Text('vendorDelivery.register'.tr()),
            ),
          ),
        ),
      ],
    );
  }
}

// Edit Zone Bottom Sheet
class _EditZoneSheet extends StatefulWidget {
  final DeliveryManModel deliveryMan;
  final String? shopId;
  final List<dynamic> zones;
  final VoidCallback onSaved;

  const _EditZoneSheet({
    required this.deliveryMan,
    this.shopId,
    required this.zones,
    required this.onSaved,
  });

  @override
  State<_EditZoneSheet> createState() => _EditZoneSheetState();
}

class _EditZoneSheetState extends State<_EditZoneSheet> {
  String? _selectedZoneId;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _selectedZoneId = widget.deliveryMan.zoneId;
  }

  Future<void> _handleSave() async {
    setState(() => _isSaving = true);

    try {
      final repository = DeliveryManRepository();
      await repository.updateDeliveryManZone(
        deliveryManId: widget.deliveryMan.id,
        zoneId: _selectedZoneId,
        shopId: widget.shopId,
      );

      if (mounted) {
        Navigator.pop(context);
        widget.onSaved();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('vendorDelivery.zoneAssignmentUpdated'.tr()),
            backgroundColor: Colors.green,
          ),
        );
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
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
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
                  'vendorDelivery.editZoneAssignment'.tr(),
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
          // Content
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '${'vendorDelivery.assigningZoneFor'.tr()} ',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey.shade600,
                  ),
                ),
                Text(
                  widget.deliveryMan.name,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 16),
                InputDecorator(
                  decoration: InputDecoration(
                    labelText: 'vendorDelivery.selectDeliveryZone'.tr(),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: _selectedZoneId ?? '',
                      isExpanded: true,
                      items: [
                        DropdownMenuItem<String>(
                          value: '',
                          child: Text('vendorDelivery.noZone'.tr()),
                        ),
                        ...widget.zones.map((zone) {
                          return DropdownMenuItem<String>(
                            value: zone.id,
                            child: Text(zone.name),
                          );
                        }),
                      ],
                      onChanged: (value) => setState(() => _selectedZoneId = value?.isEmpty == true ? null : value),
                    ),
                  ),
                ),
                if (widget.zones.isEmpty)
                  Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Text(
                      'vendorDelivery.noZonesAvailable'.tr(),
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.orange.shade700,
                      ),
                    ),
                  ),
              ],
            ),
          ),
          // Footer
          Padding(
            padding: EdgeInsets.only(
              left: 16,
              right: 16,
              bottom: MediaQuery.of(context).padding.bottom + 16,
            ),
            child: Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: _isSaving ? null : () => Navigator.pop(context),
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
                    onPressed: _isSaving ? null : _handleSave,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: theme.colorScheme.primary,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
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
                        : Text('common.save'.tr()),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
