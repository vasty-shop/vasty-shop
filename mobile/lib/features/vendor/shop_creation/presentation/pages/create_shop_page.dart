import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../auth/presentation/providers/auth_provider.dart';
import '../../../../vendor/home/presentation/pages/vendor_home_page.dart';
import '../../../../../shared/repositories/shop_repository.dart';


import 'package:easy_localization/easy_localization.dart';class CreateShopPage extends ConsumerStatefulWidget {
  const CreateShopPage({super.key});

  @override
  ConsumerState<CreateShopPage> createState() => _CreateShopPageState();
}

class _CreateShopPageState extends ConsumerState<CreateShopPage> {
  final _formKey = GlobalKey<FormState>();
  final _pageController = PageController();
  int _currentStep = 0;

  // Form data
  String _selectedStoreType = '';
  final _storeNameController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _businessEmailController = TextEditingController();
  final _businessNameController = TextEditingController();
  final _businessPhoneController = TextEditingController();
  String _businessType = 'individual';
  String _selectedTemplate = 'ai-builder';
  bool _isSubmitting = false;

  // Store types
  final List<Map<String, dynamic>> _storeTypes = [
    {'id': 'fashion', 'name': 'Fashion & Apparel', 'icon': Icons.checkroom, 'color': Colors.pink},
    {'id': 'electronics', 'name': 'Electronics & Tech', 'icon': Icons.laptop, 'color': Colors.blue},
    {'id': 'home', 'name': 'Home & Living', 'icon': Icons.home, 'color': Colors.orange},
    {'id': 'food', 'name': 'Food & Beverages', 'icon': Icons.restaurant, 'color': Colors.green},
    {'id': 'beauty', 'name': 'Beauty & Wellness', 'icon': Icons.spa, 'color': Colors.purple},
    {'id': 'sports', 'name': 'Sports & Outdoors', 'icon': Icons.sports_basketball, 'color': Colors.red},
    {'id': 'books', 'name': 'Books & Media', 'icon': Icons.menu_book, 'color': Colors.amber},
    {'id': 'general', 'name': 'General Store', 'icon': Icons.store, 'color': Colors.teal},
  ];

  // Templates
  final List<Map<String, dynamic>> _templates = [
    {
      'id': 'ai-builder',
      'name': 'AI Store Builder',
      'description': 'Let AI design your perfect store',
      'icon': Icons.auto_awesome,
      'recommended': true,
    },
    {
      'id': 'minimal',
      'name': 'Minimal & Clean',
      'description': 'Simple, elegant design',
      'icon': Icons.view_day,
      'recommended': false,
    },
    {
      'id': 'modern',
      'name': 'Modern & Bold',
      'description': 'Eye-catching design',
      'icon': Icons.bolt,
      'recommended': false,
    },
  ];

  @override
  void initState() {
    super.initState();
    final user = ref.read(authProvider).user;
    _businessEmailController.text = user?.email ?? '';
  }

  @override
  void dispose() {
    _pageController.dispose();
    _storeNameController.dispose();
    _descriptionController.dispose();
    _businessEmailController.dispose();
    _businessNameController.dispose();
    _businessPhoneController.dispose();
    super.dispose();
  }

  void _nextStep() {
    if (_validateCurrentStep()) {
      if (_currentStep < 4) {
        setState(() => _currentStep++);
        _pageController.nextPage(
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeInOut,
        );
      } else {
        _submitForm();
      }
    }
  }

