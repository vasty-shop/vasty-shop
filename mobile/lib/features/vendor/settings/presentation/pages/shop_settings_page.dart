import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:url_launcher/url_launcher.dart';
import 'dart:io';
import '../../../../auth/presentation/providers/auth_provider.dart';
import '../../../../../shared/repositories/shop_repository.dart';


import 'package:easy_localization/easy_localization.dart';class ShopSettingsPage extends ConsumerStatefulWidget {
  const ShopSettingsPage({super.key});

  @override
  ConsumerState<ShopSettingsPage> createState() => _ShopSettingsPageState();
}

class _ShopSettingsPageState extends ConsumerState<ShopSettingsPage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _shopRepository = ShopRepository();

  bool _isLoading = false;
  bool _isSaving = false;
  bool _hasUnsavedChanges = false;

  // General Settings
  final _shopNameController = TextEditingController();
  final _slugController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _addressController = TextEditingController();
  String? _logoUrl;
  String? _bannerUrl;

  // Business Settings
  final _businessNameController = TextEditingController();
  final _taxIdController = TextEditingController();
  final _businessAddressController = TextEditingController();
  final _cityController = TextEditingController();
  final _stateController = TextEditingController();
  final _zipCodeController = TextEditingController();
  final _countryController = TextEditingController();
  final _businessPhoneController = TextEditingController();
  final _businessEmailController = TextEditingController();

  // Payment Settings
  bool _stripeEnabled = false;
  final _stripePublishableKeyController = TextEditingController();
  final _stripeSecretKeyController = TextEditingController();
  bool _paypalEnabled = false;
  final _paypalClientIdController = TextEditingController();
  final _paypalSecretController = TextEditingController();

  // Payment Methods
  bool _cardEnabled = true;
  bool _paypalMethodEnabled = false;
  bool _codEnabled = true;
  bool _bankTransferEnabled = false;

  // Notification Settings
  bool _orderConfirmation = true;
  bool _orderShipped = true;
  bool _orderDelivered = true;
  bool _smsAlerts = false;
  String _emailDigest = 'daily';

  // SEO Settings
  final _metaTitleController = TextEditingController();
  final _metaDescriptionController = TextEditingController();
  final _metaKeywordsController = TextEditingController();
  final _ogImageController = TextEditingController();
  bool _sitemapEnabled = true;

  // Advanced Settings
  final _customCssController = TextEditingController();
  final _analyticsCodeController = TextEditingController();
  final _headerScriptsController = TextEditingController();
  final _footerScriptsController = TextEditingController();

  // Domain Settings
  final _subdomainController = TextEditingController();
  final _customDomainController = TextEditingController();
  bool _isCheckingSubdomain = false;
  bool _isVerifyingDomain = false;
  bool? _subdomainAvailable;
  String _customDomainStatus = 'not_configured'; // 'not_configured' | 'pending' | 'verified' | 'failed'
  bool _redirectToCustomDomain = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 7, vsync: this);
    _tabController.addListener(() {
      if (!_tabController.indexIsChanging) {
        setState(() {});
      }
    });
    _loadShopSettings();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _shopNameController.dispose();
    _slugController.dispose();
    _descriptionController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    _businessNameController.dispose();
    _taxIdController.dispose();
    _businessAddressController.dispose();
    _cityController.dispose();
    _stateController.dispose();
    _zipCodeController.dispose();
    _countryController.dispose();
    _businessPhoneController.dispose();
    _businessEmailController.dispose();
    _stripePublishableKeyController.dispose();
    _stripeSecretKeyController.dispose();
    _paypalClientIdController.dispose();
    _paypalSecretController.dispose();
    _metaTitleController.dispose();
    _metaDescriptionController.dispose();
    _metaKeywordsController.dispose();
    _ogImageController.dispose();
    _customCssController.dispose();
    _analyticsCodeController.dispose();
    _headerScriptsController.dispose();
    _footerScriptsController.dispose();
    _subdomainController.dispose();
    _customDomainController.dispose();
    super.dispose();
  }

  Future<void> _loadShopSettings() async {
    final authState = ref.read(authProvider);
    final shopId = authState.user?.metadata?['shopId'] as String?;

    if (shopId == null) return;

    setState(() => _isLoading = true);

    try {
      final shop = await _shopRepository.getShopById(shopId);

      if (mounted) {
        setState(() {
          // General
          _shopNameController.text = shop.name;
          _slugController.text = shop.slug;
          _logoUrl = shop.logo;
          _bannerUrl = shop.banner;

          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        _showError('shopSettings.failedToLoadSettings'.tr());
      }
    }
  }

  Future<void> _saveSettings() async {
    final authState = ref.read(authProvider);
    final shopId = authState.user?.metadata?['shopId'] as String?;

    if (shopId == null) {
      _showError('shopSettings.shopNotFound'.tr());
      return;
    }

    setState(() => _isSaving = true);

    try {
      final updateData = <String, dynamic>{};

      switch (_tabController.index) {
        case 0: // General
          updateData['name'] = _shopNameController.text;
          updateData['description'] = _descriptionController.text;
          updateData['logo'] = _logoUrl ?? '';
          updateData['banner'] = _bannerUrl ?? '';
          break;

        case 1: // Business
          updateData['business_name'] = _businessNameController.text;
          updateData['tax_id'] = _taxIdController.text;
          updateData['business_email'] = _businessEmailController.text;
          updateData['business_phone'] = _businessPhoneController.text;
          updateData['business_address'] = {
            'street': _businessAddressController.text,
            'city': _cityController.text,
            'state': _stateController.text,
            'postal_code': _zipCodeController.text,
            'country': _countryController.text,
          };
          break;

        case 2: // Payment
          final enabledMethods = <String>[];
          if (_cardEnabled) enabledMethods.add('card');
          if (_paypalMethodEnabled) enabledMethods.add('paypal');
          if (_codEnabled) enabledMethods.add('cod');
          if (_bankTransferEnabled) enabledMethods.add('bank');

          // Backend expects payment_methods as direct column
          updateData['payment_methods'] = enabledMethods;
          break;

        case 3: // Notifications
          updateData['notification_settings'] = {
            'order_confirmation': _orderConfirmation,
            'order_shipped': _orderShipped,
            'order_delivered': _orderDelivered,
            'sms_alerts': _smsAlerts,
            'email_digest': _emailDigest,
          };
          break;

        case 4: // SEO
          updateData['seo_settings'] = {
            'meta_title': _metaTitleController.text,
            'meta_description': _metaDescriptionController.text,
            'meta_keywords': _metaKeywordsController.text,
            'og_image': _ogImageController.text,
            'sitemap_enabled': _sitemapEnabled,
          };
          break;

        case 5: // Domain
          updateData['subdomain'] = _subdomainController.text;
          updateData['custom_domain'] = _customDomainController.text;
          updateData['redirect_to_custom_domain'] = _redirectToCustomDomain;
          break;

        case 6: // Advanced
          updateData['advanced_settings'] = {
            'custom_css': _customCssController.text,
            'analytics_code': _analyticsCodeController.text,
            'header_scripts': _headerScriptsController.text,
            'footer_scripts': _footerScriptsController.text,
          };
          break;
      }

      await _shopRepository.updateShop(shopId, updateData);

      if (mounted) {
        setState(() {
          _hasUnsavedChanges = false;
          _isSaving = false;
        });

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('shopSettings.settingsSavedSuccessfully'.tr()),
            backgroundColor: Colors.green,
          ),
        );

        await _loadShopSettings();
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSaving = false);
        _showError('shopSettings.failedToSaveSettings'.tr());
      }
    }
  }

  Future<void> _pickImage(String type) async {
    // Get shop ID
    final authState = ref.read(authProvider);
    final shopId = authState.user?.metadata?['shopId'] as String?;

    if (shopId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('shopSettings.shopIdNotFound'.tr()),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    final picker = ImagePicker();
    final image = await picker.pickImage(source: ImageSource.gallery);

    if (image != null) {
      if (!mounted) return;

      // Show loading indicator
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => Center(
          child: Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const CircularProgressIndicator(),
                const SizedBox(height: 16),
                Text('shopSettings.uploadingImage'.tr()),
              ],
            ),
          ),
        ),
      );

      try {
        // Upload image to server
        final url = await _shopRepository.uploadShopImage(image.path, type, shopId);

        if (mounted) {
          // Close loading dialog
          Navigator.of(context).pop();

          setState(() {
            if (type == 'logo') {
              _logoUrl = url;
            } else {
              _bannerUrl = url;
            }
            _hasUnsavedChanges = true;
          });

          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('shopSettings.imageUploaded'.tr()),
              backgroundColor: Colors.green,
            ),
          );
        }
      } catch (e) {
        if (mounted) {
          // Close loading dialog
          Navigator.of(context).pop();

          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('shopSettings.imageUploadFailed'.tr()),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
      ),
    );
  }

  void _markChanged() {
    if (!_hasUnsavedChanges) {
      setState(() => _hasUnsavedChanges = true);
    }
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: !_hasUnsavedChanges,
      onPopInvokedWithResult: (didPop, result) async {
        if (didPop) return;

        if (_hasUnsavedChanges && context.mounted) {
          final shouldPop = await showDialog<bool>(
            context: context,
            builder: (context) => AlertDialog(
              title: Text('shopSettings.unsavedChanges'.tr()),
              content: Text('shopSettings.unsavedChangesMessage'.tr()),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context, false),
                  child: Text('common.cancel'.tr()),
                ),
                TextButton(
                  onPressed: () => Navigator.pop(context, true),
                  child: Text('shopSettings.discard'.tr(), style: const TextStyle(color: Colors.red)),
                ),
              ],
            ),
          );

          if (shouldPop == true && context.mounted) {
            Navigator.of(context).pop();
          }
        }
      },
      child: Scaffold(
        appBar: AppBar(
          title: Text('vendor.shopSettings'.tr()),
          actions: [
            if (_hasUnsavedChanges)
              TextButton(
                onPressed: () {
                  setState(() => _hasUnsavedChanges = false);
                  _loadShopSettings();
                },
                child: Text('common.cancel'.tr()),
              ),
            if (_hasUnsavedChanges)
              TextButton(
                onPressed: _isSaving ? null : _saveSettings,
                child: _isSaving
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : Text('common.save'.tr()),
              ),
          ],
          bottom: PreferredSize(
            preferredSize: const Size.fromHeight(56),
            child: Container(
              height: 56,
              padding: const EdgeInsets.only(left: 8, right: 8, bottom: 8),
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: 7,
                separatorBuilder: (context, index) => const SizedBox(width: 8),
                itemBuilder: (context, index) {
                  final tabs = [
                    {'icon': Icons.store, 'label': 'shopSettings.tabGeneral'.tr()},
                    {'icon': Icons.business, 'label': 'shopSettings.tabBusiness'.tr()},
                    {'icon': Icons.credit_card, 'label': 'shopSettings.tabPayment'.tr()},
                    {'icon': Icons.notifications, 'label': 'settings.notifications'.tr()},
                    {'icon': Icons.search, 'label': 'shopSettings.tabSeo'.tr()},
                    {'icon': Icons.language, 'label': 'shopSettings.tabDomain'.tr()},
                    {'icon': Icons.code, 'label': 'shopSettings.tabAdvanced'.tr()},
                  ];
                  final isSelected = _tabController.index == index;
                  return GestureDetector(
                    onTap: () => setState(() => _tabController.animateTo(index)),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? Theme.of(context).primaryColor
                            : Colors.grey[200],
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            tabs[index]['icon'] as IconData,
                            size: 18,
                            color: isSelected ? Colors.white : Colors.grey[600],
                          ),
                          const SizedBox(width: 6),
                          Text(
                            tabs[index]['label'] as String,
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                              color: isSelected ? Colors.white : Colors.grey[600],
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ),
        ),
        body: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : TabBarView(
                controller: _tabController,
                children: [
                  _buildGeneralTab(),
                  _buildBusinessTab(),
                  _buildPaymentTab(),
                  _buildNotificationsTab(),
                  _buildSEOTab(),
                  _buildDomainTab(),
                  _buildAdvancedTab(),
                ],
              ),
      ),
    );
  }

  Widget _buildGeneralTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        TextField(
          controller: _shopNameController,
          decoration: InputDecoration(
            labelText: '${'shopSettings.shopName'.tr()} ${'shopSettings.required'.tr()}',
            border: const OutlineInputBorder(),
          ),
          onChanged: (_) => _markChanged(),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _slugController,
          decoration: InputDecoration(
            labelText: '${'shopSettings.shopSlug'.tr()} ${'shopSettings.required'.tr()}',
            border: const OutlineInputBorder(),
            helperText: 'shopSettings.shopSlugHelper'.tr(),
          ),
          onChanged: (value) {
            final slug = value.toLowerCase().replaceAll(RegExp(r'[^a-z0-9-]'), '-');
            if (slug != value) {
              _slugController.text = slug;
              _slugController.selection = TextSelection.fromPosition(
                TextPosition(offset: slug.length),
              );
            }
            _markChanged();
          },
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _descriptionController,
          decoration: InputDecoration(
            labelText: 'shopSettings.description'.tr(),
            border: const OutlineInputBorder(),
          ),
          maxLines: 4,
          onChanged: (_) => _markChanged(),
        ),
        const SizedBox(height: 16),
        // Logo
        Text('shopSettings.shopLogo'.tr(), style: const TextStyle(fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        if (_logoUrl != null && !_logoUrl!.startsWith('blob:'))
          Stack(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: _logoUrl!.startsWith('http')
                    ? Image.network(_logoUrl!, height: 120, width: 120, fit: BoxFit.cover)
                    : Image.file(File(_logoUrl!), height: 120, width: 120, fit: BoxFit.cover),
              ),
              Positioned(
                top: 4,
                right: 4,
                child: IconButton(
                  icon: const Icon(Icons.close, color: Colors.red),
                  onPressed: () {
                    setState(() {
                      _logoUrl = null;
                      _hasUnsavedChanges = true;
                    });
                  },
                ),
              ),
            ],
          ),
        const SizedBox(height: 8),
        OutlinedButton.icon(
          onPressed: () => _pickImage('logo'),
          icon: const Icon(Icons.upload),
          label: Text('shopSettings.uploadLogo'.tr()),
        ),
        Text(
          'shopSettings.logoRecommendation'.tr(),
          style: const TextStyle(fontSize: 12, color: Colors.grey),
        ),
        const SizedBox(height: 16),
        // Banner
        Text('shopSettings.shopBanner'.tr(), style: const TextStyle(fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        if (_bannerUrl != null && !_bannerUrl!.startsWith('blob:'))
          Stack(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: _bannerUrl!.startsWith('http')
                    ? Image.network(_bannerUrl!, height: 120, width: double.infinity, fit: BoxFit.cover)
                    : Image.file(File(_bannerUrl!), height: 120, width: double.infinity, fit: BoxFit.cover),
              ),
              Positioned(
                top: 4,
                right: 4,
                child: IconButton(
                  icon: const Icon(Icons.close, color: Colors.red),
                  onPressed: () {
                    setState(() {
                      _bannerUrl = null;
                      _hasUnsavedChanges = true;
                    });
                  },
                ),
              ),
            ],
          ),
        const SizedBox(height: 8),
        OutlinedButton.icon(
          onPressed: () => _pickImage('banner'),
          icon: const Icon(Icons.upload),
          label: Text('shopSettings.uploadBanner'.tr()),
        ),
        Text(
          'shopSettings.bannerRecommendation'.tr(),
          style: const TextStyle(fontSize: 12, color: Colors.grey),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _emailController,
          decoration: InputDecoration(
            labelText: 'shopSettings.email'.tr(),
            border: const OutlineInputBorder(),
            prefixIcon: const Icon(Icons.email),
          ),
          keyboardType: TextInputType.emailAddress,
          onChanged: (_) => _markChanged(),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _phoneController,
          decoration: InputDecoration(
            labelText: 'shopSettings.phone'.tr(),
            border: const OutlineInputBorder(),
            prefixIcon: const Icon(Icons.phone),
          ),
          keyboardType: TextInputType.phone,
          onChanged: (_) => _markChanged(),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _addressController,
          decoration: InputDecoration(
            labelText: 'shopSettings.address'.tr(),
            border: const OutlineInputBorder(),
            prefixIcon: const Icon(Icons.location_on),
          ),
          onChanged: (_) => _markChanged(),
        ),
      ],
    );
  }

  Widget _buildBusinessTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        TextField(
          controller: _businessNameController,
          decoration: InputDecoration(
            labelText: '${'shopSettings.businessName'.tr()} ${'shopSettings.required'.tr()}',
            border: const OutlineInputBorder(),
          ),
          onChanged: (_) => _markChanged(),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _taxIdController,
          decoration: InputDecoration(
            labelText: 'shopSettings.taxId'.tr(),
            border: const OutlineInputBorder(),
          ),
          onChanged: (_) => _markChanged(),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _businessAddressController,
          decoration: InputDecoration(
            labelText: 'shopSettings.businessAddress'.tr(),
            border: const OutlineInputBorder(),
          ),
          onChanged: (_) => _markChanged(),
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: TextField(
                controller: _cityController,
                decoration: InputDecoration(
                  labelText: 'shopSettings.city'.tr(),
                  border: const OutlineInputBorder(),
                ),
                onChanged: (_) => _markChanged(),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: TextField(
                controller: _stateController,
                decoration: InputDecoration(
                  labelText: 'shopSettings.state'.tr(),
                  border: const OutlineInputBorder(),
                ),
                onChanged: (_) => _markChanged(),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: TextField(
                controller: _zipCodeController,
                decoration: InputDecoration(
                  labelText: 'shopSettings.zipCode'.tr(),
                  border: const OutlineInputBorder(),
                ),
                onChanged: (_) => _markChanged(),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: TextField(
                controller: _countryController,
                decoration: InputDecoration(
                  labelText: 'shopSettings.country'.tr(),
                  border: const OutlineInputBorder(),
                ),
                onChanged: (_) => _markChanged(),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _businessPhoneController,
          decoration: InputDecoration(
            labelText: 'shopSettings.businessPhone'.tr(),
            border: const OutlineInputBorder(),
          ),
          keyboardType: TextInputType.phone,
          onChanged: (_) => _markChanged(),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _businessEmailController,
          decoration: InputDecoration(
            labelText: 'shopSettings.businessEmail'.tr(),
            border: const OutlineInputBorder(),
          ),
          keyboardType: TextInputType.emailAddress,
          onChanged: (_) => _markChanged(),
        ),
      ],
    );
  }

  Widget _buildDomainTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Header
        Text(
          'shopSettings.domainSettings'.tr(),
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 4),
        Text(
          'shopSettings.domainDescription'.tr(),
          style: TextStyle(fontSize: 14, color: Colors.grey[600]),
        ),
        const SizedBox(height: 24),

        // Subdomain Section
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.link, color: Colors.blue),
                    const SizedBox(width: 8),
                    Text(
                      'shopSettings.subdomain'.tr(),
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.green[100],
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        'shopSettings.free'.tr(),
                        style: TextStyle(fontSize: 12, color: Colors.green[800], fontWeight: FontWeight.w500),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _subdomainController,
                        decoration: InputDecoration(
                          hintText: 'yourshop',
                          border: const OutlineInputBorder(),
                          suffixText: '.vasty.shop',
                        ),
                        onChanged: (_) {
                          _markChanged();
                          setState(() => _subdomainAvailable = null);
                        },
                      ),
                    ),
                    const SizedBox(width: 12),
                    ElevatedButton(
                      onPressed: _subdomainController.text.isEmpty || _isCheckingSubdomain
                          ? null
                          : _checkSubdomainAvailability,
                      child: _isCheckingSubdomain
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : Text('shopSettings.check'.tr()),
                    ),
                  ],
                ),
                if (_subdomainAvailable != null) ...[
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Icon(
                        _subdomainAvailable! ? Icons.check_circle : Icons.cancel,
                        color: _subdomainAvailable! ? Colors.green : Colors.red,
                        size: 20,
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          _subdomainAvailable!
                              ? 'shopSettings.subdomainAvailable'.tr(args: [_subdomainController.text])
                              : 'shopSettings.subdomainTaken'.tr(),
                          style: TextStyle(
                            color: _subdomainAvailable! ? Colors.green : Colors.red,
                            fontSize: 14,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
                if (_subdomainController.text.isNotEmpty && _subdomainAvailable == true) ...[
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.grey[100],
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: Text(
                            'https://${_subdomainController.text}.vasty.shop',
                            style: const TextStyle(fontFamily: 'monospace'),
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.copy, size: 20),
                          onPressed: () => _copyToClipboard('https://${_subdomainController.text}.vasty.shop'),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),

        // Custom Domain Section
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.language, color: Colors.purple),
                    const SizedBox(width: 8),
                    Text(
                      'shopSettings.customDomain'.tr(),
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.purple[100],
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        'Pro',
                        style: TextStyle(fontSize: 12, color: Colors.purple[800], fontWeight: FontWeight.w500),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _customDomainController,
                  decoration: InputDecoration(
                    hintText: 'shop.yourdomain.com',
                    border: const OutlineInputBorder(),
                    labelText: 'shopSettings.yourDomain'.tr(),
                  ),
                  onChanged: (_) {
                    _markChanged();
                    setState(() => _customDomainStatus = 'not_configured');
                  },
                ),
                if (_customDomainController.text.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.blue[50],
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.blue[200]!),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'shopSettings.dnsConfiguration'.tr(),
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'shopSettings.addDnsRecord'.tr(),
                          style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                        ),
                        const SizedBox(height: 12),
                        _buildDnsRow('shopSettings.dnsType'.tr(), 'CNAME'),
                        const SizedBox(height: 8),
                        _buildDnsRow('shopSettings.dnsName'.tr(), _customDomainController.text.split('.').first),
                        const SizedBox(height: 8),
                        _buildDnsRow('shopSettings.dnsValue'.tr(), 'shops.vasty.shop'),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  _buildDomainVerificationStatus(),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: _customDomainController.text.isEmpty || _isVerifyingDomain
                          ? null
                          : _verifyDomain,
                      icon: _isVerifyingDomain
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Icon(Icons.refresh),
                      label: Text('shopSettings.verifyDomain'.tr()),
                    ),
                  ),
                  if (_customDomainStatus == 'verified') ...[
                    const SizedBox(height: 16),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.green[50],
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.green[200]!),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.shield, color: Colors.green[700]),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'shopSettings.sslActive'.tr(),
                                  style: TextStyle(fontWeight: FontWeight.bold, color: Colors.green[800]),
                                ),
                                Text(
                                  'shopSettings.sslDescription'.tr(),
                                  style: TextStyle(fontSize: 12, color: Colors.green[600]),
                                ),
                              ],
                            ),
                          ),
                          Icon(Icons.check_circle, color: Colors.green[700]),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                    SwitchListTile(
                      value: _redirectToCustomDomain,
                      onChanged: (value) {
                        setState(() => _redirectToCustomDomain = value);
                        _markChanged();
                      },
                      title: Text('shopSettings.redirectToCustomDomain'.tr()),
                      subtitle: Text('shopSettings.redirectDescription'.tr()),
                      contentPadding: EdgeInsets.zero,
                    ),
                  ],
                ],
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),

        // Storefront URLs Section
        if (_subdomainController.text.isNotEmpty || (_customDomainController.text.isNotEmpty && _customDomainStatus == 'verified')) ...[
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.storefront, color: Colors.teal),
                      const SizedBox(width: 8),
                      Text(
                        'shopSettings.storefrontUrls'.tr(),
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  if (_subdomainController.text.isNotEmpty)
                    _buildUrlRow(
                      'shopSettings.subdomain'.tr(),
                      'https://${_subdomainController.text}.vasty.shop',
                    ),
                  if (_customDomainController.text.isNotEmpty && _customDomainStatus == 'verified') ...[
                    if (_subdomainController.text.isNotEmpty) const SizedBox(height: 12),
                    _buildUrlRow(
                      'shopSettings.customDomain'.tr(),
                      'https://${_customDomainController.text}',
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildDnsRow(String label, String value) {
    return Row(
      children: [
        SizedBox(
          width: 60,
          child: Text(
            label,
            style: TextStyle(fontSize: 12, color: Colors.grey[600]),
          ),
        ),
        Expanded(
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(
              value,
              style: const TextStyle(fontFamily: 'monospace', fontSize: 13),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildDomainVerificationStatus() {
    IconData icon;
    Color color;
    String title;
    String description;

    switch (_customDomainStatus) {
      case 'verified':
        icon = Icons.check_circle;
        color = Colors.green;
        title = 'shopSettings.domainVerified'.tr();
        description = 'shopSettings.domainVerifiedDesc'.tr();
        break;
      case 'pending':
        icon = Icons.hourglass_empty;
        color = Colors.orange;
        title = 'shopSettings.verificationPending'.tr();
        description = 'shopSettings.verificationPendingDesc'.tr();
        break;
      case 'failed':
        icon = Icons.cancel;
        color = Colors.red;
        title = 'shopSettings.verificationFailed'.tr();
        description = 'shopSettings.verificationFailedDesc'.tr();
        break;
      default:
        icon = Icons.language;
        color = Colors.grey;
        title = 'shopSettings.notConfigured'.tr();
        description = 'shopSettings.notConfiguredDesc'.tr();
    }

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Color.alphaBlend(color.withAlpha(25), Colors.white),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Color.alphaBlend(color.withAlpha(75), Colors.white)),
      ),
      child: Row(
        children: [
          Icon(icon, color: color),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(fontWeight: FontWeight.bold, color: color),
                ),
                Text(
                  description,
                  style: TextStyle(fontSize: 12, color: Color.alphaBlend(color.withAlpha(200), Colors.white)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildUrlRow(String label, String url) {
    return InkWell(
      onTap: () => _launchUrl(url),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.grey[100],
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    url,
                    style: const TextStyle(
                      fontFamily: 'monospace',
                      color: Colors.blue,
                      decoration: TextDecoration.underline,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(Icons.open_in_new, size: 20, color: Colors.blue),
          ],
        ),
      ),
    );
  }

  Future<void> _checkSubdomainAvailability() async {
    if (_subdomainController.text.isEmpty) return;

    setState(() => _isCheckingSubdomain = true);

    try {
      final isAvailable = await _shopRepository.checkSubdomainAvailability(_subdomainController.text);
      if (mounted) {
        setState(() {
          _subdomainAvailable = isAvailable;
          _isCheckingSubdomain = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _subdomainAvailable = false;
          _isCheckingSubdomain = false;
        });
        _showError('shopSettings.failedToCheckSubdomain'.tr());
      }
    }
  }

  Future<void> _verifyDomain() async {
    if (_customDomainController.text.isEmpty) return;

    setState(() => _isVerifyingDomain = true);

    try {
      final status = await _shopRepository.verifyCustomDomain(_customDomainController.text);
      if (mounted) {
        setState(() {
          _customDomainStatus = status;
          _isVerifyingDomain = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _customDomainStatus = 'failed';
          _isVerifyingDomain = false;
        });
        _showError('shopSettings.failedToVerifyDomain'.tr());
      }
    }
  }

  void _copyToClipboard(String text) {
    Clipboard.setData(ClipboardData(text: text));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('shopSettings.copiedToClipboard'.tr()),
        backgroundColor: Colors.green,
      ),
    );
  }

  Future<void> _launchUrl(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('shopSettings.couldNotOpenUrl'.tr())),
        );
      }
    }
  }

  Widget _buildPaymentTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(
          'shopSettings.paymentGateways'.tr(),
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 16),
        // Stripe
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.credit_card, color: Colors.purple),
                    const SizedBox(width: 8),
                    Text(
                      'shopSettings.stripe'.tr(),
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                    const Spacer(),
                    Switch(
                      value: _stripeEnabled,
                      onChanged: (value) {
                        setState(() => _stripeEnabled = value);
                        _markChanged();
                      },
                    ),
                  ],
                ),
                if (_stripeEnabled) ...[
                  const SizedBox(height: 16),
                  TextField(
                    controller: _stripePublishableKeyController,
                    decoration: InputDecoration(
                      labelText: 'shopSettings.publishableKey'.tr(),
                      border: const OutlineInputBorder(),
                    ),
                    onChanged: (_) => _markChanged(),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _stripeSecretKeyController,
                    decoration: InputDecoration(
                      labelText: 'shopSettings.secretKey'.tr(),
                      border: const OutlineInputBorder(),
                    ),
                    obscureText: true,
                    onChanged: (_) => _markChanged(),
                  ),
                ],
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        // PayPal
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.payment, color: Colors.blue),
                    const SizedBox(width: 8),
                    Text(
                      'shopSettings.paypal'.tr(),
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                    const Spacer(),
                    Switch(
                      value: _paypalEnabled,
                      onChanged: (value) {
                        setState(() => _paypalEnabled = value);
                        _markChanged();
                      },
                    ),
                  ],
                ),
                if (_paypalEnabled) ...[
                  const SizedBox(height: 16),
                  TextField(
                    controller: _paypalClientIdController,
                    decoration: InputDecoration(
                      labelText: 'shopSettings.clientId'.tr(),
                      border: const OutlineInputBorder(),
                    ),
                    onChanged: (_) => _markChanged(),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _paypalSecretController,
                    decoration: InputDecoration(
                      labelText: 'shopSettings.secret'.tr(),
                      border: const OutlineInputBorder(),
                    ),
                    obscureText: true,
                    onChanged: (_) => _markChanged(),
                  ),
                ],
              ],
            ),
          ),
        ),
        const SizedBox(height: 24),
        Text(
          'shopSettings.customerPaymentOptions'.tr(),
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        Text(
          'shopSettings.customerPaymentHelper'.tr(),
          style: const TextStyle(fontSize: 12, color: Colors.grey),
        ),
        const SizedBox(height: 16),
        CheckboxListTile(
          value: _cardEnabled,
          onChanged: (value) {
            setState(() => _cardEnabled = value ?? true);
            _markChanged();
          },
          title: Text('shopSettings.creditDebitCard'.tr()),
          subtitle: Text('shopSettings.creditCardSubtitle'.tr()),
          secondary: const Icon(Icons.credit_card),
        ),
        const Divider(height: 1),
        CheckboxListTile(
          value: _paypalMethodEnabled,
          onChanged: (value) {
            setState(() => _paypalMethodEnabled = value ?? false);
            _markChanged();
          },
          title: Text('shopSettings.paypalPayment'.tr()),
          subtitle: Text('shopSettings.paypalSubtitle'.tr()),
          secondary: const Icon(Icons.payment),
        ),
        const Divider(height: 1),
        CheckboxListTile(
          value: _codEnabled,
          onChanged: (value) {
            setState(() => _codEnabled = value ?? false);
            _markChanged();
          },
          title: Text('shopSettings.cashOnDelivery'.tr()),
          subtitle: Text('shopSettings.cashOnDeliverySubtitle'.tr()),
          secondary: const Icon(Icons.money),
        ),
        const Divider(height: 1),
        CheckboxListTile(
          value: _bankTransferEnabled,
          onChanged: (value) {
            setState(() => _bankTransferEnabled = value ?? false);
            _markChanged();
          },
          title: Text('shopSettings.bankTransfer'.tr()),
          subtitle: Text('shopSettings.bankTransferSubtitle'.tr()),
          secondary: const Icon(Icons.account_balance),
        ),
      ],
    );
  }

  Widget _buildNotificationsTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        SwitchListTile(
          value: _orderConfirmation,
          onChanged: (value) {
            setState(() => _orderConfirmation = value);
            _markChanged();
          },
          title: const Text('Order Confirmation'),
          subtitle: const Text('Send email when order is placed'),
          secondary: const Icon(Icons.mail_outline),
        ),
        const Divider(height: 1),
        SwitchListTile(
          value: _orderShipped,
          onChanged: (value) {
            setState(() => _orderShipped = value);
            _markChanged();
          },
          title: const Text('Order Shipped'),
          subtitle: const Text('Send email when order ships'),
          secondary: const Icon(Icons.local_shipping_outlined),
        ),
        const Divider(height: 1),
        SwitchListTile(
          value: _orderDelivered,
          onChanged: (value) {
            setState(() => _orderDelivered = value);
            _markChanged();
          },
          title: const Text('Order Delivered'),
          subtitle: const Text('Send email when order is delivered'),
          secondary: const Icon(Icons.check_circle_outline),
        ),
        const Divider(height: 1),
        SwitchListTile(
          value: _smsAlerts,
          onChanged: (value) {
            setState(() => _smsAlerts = value);
            _markChanged();
          },
          title: const Text('SMS Alerts'),
          subtitle: const Text('Receive SMS notifications'),
          secondary: const Icon(Icons.sms_outlined),
        ),
        const SizedBox(height: 16),
        const Text(
          'Email Digest Frequency',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        DropdownButtonFormField<String>(
          initialValue: _emailDigest,
          decoration: const InputDecoration(
            border: OutlineInputBorder(),
          ),
          items: const [
            DropdownMenuItem(value: 'never', child: Text('Never')),
            DropdownMenuItem(value: 'daily', child: Text('Daily')),
            DropdownMenuItem(value: 'weekly', child: Text('Weekly')),
            DropdownMenuItem(value: 'monthly', child: Text('Monthly')),
          ],
          onChanged: (value) {
            if (value != null) {
              setState(() => _emailDigest = value);
              _markChanged();
            }
          },
        ),
      ],
    );
  }

  Widget _buildSEOTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        TextField(
          controller: _metaTitleController,
          decoration: InputDecoration(
            labelText: 'Meta Title',
            border: const OutlineInputBorder(),
            helperText: '${_metaTitleController.text.length}/60 characters (Recommended: 50-60)',
          ),
          maxLength: 60,
          onChanged: (_) {
            _markChanged();
            setState(() {});
          },
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _metaDescriptionController,
          decoration: InputDecoration(
            labelText: 'Meta Description',
            border: const OutlineInputBorder(),
            helperText: '${_metaDescriptionController.text.length}/160 characters (Recommended: 150-160)',
          ),
          maxLines: 3,
          maxLength: 160,
          onChanged: (_) {
            _markChanged();
            setState(() {});
          },
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _metaKeywordsController,
          decoration: const InputDecoration(
            labelText: 'Meta Keywords',
            border: OutlineInputBorder(),
            helperText: 'Separate keywords with commas',
          ),
          onChanged: (_) => _markChanged(),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _ogImageController,
          decoration: const InputDecoration(
            labelText: 'Open Graph Image URL',
            border: OutlineInputBorder(),
            helperText: 'Recommended: 1200x630px for social media sharing',
          ),
          onChanged: (_) => _markChanged(),
        ),
        const SizedBox(height: 16),
        CheckboxListTile(
          value: _sitemapEnabled,
          onChanged: (value) {
            setState(() => _sitemapEnabled = value ?? true);
            _markChanged();
          },
          title: const Text('Enable automatic sitemap generation'),
          subtitle: const Text('Helps search engines discover your shop pages'),
        ),
      ],
    );
  }

  Widget _buildAdvancedTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.orange.shade50,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: Colors.orange.shade200),
          ),
          child: Row(
            children: [
              Icon(Icons.warning_amber, color: Colors.orange.shade700),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Warning: Advanced Settings. Incorrect code may break your shop or create security issues.',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.orange.shade900,
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        const Text(
          'Custom CSS',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _customCssController,
          decoration: const InputDecoration(
            border: OutlineInputBorder(),
            hintText: '.my-custom-class {\n  color: white;\n  background: ...\n}',
            helperText: 'Add custom styles to personalize your shop appearance',
          ),
          maxLines: 8,
          style: const TextStyle(fontFamily: 'monospace'),
          onChanged: (_) => _markChanged(),
        ),
        const SizedBox(height: 16),
        const Text(
          'Analytics Code (Google Analytics, etc.)',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _analyticsCodeController,
          decoration: const InputDecoration(
            border: OutlineInputBorder(),
            hintText: '<!-- Google Analytics -->\n<script>\n  // Your analytics code here\n</script>',
            helperText: 'Track visitor behavior and shop performance',
          ),
          maxLines: 6,
          style: const TextStyle(fontFamily: 'monospace'),
          onChanged: (_) => _markChanged(),
        ),
        const SizedBox(height: 16),
        const Text(
          'Header Scripts',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _headerScriptsController,
          decoration: const InputDecoration(
            border: OutlineInputBorder(),
            hintText: '<script src="..."></script>',
            helperText: 'Scripts to inject in the <head> section',
          ),
          maxLines: 4,
          style: const TextStyle(fontFamily: 'monospace'),
          onChanged: (_) => _markChanged(),
        ),
        const SizedBox(height: 16),
        const Text(
          'Footer Scripts',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _footerScriptsController,
          decoration: const InputDecoration(
            border: OutlineInputBorder(),
            hintText: '<script>\n  // Footer scripts\n</script>',
            helperText: 'Scripts to inject before </body> (recommended for performance)',
          ),
          maxLines: 4,
          style: const TextStyle(fontFamily: 'monospace'),
          onChanged: (_) => _markChanged(),
        ),
      ],
    );
  }
}