  void _previousStep() {
    if (_currentStep > 0) {
      setState(() => _currentStep--);
      _pageController.previousPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  bool _validateCurrentStep() {
    switch (_currentStep) {
      case 0:
        if (_selectedStoreType.isEmpty) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Please select a store type')),
          );
          return false;
        }
        return true;
      case 1:
        if (_storeNameController.text.trim().isEmpty) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Please enter a store name')),
          );
          return false;
        }
        if (_storeNameController.text.trim().length < 3) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Store name must be at least 3 characters')),
          );
          return false;
        }
        return true;
      case 2:
        if (_businessEmailController.text.trim().isEmpty) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Please enter business email')),
          );
          return false;
        }
        final emailRegex = RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$');
        if (!emailRegex.hasMatch(_businessEmailController.text.trim())) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Please enter a valid email')),
          );
          return false;
        }
        return true;
      case 3:
        if (_selectedTemplate.isEmpty) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Please select a template')),
          );
          return false;
        }
        return true;
      default:
        return true;
    }
  }

  Future<void> _submitForm() async {
    setState(() => _isSubmitting = true);

    try {
      final shopRepository = ShopRepository();

      final payload = {
        'name': _storeNameController.text.trim(),
        'business_email': _businessEmailController.text.trim(),
        'business_type': _businessType,
        if (_descriptionController.text.trim().isNotEmpty)
          'description': _descriptionController.text.trim(),
        if (_businessNameController.text.trim().isNotEmpty)
          'business_name': _businessNameController.text.trim(),
        if (_businessPhoneController.text.trim().isNotEmpty)
          'business_phone': _businessPhoneController.text.trim(),
      };

      await shopRepository.createShop(payload);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Store created successfully!'),
            backgroundColor: Colors.green,
          ),
        );

        // Navigate to vendor dashboard
        Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(builder: (_) => const VendorHomePage()),
          (route) => false,
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to create store: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: const Text(
          'Create Your Store',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.black87,
          ),
        ),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: Column(
        children: [
          // Progress Indicator
          _buildProgressIndicator(theme),

          // Form Content
          Expanded(
            child: PageView(
              controller: _pageController,
              physics: const NeverScrollableScrollPhysics(),
              children: [
                _buildStoreTypeStep(),
                _buildStoreDetailsStep(),
                _buildBusinessInfoStep(),
                _buildTemplateStep(),
                _buildReviewStep(),
              ],
            ),
          ),

          // Navigation Buttons
          _buildNavigationButtons(theme),
        ],
      ),
    );
  }

  Widget _buildProgressIndicator(ThemeData theme) {
    return Container(
      padding: const EdgeInsets.all(16),
      color: Colors.white,
      child: Row(
        children: List.generate(5, (index) {
          final isActive = index == _currentStep;
          final isCompleted = index < _currentStep;

          return Expanded(
            child: Row(
              children: [
                Expanded(
                  child: Container(
                    height: 4,
                    decoration: BoxDecoration(
                      color: isCompleted || isActive
                          ? theme.colorScheme.primary
                          : Colors.grey.shade300,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                if (index < 4) const SizedBox(width: 4),
              ],
            ),
          );
        }),
      ),
    );
  }

  Widget _buildStoreTypeStep() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'What will you sell?',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Choose the category that best describes your store',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey.shade600,
            ),
          ),
          const SizedBox(height: 24),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 1.2,
            ),
            itemCount: _storeTypes.length,
            itemBuilder: (context, index) {
              final storeType = _storeTypes[index];
              final isSelected = _selectedStoreType == storeType['id'];

              return InkWell(
                onTap: () => setState(() => _selectedStoreType = storeType['id']),
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isSelected
                          ? (storeType['color'] as Color)
                          : Colors.grey.shade300,
                      width: isSelected ? 2 : 1,
                    ),
                  ),
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        storeType['icon'] as IconData,
                        size: 40,
                        color: isSelected
                            ? (storeType['color'] as Color)
                            : Colors.grey.shade600,
                      ),
                      const SizedBox(height: 12),
                      Text(
                        storeType['name'],
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                          color: isSelected ? Colors.black87 : Colors.grey.shade700,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildStoreDetailsStep() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Name your store',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Choose a memorable name that represents your brand',
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey.shade600,
              ),
            ),
            const SizedBox(height: 32),
            TextFormField(
              controller: _storeNameController,
              decoration: InputDecoration(
                labelText: 'Store Name *',
                hintText: 'e.g., My Fashion Store',
                prefixIcon: const Icon(Icons.store),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                filled: true,
                fillColor: Colors.white,
              ),
            ),
            const SizedBox(height: 20),
            TextFormField(
              controller: _descriptionController,
              maxLines: 4,
              decoration: InputDecoration(
                labelText: 'Description (Optional)',
                hintText: 'Tell customers about your store...',
                alignLabelWithHint: true,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                filled: true,
                fillColor: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBusinessInfoStep() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Business Information',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Contact details for your business',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey.shade600,
            ),
          ),
          const SizedBox(height: 32),
          TextFormField(
            controller: _businessEmailController,
            keyboardType: TextInputType.emailAddress,
            decoration: InputDecoration(
              labelText: 'Business Email *',
              prefixIcon: const Icon(Icons.email),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              filled: true,
              fillColor: Colors.white,
            ),
          ),
          const SizedBox(height: 20),
          TextFormField(
            controller: _businessNameController,
            decoration: InputDecoration(
              labelText: 'Business Name (Optional)',
              hintText: 'Legal business name',
              prefixIcon: const Icon(Icons.business),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              filled: true,
              fillColor: Colors.white,
            ),
          ),
          const SizedBox(height: 20),
          DropdownButtonFormField<String>(
            value: _businessType,
            decoration: InputDecoration(
              labelText: 'Business Type',
              prefixIcon: const Icon(Icons.account_balance),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              filled: true,
              fillColor: Colors.white,
            ),
            items: const [
              DropdownMenuItem(value: 'individual', child: Text('Individual')),
              DropdownMenuItem(value: 'llc', child: Text('LLC')),
              DropdownMenuItem(value: 'corporation', child: Text('Corporation')),
            ],
            onChanged: (value) => setState(() => _businessType = value!),
          ),
          const SizedBox(height: 20),
          TextFormField(
            controller: _businessPhoneController,
            keyboardType: TextInputType.phone,
            decoration: InputDecoration(
              labelText: 'Business Phone (Optional)',
              hintText: '123-456-7890',
              prefixIcon: const Icon(Icons.phone),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              filled: true,
              fillColor: Colors.white,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTemplateStep() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Choose a Template',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Pick a design style for your store',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey.shade600,
            ),
          ),
          const SizedBox(height: 24),
          ..._templates.map((template) {
            final isSelected = _selectedTemplate == template['id'];

            return Container(
              margin: const EdgeInsets.only(bottom: 12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isSelected ? Colors.purple : Colors.grey.shade300,
                  width: isSelected ? 2 : 1,
                ),
              ),
              child: ListTile(
                contentPadding: const EdgeInsets.all(16),
                leading: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? Colors.purple.withValues(alpha: 0.1)
                        : Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    template['icon'] as IconData,
                    color: isSelected ? Colors.purple : Colors.grey.shade600,
                  ),
                ),
                title: Row(
                  children: [
                    Text(
                      template['name'],
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                    if (template['recommended'])
                      Container(
                        margin: const EdgeInsets.only(left: 8),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.purple,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Text(
                          'RECOMMENDED',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                  ],
                ),
                subtitle: Padding(
                  padding: const EdgeInsets.only(top: 4),
                  child: Text(template['description']),
                ),
                trailing: Radio<String>(
                  value: template['id'],
                  groupValue: _selectedTemplate,
                  onChanged: (value) => setState(() => _selectedTemplate = value!),
                  activeColor: Colors.purple,
                ),
                onTap: () => setState(() => _selectedTemplate = template['id']),
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildReviewStep() {
    final selectedType = _storeTypes.firstWhere(
      (type) => type['id'] == _selectedStoreType,
      orElse: () => _storeTypes[0],
    );
    final selectedTemplate = _templates.firstWhere(
      (template) => template['id'] == _selectedTemplate,
      orElse: () => _templates[0],
    );

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Review & Launch',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Review your store details before launching',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey.shade600,
            ),
          ),
          const SizedBox(height: 32),
          _buildReviewItem('Store Type', selectedType['name']),
          _buildReviewItem('Store Name', _storeNameController.text),
          if (_descriptionController.text.isNotEmpty)
            _buildReviewItem('Description', _descriptionController.text),
          _buildReviewItem('Business Email', _businessEmailController.text),
          if (_businessNameController.text.isNotEmpty)
            _buildReviewItem('Business Name', _businessNameController.text),
          _buildReviewItem('Business Type', _businessType.toUpperCase()),
          if (_businessPhoneController.text.isNotEmpty)
            _buildReviewItem('Business Phone', _businessPhoneController.text),
          _buildReviewItem('Template', selectedTemplate['name']),
          const SizedBox(height: 32),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.green.shade50,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.green.shade200),
            ),
            child: Row(
              children: [
                Icon(Icons.check_circle, color: Colors.green.shade700),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'You\'re all set! Tap "Launch Store" to create your store.',
                    style: TextStyle(
                      color: Colors.green.shade900,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildReviewItem(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey.shade600,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNavigationButtons(ThemeData theme) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.grey.shade300,
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        child: Row(
          children: [
            if (_currentStep > 0)
              Expanded(
                child: OutlinedButton(
                  onPressed: _isSubmitting ? null : _previousStep,
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: Text('common.back'.tr()),
                ),
              ),
            if (_currentStep > 0) const SizedBox(width: 12),
            Expanded(
              flex: _currentStep == 0 ? 1 : 1,
              child: ElevatedButton(
                onPressed: _isSubmitting ? null : _nextStep,
                style: ElevatedButton.styleFrom(
                  backgroundColor: theme.colorScheme.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: _isSubmitting
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2,
                        ),
                      )
                    : Text(
                        _currentStep == 4 ? 'Launch Store' : 'Next',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
