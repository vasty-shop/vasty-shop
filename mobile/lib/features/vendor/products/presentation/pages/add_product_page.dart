import 'dart:convert';
import 'dart:io';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../../../shared/repositories/product_repository.dart';
import '../../../../../shared/models/product_model.dart';
import '../../../../auth/presentation/providers/auth_provider.dart';
import '../../../offers/data/repositories/offer_repository.dart';
import '../../../offers/data/models/offer_models.dart';

class AddProductPage extends ConsumerStatefulWidget {
  final String? productId;

  const AddProductPage({super.key, this.productId});

  @override
  ConsumerState<AddProductPage> createState() => _AddProductPageState();
}

class _AddProductPageState extends ConsumerState<AddProductPage> {
  final _formKey = GlobalKey<FormState>();

  // Basic Info Controllers
  final _nameController = TextEditingController();
  final _brandController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _skuController = TextEditingController();
  final _barcodeController = TextEditingController();
  final _materialController = TextEditingController();

  // Pricing Controllers
  final _priceController = TextEditingController();
  final _compareAtPriceController = TextEditingController();
  final _costPerItemController = TextEditingController();
  final _taxRateController = TextEditingController();

  // Inventory Controllers
  final _quantityController = TextEditingController();
  final _lowStockThresholdController = TextEditingController(text: '10');

  bool _trackInventory = true;
  String _stockStatus = 'in_stock';

  // Images
  List<XFile> _selectedImageFiles = [];
  List<String> _existingImageUrls = [];
  int _primaryImageIndex = 0;
  final ImagePicker _imagePicker = ImagePicker();

  // Variants
  List<String> _sizes = [];
  List<Map<String, String>> _colors = [];
  final _sizeInputController = TextEditingController();
  final _colorNameController = TextEditingController();
  Color _selectedColor = Colors.black;

  // Category & Tags
  String _selectedCategory = '';
  List<CategoryModel> _categories = [];
  List<String> _tags = [];
  final _tagInputController = TextEditingController();

  // Features & Specifications
  List<String> _features = [];
  List<Map<String, String>> _specifications = [];
  final _featureInputController = TextEditingController();
  final _specKeyController = TextEditingController();
  final _specValueController = TextEditingController();

  // Status
  String _selectedStatus = 'draft';
  bool _isLoading = false;
  bool _loadingCategories = false;

  // Flash Sale
  bool _isFlashSale = false;
  final _flashSalePriceController = TextEditingController();
  DateTime? _flashSaleStartDate;
  DateTime? _flashSaleEndDate;

  // SEO Settings
  final _metaTitleController = TextEditingController();
  final _metaDescriptionController = TextEditingController();
  final _slugController = TextEditingController();

  // Care Instructions
  List<String> _careInstructions = [];
  final _careInputController = TextEditingController();

  // Size Chart
  List<Map<String, String>> _sizeChart = [];
  final _sizeChartSizeController = TextEditingController();
  final _sizeChartChestController = TextEditingController();
  final _sizeChartWaistController = TextEditingController();
  final _sizeChartHipsController = TextEditingController();
  final _sizeChartLengthController = TextEditingController();

  // Shipping Information
  final _freeShippingThresholdController = TextEditingController(text: '100');
  final _standardShippingDaysController = TextEditingController(text: '5-7');
  final _expressShippingDaysController = TextEditingController(text: '2-3');
  final _expressShippingCostController = TextEditingController(text: '15.99');
  final _nextDayCostController = TextEditingController(text: '29.99');

  // Return Policy
  final _returnDaysController = TextEditingController(text: '30');
  final _refundDaysController = TextEditingController(text: '5-7');
  List<String> _returnConditions = [];
  final _returnConditionInputController = TextEditingController();
  bool _freeReturns = false;

  // Visibility
  bool _isFeatured = false;
  bool _isVisible = true;
  DateTime? _schedulePublishDate;

  // Campaigns & Offers linking
  List<Offer> _offers = [];
  List<String> _selectedOfferIds = [];
  List<String> _selectedCampaignIds = [];
  bool _loadingOffers = false;

  final List<String> _stockStatuses = [
    'in_stock',
    'low_stock',
    'out_of_stock',
  ];

  @override
  void initState() {
    super.initState();
    _loadCategories();
    _loadOffers();
    if (widget.productId != null) {
      _loadProduct();
    } else {
      // Load draft for new products
      _loadDraft();
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _brandController.dispose();
    _descriptionController.dispose();
    _skuController.dispose();
    _barcodeController.dispose();
    _materialController.dispose();
    _priceController.dispose();
    _compareAtPriceController.dispose();
    _costPerItemController.dispose();
    _taxRateController.dispose();
    _quantityController.dispose();
    _lowStockThresholdController.dispose();
    _sizeInputController.dispose();
    _colorNameController.dispose();
    _tagInputController.dispose();
    _featureInputController.dispose();
    _specKeyController.dispose();
    _specValueController.dispose();
    _flashSalePriceController.dispose();
    _metaTitleController.dispose();
    _metaDescriptionController.dispose();
    _slugController.dispose();
    _careInputController.dispose();
    _sizeChartSizeController.dispose();
    _sizeChartChestController.dispose();
    _sizeChartWaistController.dispose();
    _sizeChartHipsController.dispose();
    _sizeChartLengthController.dispose();
    _freeShippingThresholdController.dispose();
    _standardShippingDaysController.dispose();
    _expressShippingDaysController.dispose();
    _expressShippingCostController.dispose();
    _nextDayCostController.dispose();
    _returnDaysController.dispose();
    _refundDaysController.dispose();
    _returnConditionInputController.dispose();
    super.dispose();
  }

  Future<void> _loadCategories() async {
    setState(() => _loadingCategories = true);
    try {
      final repository = ProductRepository();
      final categories = await repository.getCategories();
      if (mounted) {
        setState(() {
          _categories = categories;
          if (_categories.isNotEmpty && _selectedCategory.isEmpty) {
            _selectedCategory = _categories.first.id;
          }
        });
      }
    } catch (e) {
      debugPrint('Failed to load categories: $e');
      // Categories are optional, continue without them
    } finally {
      if (mounted) {
        setState(() => _loadingCategories = false);
      }
    }
  }

  Future<void> _loadOffers() async {
    setState(() => _loadingOffers = true);
    try {
      final repository = OfferRepository();
      final offers = await repository.getOffers(status: 'active');
      if (mounted) {
        setState(() {
          _offers = offers;
        });
      }
    } catch (e) {
      debugPrint('Failed to load offers: $e');
      // Offers are optional, continue without them
    } finally {
      if (mounted) {
        setState(() => _loadingOffers = false);
      }
    }
  }

  Future<void> _loadProduct() async {
    if (widget.productId == null) return;

    setState(() => _isLoading = true);
    try {
      final repository = ProductRepository();
      final product = await repository.getProductById(widget.productId!);

      debugPrint('📦 Loaded product: ${product.name}');
      debugPrint('   Status from API: ${product.status}');
      debugPrint('   Will map to: ${product.status == 'active' ? 'published' : (product.status ?? 'draft')}');

      if (mounted) {
        setState(() {
          // Basic Information
          _nameController.text = product.name;
          _brandController.text = product.brand;
          _descriptionController.text = product.description ?? '';
          _skuController.text = product.sku ?? '';
          _barcodeController.text = ''; // Not in ProductModel
          _materialController.text = ''; // Not in ProductModel

          // Pricing
          _priceController.text = product.price.toString();
          _compareAtPriceController.text = product.salePrice?.toString() ?? '';
          _costPerItemController.text = ''; // Not in ProductModel
          _taxRateController.text = ''; // Not in ProductModel

          // Inventory
          _trackInventory = true;
          _quantityController.text = product.stock?.toString() ?? '0';
          _lowStockThresholdController.text = '10';

          // Category
          _selectedCategory = product.category;

          // Tags - Not in ProductModel, keep empty
          _tags = [];

          // Sizes & Colors
          _sizes = product.sizes;
          _colors = product.colors?.map((color) => {
            'name': color,
            'code': '#000000', // Default color code
          }).toList() ?? [];

          // Features - Not in ProductModel
          _features = [];

          // Specifications - Parse from characteristics
          if (product.characteristics != null) {
            _specifications = product.characteristics!.entries.map((entry) => {
              'key': entry.key,
              'value': entry.value.toString(),
            }).toList();
          }

          // Images
          _existingImageUrls = product.images;
          _selectedImageFiles = [];

          // Status - Map backend status to frontend: active → published, draft → draft, archived → archived
          _selectedStatus = product.status == 'active' ? 'published' : (product.status ?? 'draft');

          // SEO - Not in ProductModel
          _metaTitleController.text = '';
          _metaDescriptionController.text = '';
          _slugController.text = '';

          // Visibility
          _isFeatured = product.isFeatured ?? false;
          _isVisible = true;
        });
      }
    } catch (e) {
      debugPrint('Failed to load product: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to load product: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _pickImages() async {
    try {
      final List<XFile> images = await _imagePicker.pickMultiImage();
      if (images.isNotEmpty) {
        setState(() {
          _selectedImageFiles.addAll(images);
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error picking images: $e')),
        );
      }
    }
  }

  Future<void> _takePhoto() async {
    try {
      final XFile? photo = await _imagePicker.pickImage(source: ImageSource.camera);
      if (photo != null) {
        setState(() {
          _selectedImageFiles.add(photo);
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error taking photo: $e')),
        );
      }
    }
  }

  void _removeImage(int index) {
    setState(() {
      final totalExisting = _existingImageUrls.length;

      if (index < totalExisting) {
        // Remove from existing images
        _existingImageUrls.removeAt(index);
      } else {
        // Remove from newly selected images
        _selectedImageFiles.removeAt(index - totalExisting);
      }

      // Adjust primary index
      final totalImages = _existingImageUrls.length + _selectedImageFiles.length;
      if (totalImages == 0) {
        _primaryImageIndex = 0;
      } else if (_primaryImageIndex == index) {
        // If removed image was primary, set first image as primary
        _primaryImageIndex = 0;
      } else if (_primaryImageIndex > index) {
        // If primary was after removed image, shift it back
        _primaryImageIndex--;
      }
    });
  }

  void _setPrimaryImage(int index) {
    setState(() {
      _primaryImageIndex = index;
    });
  }

  void _addSize() {
    final size = _sizeInputController.text.trim();
    if (size.isNotEmpty && !_sizes.contains(size)) {
      setState(() {
        _sizes.add(size);
        _sizeInputController.clear();
      });
    }
  }

  void _removeSize(String size) {
    setState(() {
      _sizes.remove(size);
    });
  }

  void _addColor() {
    final colorName = _colorNameController.text.trim();
    if (colorName.isNotEmpty) {
      final colorHex = '#${_selectedColor.value.toRadixString(16).substring(2).toUpperCase()}';
      setState(() {
        _colors.add({'name': colorName, 'code': colorHex});
        _colorNameController.clear();
        _selectedColor = Colors.black;
      });
    }
  }

  void _removeColor(int index) {
    setState(() {
      _colors.removeAt(index);
    });
  }

  void _addTag() {
    final tag = _tagInputController.text.trim();
    if (tag.isNotEmpty && !_tags.contains(tag)) {
      setState(() {
        _tags.add(tag);
        _tagInputController.clear();
      });
    }
  }

  void _removeTag(String tag) {
    setState(() {
      _tags.remove(tag);
    });
  }

  void _addFeature() {
    final feature = _featureInputController.text.trim();
    if (feature.isNotEmpty && !_features.contains(feature)) {
      setState(() {
        _features.add(feature);
        _featureInputController.clear();
      });
    }
  }

  void _removeFeature(int index) {
    setState(() {
      _features.removeAt(index);
    });
  }

  void _addSpecification() {
    final key = _specKeyController.text.trim();
    final value = _specValueController.text.trim();
    if (key.isNotEmpty && value.isNotEmpty) {
      setState(() {
        _specifications.add({'key': key, 'value': value});
        _specKeyController.clear();
        _specValueController.clear();
      });
    }
  }

  void _removeSpecification(int index) {
    setState(() {
      _specifications.removeAt(index);
    });
  }

  void _addCareInstruction() {
    final instruction = _careInputController.text.trim();
    if (instruction.isNotEmpty && !_careInstructions.contains(instruction)) {
      setState(() {
        _careInstructions.add(instruction);
        _careInputController.clear();
      });
    }
  }

  void _removeCareInstruction(String instruction) {
    setState(() {
      _careInstructions.remove(instruction);
    });
  }

  void _showProductPreview(BuildContext context, ThemeData theme) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.9,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        builder: (context, scrollController) => Container(
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
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Product Preview',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    IconButton(
                      onPressed: () => Navigator.pop(context),
                      icon: const Icon(Icons.close),
                    ),
                  ],
                ),
              ),
              const Divider(height: 1),
              // Preview content
              Expanded(
                child: SingleChildScrollView(
                  controller: scrollController,
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Product images
                      if (_selectedImageFiles.isNotEmpty)
                        SizedBox(
                          height: 200,
                          child: ListView.builder(
                            scrollDirection: Axis.horizontal,
                            itemCount: _selectedImageFiles.length,
                            itemBuilder: (context, index) => Container(
                              margin: const EdgeInsets.only(right: 8),
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(8),
                                child: Image.file(
                                  File(_selectedImageFiles[index].path),
                                  width: 200,
                                  height: 200,
                                  fit: BoxFit.cover,
                                ),
                              ),
                            ),
                          ),
                        )
                      else
                        Container(
                          height: 200,
                          width: double.infinity,
                          decoration: BoxDecoration(
                            color: Colors.grey.shade100,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(Icons.image, size: 64, color: Colors.grey),
                        ),
                      const SizedBox(height: 16),
                      // Product name
                      Text(
                        _nameController.text.isNotEmpty ? _nameController.text : 'Product Name',
                        style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      // Price
                      Row(
                        children: [
                          Text(
                            '\$${_priceController.text.isNotEmpty ? _priceController.text : '0.00'}',
                            style: TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                              color: theme.colorScheme.primary,
                            ),
                          ),
                          if (_compareAtPriceController.text.isNotEmpty) ...[
                            const SizedBox(width: 8),
                            Text(
                              '\$${_compareAtPriceController.text}',
                              style: const TextStyle(
                                fontSize: 16,
                                decoration: TextDecoration.lineThrough,
                                color: Colors.grey,
                              ),
                            ),
                          ],
                        ],
                      ),
                      const SizedBox(height: 16),
                      // Description
                      if (_descriptionController.text.isNotEmpty) ...[
                        const Text('Description', style: TextStyle(fontWeight: FontWeight.bold)),
                        const SizedBox(height: 4),
                        Text(_descriptionController.text),
                        const SizedBox(height: 16),
                      ],
                      // Features
                      if (_features.isNotEmpty) ...[
                        const Text('Features', style: TextStyle(fontWeight: FontWeight.bold)),
                        const SizedBox(height: 4),
                        ...(_features.map((f) => Padding(
                          padding: const EdgeInsets.only(left: 8, top: 2),
                          child: Row(
                            children: [
                              const Icon(Icons.check, size: 16, color: Colors.green),
                              const SizedBox(width: 8),
                              Expanded(child: Text(f)),
                            ],
                          ),
                        ))),
                        const SizedBox(height: 16),
                      ],
                      // Sizes & Colors
                      if (_sizes.isNotEmpty || _colors.isNotEmpty) ...[
                        if (_sizes.isNotEmpty) ...[
                          const Text('Sizes', style: TextStyle(fontWeight: FontWeight.bold)),
                          const SizedBox(height: 4),
                          Wrap(
                            spacing: 8,
                            children: _sizes.map((s) => Chip(label: Text(s))).toList(),
                          ),
                          const SizedBox(height: 8),
                        ],
                        if (_colors.isNotEmpty) ...[
                          const Text('Colors', style: TextStyle(fontWeight: FontWeight.bold)),
                          const SizedBox(height: 4),
                          Wrap(
                            spacing: 8,
                            children: _colors.map((c) => Chip(
                              avatar: CircleAvatar(backgroundColor: Color(int.parse(c['code']!.replaceFirst('#', '0xFF')))),
                              label: Text(c['name'] ?? ''),
                            )).toList(),
                          ),
                        ],
                      ],
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  static const String _draftKey = 'product_draft';

  Future<void> _saveDraft() async {
    try {
      final prefs = await SharedPreferences.getInstance();

      final draftData = {
        'name': _nameController.text,
        'brand': _brandController.text,
        'description': _descriptionController.text,
        'sku': _skuController.text,
        'barcode': _barcodeController.text,
        'material': _materialController.text,
        'price': _priceController.text,
        'compareAtPrice': _compareAtPriceController.text,
        'costPerItem': _costPerItemController.text,
        'taxRate': _taxRateController.text,
        'quantity': _quantityController.text,
        'selectedCategory': _selectedCategory,
        'selectedStatus': _selectedStatus,
        'stockStatus': _stockStatus,
        'sizes': _sizes,
        'colors': _colors,
        'tags': _tags,
        'features': _features,
        'specifications': _specifications,
        'careInstructions': _careInstructions,
        'sizeChart': _sizeChart,
        'returnConditions': _returnConditions,
        'freeReturns': _freeReturns,
        'isFeatured': _isFeatured,
        'isVisible': _isVisible,
        'isFlashSale': _isFlashSale,
        'flashSalePrice': _flashSalePriceController.text,
        'metaTitle': _metaTitleController.text,
        'metaDescription': _metaDescriptionController.text,
        'slug': _slugController.text,
        'freeShippingThreshold': _freeShippingThresholdController.text,
        'standardShippingDays': _standardShippingDaysController.text,
        'expressShippingDays': _expressShippingDaysController.text,
        'expressShippingCost': _expressShippingCostController.text,
        'returnDays': _returnDaysController.text,
        'refundDays': _refundDaysController.text,
        'timestamp': DateTime.now().toIso8601String(),
      };

      await prefs.setString(_draftKey, jsonEncode(draftData));

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Draft saved locally'),
            duration: Duration(seconds: 2),
          ),
        );
      }
    } catch (e) {
      debugPrint('Failed to save draft: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to save draft'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _loadDraft() async {
    // Don't load draft when editing existing product
    if (widget.productId != null) return;

    try {
      final prefs = await SharedPreferences.getInstance();
      final draftJson = prefs.getString(_draftKey);

      if (draftJson == null || draftJson.isEmpty) return;

      final draft = jsonDecode(draftJson) as Map<String, dynamic>;

      // Check if draft has meaningful content
      final hasContent = (draft['name'] as String?)?.isNotEmpty == true ||
          (draft['description'] as String?)?.isNotEmpty == true;

      if (!hasContent) {
        await prefs.remove(_draftKey);
        return;
      }

      setState(() {
        _nameController.text = draft['name'] ?? '';
        _brandController.text = draft['brand'] ?? '';
        _descriptionController.text = draft['description'] ?? '';
        _skuController.text = draft['sku'] ?? '';
        _barcodeController.text = draft['barcode'] ?? '';
        _materialController.text = draft['material'] ?? '';
        _priceController.text = draft['price'] ?? '';
        _compareAtPriceController.text = draft['compareAtPrice'] ?? '';
        _costPerItemController.text = draft['costPerItem'] ?? '';
        _taxRateController.text = draft['taxRate'] ?? '';
        _quantityController.text = draft['quantity'] ?? '';
        _selectedCategory = draft['selectedCategory'] ?? '';
        _selectedStatus = draft['selectedStatus'] ?? 'draft';
        _stockStatus = draft['stockStatus'] ?? 'in_stock';
        _sizes = List<String>.from(draft['sizes'] ?? []);
        _colors = (draft['colors'] as List?)?.map((c) => Map<String, String>.from(c)).toList() ?? [];
        _tags = List<String>.from(draft['tags'] ?? []);
        _features = List<String>.from(draft['features'] ?? []);
        _specifications = (draft['specifications'] as List?)?.map((s) => Map<String, String>.from(s)).toList() ?? [];
        _careInstructions = List<String>.from(draft['careInstructions'] ?? []);
        _sizeChart = (draft['sizeChart'] as List?)?.map((s) => Map<String, String>.from(s)).toList() ?? [];
        _returnConditions = List<String>.from(draft['returnConditions'] ?? []);
        _freeReturns = draft['freeReturns'] ?? false;
        _isFeatured = draft['isFeatured'] ?? false;
        _isVisible = draft['isVisible'] ?? true;
        _isFlashSale = draft['isFlashSale'] ?? false;
        _flashSalePriceController.text = draft['flashSalePrice'] ?? '';
        _metaTitleController.text = draft['metaTitle'] ?? '';
        _metaDescriptionController.text = draft['metaDescription'] ?? '';
        _slugController.text = draft['slug'] ?? '';
        _freeShippingThresholdController.text = draft['freeShippingThreshold'] ?? '100';
        _standardShippingDaysController.text = draft['standardShippingDays'] ?? '5-7';
        _expressShippingDaysController.text = draft['expressShippingDays'] ?? '2-3';
        _expressShippingCostController.text = draft['expressShippingCost'] ?? '15.99';
        _returnDaysController.text = draft['returnDays'] ?? '30';
        _refundDaysController.text = draft['refundDays'] ?? '5-7';
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Draft restored'),
            duration: Duration(seconds: 2),
          ),
        );
      }
    } catch (e) {
      debugPrint('Failed to load draft: $e');
    }
  }

  Future<void> _clearDraft() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_draftKey);
    } catch (e) {
      debugPrint('Failed to clear draft: $e');
    }
  }

  void _addReturnCondition() {
    final condition = _returnConditionInputController.text.trim();
    if (condition.isNotEmpty && !_returnConditions.contains(condition)) {
      setState(() {
        _returnConditions.add(condition);
        _returnConditionInputController.clear();
      });
    }
  }

  void _removeReturnCondition(String condition) {
    setState(() {
      _returnConditions.remove(condition);
    });
  }

  double _calculateProfit() {
    final price = double.tryParse(_priceController.text) ?? 0;
    final cost = double.tryParse(_costPerItemController.text) ?? 0;
    return price - cost;
  }

  double _calculateProfitMargin() {
    final price = double.tryParse(_priceController.text) ?? 0;
    if (price == 0) return 0;
    final profit = _calculateProfit();
    return (profit / price) * 100;
  }

  void _generateSKU() {
    // Get prefix from product name (first 3 chars uppercase) or 'PRD' as default
    final name = _nameController.text.trim();
    final prefix = name.length >= 3
        ? name.substring(0, 3).toUpperCase()
        : (name.isNotEmpty ? name.toUpperCase() : 'PRD');

    // Generate random 6-character alphanumeric string
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    final rng = Random();
    final randomStr = List.generate(6, (_) => chars[rng.nextInt(chars.length)]).join();

    final sku = '$prefix-$randomStr';
    setState(() {
      _skuController.text = sku;
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('SKU generated: $sku'),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  Future<void> _saveProduct() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (_selectedImageFiles.isEmpty && _existingImageUrls.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please add at least one product image')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final authState = ref.read(authProvider);
      final shopId = authState.user?.metadata?['shopId'] as String?;

      if (shopId == null) {
        throw Exception('Shop ID not found');
      }

      // Convert specifications array to object
      final specificationsObj = <String, dynamic>{};
      for (var spec in _specifications) {
        specificationsObj[spec['key']!] = spec['value']!;
      }

      final productData = <String, dynamic>{
        'name': _nameController.text.trim(),
        'brand': _brandController.text.trim(),
        'description': _descriptionController.text.trim(),
        'sku': _skuController.text.trim(),
        'barcode': _barcodeController.text.trim(),
        'material': _materialController.text.trim(),
        'price': double.tryParse(_priceController.text) ?? 0,
        'compareAtPrice': double.tryParse(_compareAtPriceController.text) ?? 0,
        'costPerItem': double.tryParse(_costPerItemController.text) ?? 0,
        'taxRate': double.tryParse(_taxRateController.text) ?? 0,
        'trackInventory': _trackInventory,
        'quantity': int.tryParse(_quantityController.text) ?? 0,
        'lowStockThreshold': int.tryParse(_lowStockThresholdController.text) ?? 10,
        // Don't send stockStatus - backend will handle it automatically
        'categoryId': _selectedCategory,
        'tags': _tags,
        'sizes': _sizes,
        'colors': _colors,
        'features': _features,
        'specifications': specificationsObj,
        // Map frontend status to backend: published → active, draft → draft, archived → archived
        'status': _selectedStatus == 'published' ? 'active' : _selectedStatus,
        'metaTitle': _metaTitleController.text.trim(),
        'metaDescription': _metaDescriptionController.text.trim(),
        'slug': _slugController.text.trim(),
        'isFeatured': _isFeatured,
        // Campaigns & Offers linking
        'campaignIds': _selectedCampaignIds,
        'offerIds': _selectedOfferIds,
        // Size Chart
        'sizeChart': _sizeChart,
      };

      // Add flash sale data if enabled
      if (_isFlashSale) {
        productData['flashSale'] = {
          'isActive': true,
          'price': double.tryParse(_flashSalePriceController.text) ?? 0,
          'startDate': _flashSaleStartDate?.toIso8601String(),
          'endDate': _flashSaleEndDate?.toIso8601String(),
        };
      }

      // Add scheduled publish date if set
      if (_schedulePublishDate != null) {
        productData['scheduledPublishDate'] = _schedulePublishDate!.toIso8601String();
      }

      final repository = ProductRepository();

      if (widget.productId == null) {
        // Create new product
        if (_selectedImageFiles.isNotEmpty) {
          final imageFilePaths = _selectedImageFiles.map((xFile) => xFile.path).toList();
          final uploadedImages = await repository.uploadProductImages(
            imageFilePaths,
            shopId,
            _nameController.text.trim(),
          );

          // Set primary image
          for (var i = 0; i < uploadedImages.length; i++) {
            uploadedImages[i]['isPrimary'] = i == _primaryImageIndex;
          }

          productData['images'] = uploadedImages;
        }

        await repository.createProduct(productData, shopId);
      } else {
        // Update existing product
        List<Map<String, dynamic>> allImages = [];

        // Add existing images
        for (var i = 0; i < _existingImageUrls.length; i++) {
          allImages.add({
            'url': _existingImageUrls[i],
            'alt': _nameController.text.trim(),
            'isPrimary': i == _primaryImageIndex,
            'order': i,
          });
        }

        // Upload and add new images
        if (_selectedImageFiles.isNotEmpty) {
          final imageFilePaths = _selectedImageFiles.map((xFile) => xFile.path).toList();
          final uploadedImages = await repository.uploadProductImages(
            imageFilePaths,
            shopId,
            _nameController.text.trim(),
          );

          // Add newly uploaded images to the list
          for (var i = 0; i < uploadedImages.length; i++) {
            final imageIndex = _existingImageUrls.length + i;
            allImages.add({
              'url': uploadedImages[i]['url'],
              'alt': _nameController.text.trim(),
              'isPrimary': imageIndex == _primaryImageIndex,
              'order': imageIndex,
            });
          }
        }

        // Ensure at least one image is marked as primary
        if (!allImages.any((img) => img['isPrimary'] == true) && allImages.isNotEmpty) {
          allImages[0]['isPrimary'] = true;
        }

        productData['images'] = allImages;
        await repository.updateProduct(widget.productId!, productData, shopId);
      }

      // Clear draft after successful save
      await _clearDraft();

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(widget.productId != null
                ? 'Product updated successfully!'
                : 'Product created successfully!'),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.productId != null ? 'Edit Product' : 'Add Product'),
        actions: [
          if (!_isLoading)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
              child: ElevatedButton.icon(
                onPressed: _saveProduct,
                icon: const Icon(Icons.check, size: 18),
                label: Text(widget.productId != null ? 'Update' : 'Create'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: theme.colorScheme.primary,
                  foregroundColor: Colors.white,
                  elevation: 0,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
              ),
            ),
          if (_isLoading)
            const Padding(
              padding: EdgeInsets.all(16),
              child: SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                ),
              ),
            ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Form(
              key: _formKey,
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    ..._buildProductInfoContent(theme),
                  ],
                ),
              ),
            ),
    );
  }

  List<Widget> _buildProductInfoContent(ThemeData theme) {
    return [
          // 1. Basic Information
          _buildSectionCard(
            theme,
            'Basic Information',
            Icons.info_outline,
            [
              _buildTextField(
                controller: _nameController,
                label: 'Product Name *',
                hint: 'Enter product name',
                validator: (value) => value?.isEmpty ?? true ? 'Name is required' : null,
              ),
              const SizedBox(height: 16),
              _buildTextField(
                controller: _brandController,
                label: 'Brand',
                hint: 'Enter brand name',
              ),
              const SizedBox(height: 16),
              _buildTextField(
                controller: _descriptionController,
                label: 'Description',
                hint: 'Enter product description',
                maxLines: 4,
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    flex: 2,
                    child: _buildTextField(
                      controller: _skuController,
                      label: 'SKU',
                      hint: 'Product SKU',
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    onPressed: _generateSKU,
                    icon: const Icon(Icons.auto_fix_high),
                    tooltip: 'Generate SKU',
                    style: IconButton.styleFrom(
                      backgroundColor: theme.colorScheme.primary.withOpacity(0.1),
                      foregroundColor: theme.colorScheme.primary,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              _buildTextField(
                controller: _barcodeController,
                label: 'Barcode',
                hint: 'Barcode number',
              ),
              const SizedBox(height: 16),
              _buildTextField(
                controller: _materialController,
                label: 'Material',
                hint: 'Enter product material (e.g., Cotton, Polyester)',
              ),
            ],
          ),

          const SizedBox(height: 16),

          // Category & Tags
          _buildSectionCard(
            theme,
            'Category & Tags',
            Icons.category,
            [
              DropdownButtonFormField<String>(
                value: _selectedCategory.isEmpty ? null : _selectedCategory,
                decoration: const InputDecoration(
                  labelText: 'Category',
                  border: OutlineInputBorder(),
                ),
                items: _categories.map((category) {
                  return DropdownMenuItem(
                    value: category.id,
                    child: Text(category.name),
                  );
                }).toList(),
                onChanged: (value) => setState(() => _selectedCategory = value ?? ''),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _tagInputController,
                      decoration: const InputDecoration(
                        hintText: 'Add tag...',
                        border: OutlineInputBorder(),
                      ),
                      onSubmitted: (_) => _addTag(),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    onPressed: _addTag,
                    icon: const Icon(Icons.add),
                    color: Colors.green,
                  ),
                ],
              ),
              if (_tags.isNotEmpty) ...[
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  children: _tags.map((tag) {
                    return Chip(
                      label: Text(tag),
                      deleteIcon: const Icon(Icons.close, size: 16),
                      onDeleted: () => _removeTag(tag),
                      backgroundColor: Colors.green.shade100,
                    );
                  }).toList(),
                ),
              ],
            ],
          ),

          const SizedBox(height: 16),

          // 3. Features
          _buildSectionCard(
            theme,
            'Features',
            Icons.star,
            [
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _featureInputController,
                      decoration: const InputDecoration(
                        hintText: 'Add feature...',
                        border: OutlineInputBorder(),
                      ),
                      onSubmitted: (_) => _addFeature(),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    onPressed: _addFeature,
                    icon: const Icon(Icons.add),
                    color: Colors.orange,
                  ),
                ],
              ),
              if (_features.isNotEmpty) ...[
                const SizedBox(height: 8),
                ..._features.asMap().entries.map((entry) {
                  final index = entry.key;
                  final feature = entry.value;
                  return ListTile(
                    leading: const Icon(Icons.check_circle, color: Colors.green),
                    title: Text(feature),
                    trailing: IconButton(
                      icon: const Icon(Icons.delete, color: Colors.red),
                      onPressed: () => _removeFeature(index),
                    ),
                    contentPadding: EdgeInsets.zero,
                  );
                }).toList(),
              ],
            ],
          ),

          const SizedBox(height: 16),

          // 4. Specifications
          _buildSectionCard(
            theme,
            'Specifications',
            Icons.list_alt,
            [
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _specKeyController,
                      decoration: const InputDecoration(
                        hintText: 'Key',
                        border: OutlineInputBorder(),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TextField(
                      controller: _specValueController,
                      decoration: const InputDecoration(
                        hintText: 'Value',
                        border: OutlineInputBorder(),
                      ),
                      onSubmitted: (_) => _addSpecification(),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    onPressed: _addSpecification,
                    icon: const Icon(Icons.add),
                    color: Colors.teal,
                  ),
                ],
              ),
              const SizedBox(height: 12),
              // Quick Add Buttons - Horizontal Scroll
              SizedBox(
                height: 40,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  children: [
                    _buildQuickSpecButton('Weight', Icons.scale),
                    const SizedBox(width: 8),
                    _buildQuickSpecButton('Dimensions', Icons.straighten),
                    const SizedBox(width: 8),
                    _buildQuickSpecButton('Color', Icons.palette),
                    const SizedBox(width: 8),
                    _buildQuickSpecButton('Material', Icons.layers),
                    const SizedBox(width: 8),
                    _buildQuickSpecButton('Care Instructions', Icons.local_laundry_service),
                    const SizedBox(width: 8),
                    _buildQuickSpecButton('Origin', Icons.public),
                  ],
                ),
              ),
              if (_specifications.isNotEmpty) ...[
                const SizedBox(height: 8),
                ..._specifications.asMap().entries.map((entry) {
                  final index = entry.key;
                  final spec = entry.value;
                  return Card(
                    child: ListTile(
                      title: Text(spec['key']!),
                      subtitle: Text(spec['value']!),
                      trailing: IconButton(
                        icon: const Icon(Icons.delete, color: Colors.red),
                        onPressed: () => _removeSpecification(index),
                      ),
                    ),
                  );
                }).toList(),
              ],
            ],
          ),

          const SizedBox(height: 16),

          // 5. Pricing
          _buildSectionCard(
            theme,
            'Pricing',
            Icons.attach_money,
            [
              Row(
                children: [
                  Expanded(
                    child: _buildTextField(
                      controller: _priceController,
                      label: 'Price *',
                      hint: '0.00',
                      keyboardType: TextInputType.number,
                      prefix: const Text('\$ '),
                      validator: (value) => value?.isEmpty ?? true ? 'Price is required' : null,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildTextField(
                      controller: _compareAtPriceController,
                      label: 'Compare-at Price',
                      hint: '0.00',
                      keyboardType: TextInputType.number,
                      prefix: const Text('\$ '),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: _buildTextField(
                      controller: _costPerItemController,
                      label: 'Cost per Item',
                      hint: '0.00',
                      keyboardType: TextInputType.number,
                      prefix: const Text('\$ '),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildTextField(
                      controller: _taxRateController,
                      label: 'Tax Rate (%)',
                      hint: '0',
                      keyboardType: TextInputType.number,
                    ),
                  ),
                ],
              ),
              if (_priceController.text.isNotEmpty && _costPerItemController.text.isNotEmpty)
                Container(
                  margin: const EdgeInsets.only(top: 12),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.green.shade50,
                    border: Border.all(color: Colors.green.shade200),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Profit Margin:', style: TextStyle(fontWeight: FontWeight.w500)),
                      Text(
                        '\$${_calculateProfit().toStringAsFixed(2)} (${_calculateProfitMargin().toStringAsFixed(1)}%)',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: Colors.green.shade700,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),

          const SizedBox(height: 16),

          // Product Images
          _buildSectionCard(
            theme,
            'Product Images',
            Icons.image,
            [
              GestureDetector(
                onTap: _pickImages,
                child: Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.grey.shade300, width: 2),
                    borderRadius: BorderRadius.circular(12),
                    color: Colors.grey.shade50,
                  ),
                  child: Column(
                    children: [
                      Icon(Icons.cloud_upload, size: 48, color: Colors.grey.shade400),
                      const SizedBox(height: 8),
                      Text('Click to upload images', style: TextStyle(color: Colors.grey.shade600)),
                      Text('JPG, PNG, GIF (Max 5MB)', style: TextStyle(fontSize: 12, color: Colors.grey.shade400)),
                    ],
                  ),
                ),
              ),
              if (_selectedImageFiles.isNotEmpty || _existingImageUrls.isNotEmpty) ...[
                const SizedBox(height: 12),
                GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 3,
                    crossAxisSpacing: 8,
                    mainAxisSpacing: 8,
                  ),
                  itemCount: _selectedImageFiles.length + _existingImageUrls.length,
                  itemBuilder: (context, index) {
                    final isExisting = index < _existingImageUrls.length;
                    final isPrimary = index == _primaryImageIndex;

                    return Stack(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: isExisting
                              ? Image.network(
                                  _existingImageUrls[index],
                                  fit: BoxFit.cover,
                                  width: double.infinity,
                                  height: double.infinity,
                                  errorBuilder: (context, error, stackTrace) {
                                    return Container(
                                      color: Colors.grey.shade300,
                                      child: const Icon(Icons.broken_image, color: Colors.grey),
                                    );
                                  },
                                )
                              : Image.file(
                                  File(_selectedImageFiles[index - _existingImageUrls.length].path),
                                  fit: BoxFit.cover,
                                  width: double.infinity,
                                  height: double.infinity,
                                ),
                        ),
                        if (isPrimary)
                          Positioned(
                            top: 4,
                            left: 4,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: theme.colorScheme.primary,
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: const Text(
                                'Primary',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ),
                        Positioned(
                          top: 4,
                          right: 4,
                          child: Row(
                            children: [
                              GestureDetector(
                                onTap: () => _setPrimaryImage(index),
                                child: Container(
                                  padding: const EdgeInsets.all(4),
                                  decoration: BoxDecoration(
                                    color: isPrimary ? theme.colorScheme.primary : Colors.white.withOpacity(0.7),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Icon(
                                    Icons.star,
                                    size: 16,
                                    color: isPrimary ? Colors.white : Colors.grey.shade700,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 4),
                              GestureDetector(
                                onTap: () => _removeImage(index),
                                child: Container(
                                  padding: const EdgeInsets.all(4),
                                  decoration: BoxDecoration(
                                    color: Colors.red.withOpacity(0.8),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: const Icon(Icons.close, size: 16, color: Colors.white),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    );
                  },
                ),
              ],
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: _pickImages,
                      icon: const Icon(Icons.photo_library),
                      label: const Text('Gallery'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: _takePhoto,
                      icon: const Icon(Icons.camera_alt),
                      label: const Text('Camera'),
                    ),
                  ),
                ],
              ),
            ],
          ),

          const SizedBox(height: 16),

          // Inventory
          _buildSectionCard(
            theme,
            'Inventory',
            Icons.inventory,
            [
              SwitchListTile(
                title: const Text('Track inventory'),
                value: _trackInventory,
                onChanged: (value) => setState(() => _trackInventory = value),
                contentPadding: EdgeInsets.zero,
              ),
              if (_trackInventory) ...[
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: _buildTextField(
                        controller: _quantityController,
                        label: 'Stock Quantity',
                        hint: '0',
                        keyboardType: TextInputType.number,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _buildTextField(
                        controller: _lowStockThresholdController,
                        label: 'Low Stock Alert',
                        hint: '10',
                        keyboardType: TextInputType.number,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  value: _stockStatus,
                  decoration: const InputDecoration(
                    labelText: 'Stock Status',
                    border: OutlineInputBorder(),
                  ),
                  items: _stockStatuses.map((status) {
                    return DropdownMenuItem(
                      value: status,
                      child: Text(status.replaceAll('_', ' ').toUpperCase()),
                    );
                  }).toList(),
                  onChanged: (value) => setState(() => _stockStatus = value!),
                ),
              ],
            ],
          ),

          const SizedBox(height: 16),

          // Variants (Size & Color)
          _buildSectionCard(
            theme,
            'Variants (Size & Color)',
            Icons.palette,
            [
              // Sizes
              const Text('Sizes', style: TextStyle(fontWeight: FontWeight.w500)),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _sizeInputController,
                      decoration: const InputDecoration(
                        hintText: 'Add size...',
                        border: OutlineInputBorder(),
                      ),
                      onSubmitted: (_) => _addSize(),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    onPressed: _addSize,
                    icon: const Icon(Icons.add),
                    color: Colors.blue,
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                children: ['S', 'M', 'L', 'XL', 'XXL'].map((size) {
                  final isSelected = _sizes.contains(size);
                  return FilterChip(
                    label: Text(size),
                    selected: isSelected,
                    onSelected: (selected) {
                      setState(() {
                        if (selected) {
                          _sizes.add(size);
                        } else {
                          _sizes.remove(size);
                        }
                      });
                    },
                  );
                }).toList(),
              ),
              if (_sizes.isNotEmpty) ...[
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  children: _sizes.map((size) {
                    return Chip(
                      label: Text(size),
                      deleteIcon: const Icon(Icons.close, size: 16),
                      onDeleted: () => _removeSize(size),
                      backgroundColor: Colors.blue.shade100,
                    );
                  }).toList(),
                ),
              ],

              const SizedBox(height: 16),

              // Colors
              const Text('Colors', style: TextStyle(fontWeight: FontWeight.w500)),
              const SizedBox(height: 8),
              Row(
                children: [
                  GestureDetector(
                    onTap: () async {
                      // Simple color picker dialog
                      showDialog(
                        context: context,
                        builder: (context) => AlertDialog(
                          title: const Text('Pick a color'),
                          content: Wrap(
                            spacing: 8,
                            children: [
                              Colors.black,
                              Colors.white,
                              Colors.red,
                              Colors.blue,
                              Colors.green,
                              Colors.yellow,
                              Colors.orange,
                              Colors.purple,
                              Colors.pink,
                              Colors.brown,
                              Colors.grey,
                            ].map((color) {
                              return GestureDetector(
                                onTap: () {
                                  setState(() => _selectedColor = color);
                                  Navigator.pop(context);
                                },
                                child: Container(
                                  width: 40,
                                  height: 40,
                                  decoration: BoxDecoration(
                                    color: color,
                                    border: Border.all(color: Colors.grey),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                ),
                              );
                            }).toList(),
                          ),
                        ),
                      );
                    },
                    child: Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: _selectedColor,
                        border: Border.all(color: Colors.grey),
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TextField(
                      controller: _colorNameController,
                      decoration: const InputDecoration(
                        hintText: 'Color name',
                        border: OutlineInputBorder(),
                      ),
                      onSubmitted: (_) => _addColor(),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    onPressed: _addColor,
                    icon: const Icon(Icons.add),
                    color: Colors.purple,
                  ),
                ],
              ),
              if (_colors.isNotEmpty) ...[
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  children: _colors.asMap().entries.map((entry) {
                    final index = entry.key;
                    final color = entry.value;
                    return Chip(
                      avatar: CircleAvatar(
                        backgroundColor: Color(
                          int.parse(color['code']!.substring(1), radix: 16) + 0xFF000000,
                        ),
                      ),
                      label: Text(color['name']!),
                      deleteIcon: const Icon(Icons.close, size: 16),
                      onDeleted: () => _removeColor(index),
                      backgroundColor: Colors.purple.shade100,
                    );
                  }).toList(),
                ),
              ],
            ],
          ),

          const SizedBox(height: 16),

          // 9. Campaigns & Offers
          _buildSectionCard(
            theme,
            'Campaigns & Offers',
            Icons.local_offer,
            [
              // Flash Sale
              SwitchListTile(
                title: const Text('Enable Flash Sale'),
                subtitle: const Text('Set a limited-time discounted price'),
                value: _isFlashSale,
                onChanged: (value) => setState(() => _isFlashSale = value),
                contentPadding: EdgeInsets.zero,
              ),
              if (_isFlashSale) ...[
                const SizedBox(height: 12),
                _buildTextField(
                  controller: _flashSalePriceController,
                  label: 'Flash Sale Price *',
                  hint: '0.00',
                  keyboardType: TextInputType.number,
                  prefix: const Text('\$ '),
                  validator: (value) {
                    if (_isFlashSale && (value?.isEmpty ?? true)) {
                      return 'Flash sale price is required';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: InkWell(
                        onTap: () async {
                          final date = await showDatePicker(
                            context: context,
                            initialDate: _flashSaleStartDate ?? DateTime.now(),
                            firstDate: DateTime.now(),
                            lastDate: DateTime.now().add(const Duration(days: 365)),
                          );
                          if (date != null && mounted) {
                            final time = await showTimePicker(
                              context: context,
                              initialTime: TimeOfDay.now(),
                            );
                            if (time != null && mounted) {
                              setState(() {
                                _flashSaleStartDate = DateTime(
                                  date.year,
                                  date.month,
                                  date.day,
                                  time.hour,
                                  time.minute,
                                );
                              });
                            }
                          }
                        },
                        child: InputDecorator(
                          decoration: const InputDecoration(
                            labelText: 'Start Date & Time *',
                            border: OutlineInputBorder(),
                            suffixIcon: Icon(Icons.calendar_today),
                          ),
                          child: Text(
                            _flashSaleStartDate != null
                                ? '${_flashSaleStartDate!.day}/${_flashSaleStartDate!.month}/${_flashSaleStartDate!.year} ${_flashSaleStartDate!.hour}:${_flashSaleStartDate!.minute.toString().padLeft(2, '0')}'
                                : 'Select date & time',
                            style: TextStyle(
                              color: _flashSaleStartDate != null ? Colors.black : Colors.grey,
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: InkWell(
                        onTap: () async {
                          final date = await showDatePicker(
                            context: context,
                            initialDate: _flashSaleEndDate ?? DateTime.now().add(const Duration(days: 1)),
                            firstDate: _flashSaleStartDate ?? DateTime.now(),
                            lastDate: DateTime.now().add(const Duration(days: 365)),
                          );
                          if (date != null && mounted) {
                            final time = await showTimePicker(
                              context: context,
                              initialTime: TimeOfDay.now(),
                            );
                            if (time != null && mounted) {
                              setState(() {
                                _flashSaleEndDate = DateTime(
                                  date.year,
                                  date.month,
                                  date.day,
                                  time.hour,
                                  time.minute,
                                );
                              });
                            }
                          }
                        },
                        child: InputDecorator(
                          decoration: const InputDecoration(
                            labelText: 'End Date & Time *',
                            border: OutlineInputBorder(),
                            suffixIcon: Icon(Icons.calendar_today),
                          ),
                          child: Text(
                            _flashSaleEndDate != null
                                ? '${_flashSaleEndDate!.day}/${_flashSaleEndDate!.month}/${_flashSaleEndDate!.year} ${_flashSaleEndDate!.hour}:${_flashSaleEndDate!.minute.toString().padLeft(2, '0')}'
                                : 'Select date & time',
                            style: TextStyle(
                              color: _flashSaleEndDate != null ? Colors.black : Colors.grey,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                if (_flashSalePriceController.text.isNotEmpty && _priceController.text.isNotEmpty)
                  Container(
                    margin: const EdgeInsets.only(top: 12),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.orange.shade50,
                      border: Border.all(color: Colors.orange.shade200),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Discount:', style: TextStyle(fontWeight: FontWeight.w500)),
                        Text(
                          () {
                            final price = double.tryParse(_priceController.text) ?? 0;
                            final flashPrice = double.tryParse(_flashSalePriceController.text) ?? 0;
                            final discount = price - flashPrice;
                            final percentage = price > 0 ? (discount / price * 100) : 0;
                            return '\$${discount.toStringAsFixed(2)} (${percentage.toStringAsFixed(1)}% OFF)';
                          }(),
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Colors.orange.shade700,
                          ),
                        ),
                      ],
                    ),
                  ),
              ],

              // Divider before campaigns/offers linking
              const SizedBox(height: 24),
              const Divider(),
              const SizedBox(height: 16),

              // Link to Campaigns (placeholder - campaigns feature coming soon)
              const Text(
                'Link to Campaigns',
                style: TextStyle(fontWeight: FontWeight.w500, fontSize: 14),
              ),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.grey.shade50,
                  border: Border.all(color: Colors.grey.shade200),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    Icon(Icons.campaign_outlined, color: Colors.grey.shade400),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'No active campaigns',
                        style: TextStyle(color: Colors.grey.shade500),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Link to Offers
              const Text(
                'Link to Offers',
                style: TextStyle(fontWeight: FontWeight.w500, fontSize: 14),
              ),
              const SizedBox(height: 8),
              if (_loadingOffers)
                const Center(child: CircularProgressIndicator())
              else if (_offers.isEmpty)
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade50,
                    border: Border.all(color: Colors.grey.shade200),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.local_offer_outlined, color: Colors.grey.shade400),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          'No active offers',
                          style: TextStyle(color: Colors.grey.shade500),
                        ),
                      ),
                    ],
                  ),
                )
              else
                Container(
                  constraints: const BoxConstraints(maxHeight: 200),
                  child: ListView.builder(
                    shrinkWrap: true,
                    itemCount: _offers.length,
                    itemBuilder: (context, index) {
                      final offer = _offers[index];
                      final isSelected = _selectedOfferIds.contains(offer.id);
                      return CheckboxListTile(
                        value: isSelected,
                        onChanged: (selected) {
                          setState(() {
                            if (selected == true) {
                              _selectedOfferIds.add(offer.id);
                            } else {
                              _selectedOfferIds.remove(offer.id);
                            }
                          });
                        },
                        title: Text(
                          offer.name.isNotEmpty ? offer.name : offer.code,
                          style: const TextStyle(fontWeight: FontWeight.w500),
                        ),
                        subtitle: Text(
                          '${offer.code} • ${offer.formattedDiscount}',
                          style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
                        ),
                        secondary: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: theme.colorScheme.primary.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            offer.formattedDiscount,
                            style: TextStyle(
                              color: theme.colorScheme.primary,
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                        ),
                        contentPadding: EdgeInsets.zero,
                        dense: true,
                      );
                    },
                  ),
                ),
            ],
          ),

          const SizedBox(height: 16),

          // 10. SEO Settings
          _buildSectionCard(
            theme,
            'SEO Settings',
            Icons.search,
            [
              _buildTextField(
                controller: _metaTitleController,
                label: 'Meta Title',
                hint: 'SEO title (60 characters recommended)',
                maxLength: 60,
              ),
              const SizedBox(height: 16),
              _buildTextField(
                controller: _metaDescriptionController,
                label: 'Meta Description',
                hint: 'SEO description (160 characters recommended)',
                maxLines: 3,
                maxLength: 160,
              ),
              const SizedBox(height: 16),
              _buildTextField(
                controller: _slugController,
                label: 'URL Slug',
                hint: 'product-url-slug',
                helperText: 'Leave empty to auto-generate from product name',
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Icon(Icons.info_outline, size: 16, color: Colors.grey.shade600),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      'Good SEO helps your product rank better in search results',
                      style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                    ),
                  ),
                ],
              ),
            ],
          ),

          const SizedBox(height: 16),

          // 11. Shipping & Care
          _buildSectionCard(
            theme,
            'Shipping & Care',
            Icons.local_shipping,
            [
              // Care Instructions
              const Text('Care Instructions', style: TextStyle(fontWeight: FontWeight.w500)),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _careInputController,
                      decoration: const InputDecoration(
                        hintText: 'Add care instruction...',
                        border: OutlineInputBorder(),
                      ),
                      onSubmitted: (_) => _addCareInstruction(),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    onPressed: _addCareInstruction,
                    icon: const Icon(Icons.add),
                    color: Colors.blue,
                  ),
                ],
              ),
              const SizedBox(height: 8),
              // Quick add care instruction presets
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  'Machine wash cold',
                  'Do not bleach',
                  'Tumble dry low',
                  'Iron on low heat',
                  'Dry clean only',
                ].map((preset) {
                  final isSelected = _careInstructions.contains(preset);
                  return FilterChip(
                    label: Text(preset, style: const TextStyle(fontSize: 12)),
                    selected: isSelected,
                    onSelected: (selected) {
                      setState(() {
                        if (selected && !_careInstructions.contains(preset)) {
                          _careInstructions.add(preset);
                        } else {
                          _careInstructions.remove(preset);
                        }
                      });
                    },
                  );
                }).toList(),
              ),
              if (_careInstructions.isNotEmpty) ...[
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  children: _careInstructions.map((instruction) {
                    return Chip(
                      label: Text(instruction),
                      deleteIcon: const Icon(Icons.close, size: 16),
                      onDeleted: () => _removeCareInstruction(instruction),
                      backgroundColor: Colors.blue.shade100,
                    );
                  }).toList(),
                ),
              ],

              const SizedBox(height: 24),
              const Divider(),
              const SizedBox(height: 16),

              // Size Chart
              Row(
                children: [
                  const Icon(Icons.straighten, size: 18),
                  const SizedBox(width: 8),
                  const Text('Size Chart', style: TextStyle(fontWeight: FontWeight.w500)),
                ],
              ),
              const SizedBox(height: 12),
              // Size Chart Input Fields
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    SizedBox(
                      width: 80,
                      child: TextField(
                        controller: _sizeChartSizeController,
                        decoration: const InputDecoration(
                          hintText: 'Size',
                          hintStyle: TextStyle(fontSize: 12),
                          border: OutlineInputBorder(),
                          contentPadding: EdgeInsets.symmetric(horizontal: 8, vertical: 12),
                        ),
                        style: const TextStyle(fontSize: 13),
                      ),
                    ),
                    const SizedBox(width: 8),
                    SizedBox(
                      width: 90,
                      child: TextField(
                        controller: _sizeChartChestController,
                        decoration: const InputDecoration(
                          hintText: 'Chest',
                          hintStyle: TextStyle(fontSize: 12),
                          border: OutlineInputBorder(),
                          contentPadding: EdgeInsets.symmetric(horizontal: 8, vertical: 12),
                        ),
                        style: const TextStyle(fontSize: 13),
                      ),
                    ),
                    const SizedBox(width: 8),
                    SizedBox(
                      width: 90,
                      child: TextField(
                        controller: _sizeChartWaistController,
                        decoration: const InputDecoration(
                          hintText: 'Waist',
                          hintStyle: TextStyle(fontSize: 12),
                          border: OutlineInputBorder(),
                          contentPadding: EdgeInsets.symmetric(horizontal: 8, vertical: 12),
                        ),
                        style: const TextStyle(fontSize: 13),
                      ),
                    ),
                    const SizedBox(width: 8),
                    SizedBox(
                      width: 90,
                      child: TextField(
                        controller: _sizeChartHipsController,
                        decoration: const InputDecoration(
                          hintText: 'Hips',
                          hintStyle: TextStyle(fontSize: 12),
                          border: OutlineInputBorder(),
                          contentPadding: EdgeInsets.symmetric(horizontal: 8, vertical: 12),
                        ),
                        style: const TextStyle(fontSize: 13),
                      ),
                    ),
                    const SizedBox(width: 8),
                    SizedBox(
                      width: 90,
                      child: TextField(
                        controller: _sizeChartLengthController,
                        decoration: const InputDecoration(
                          hintText: 'Length',
                          hintStyle: TextStyle(fontSize: 12),
                          border: OutlineInputBorder(),
                          contentPadding: EdgeInsets.symmetric(horizontal: 8, vertical: 12),
                        ),
                        style: const TextStyle(fontSize: 13),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              ElevatedButton.icon(
                onPressed: () {
                  if (_sizeChartSizeController.text.trim().isNotEmpty) {
                    setState(() {
                      _sizeChart.add({
                        'size': _sizeChartSizeController.text.trim(),
                        'chest': _sizeChartChestController.text.trim(),
                        'waist': _sizeChartWaistController.text.trim(),
                        'hips': _sizeChartHipsController.text.trim(),
                        'length': _sizeChartLengthController.text.trim(),
                      });
                      _sizeChartSizeController.clear();
                      _sizeChartChestController.clear();
                      _sizeChartWaistController.clear();
                      _sizeChartHipsController.clear();
                      _sizeChartLengthController.clear();
                    });
                  }
                },
                icon: const Icon(Icons.add, size: 18),
                label: const Text('Add Size'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: theme.colorScheme.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                ),
              ),
              if (_sizeChart.isNotEmpty) ...[
                const SizedBox(height: 16),
                Container(
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.grey.shade300),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: DataTable(
                      columnSpacing: 16,
                      headingRowHeight: 40,
                      dataRowMinHeight: 36,
                      dataRowMaxHeight: 40,
                      columns: const [
                        DataColumn(label: Text('Size', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12))),
                        DataColumn(label: Text('Chest', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12))),
                        DataColumn(label: Text('Waist', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12))),
                        DataColumn(label: Text('Hips', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12))),
                        DataColumn(label: Text('Length', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12))),
                        DataColumn(label: Text('', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12))),
                      ],
                      rows: _sizeChart.asMap().entries.map((entry) {
                        final idx = entry.key;
                        final row = entry.value;
                        return DataRow(
                          cells: [
                            DataCell(Text(row['size'] ?? '', style: const TextStyle(fontSize: 12))),
                            DataCell(Text(row['chest'] ?? '', style: const TextStyle(fontSize: 12))),
                            DataCell(Text(row['waist'] ?? '', style: const TextStyle(fontSize: 12))),
                            DataCell(Text(row['hips'] ?? '', style: const TextStyle(fontSize: 12))),
                            DataCell(Text(row['length'] ?? '', style: const TextStyle(fontSize: 12))),
                            DataCell(
                              IconButton(
                                icon: const Icon(Icons.delete, size: 18, color: Colors.red),
                                onPressed: () {
                                  setState(() {
                                    _sizeChart.removeAt(idx);
                                  });
                                },
                                padding: EdgeInsets.zero,
                                constraints: const BoxConstraints(),
                              ),
                            ),
                          ],
                        );
                      }).toList(),
                    ),
                  ),
                ),
              ],

              const SizedBox(height: 24),
              const Divider(),
              const SizedBox(height: 16),

              // Shipping Information
              const Text('Shipping Information', style: TextStyle(fontWeight: FontWeight.w500)),
              const SizedBox(height: 12),
              _buildTextField(
                controller: _freeShippingThresholdController,
                label: 'Free Shipping Threshold (\$)',
                hint: '100',
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: _buildTextField(
                      controller: _standardShippingDaysController,
                      label: 'Standard Shipping Days',
                      hint: '5-7',
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildTextField(
                      controller: _expressShippingDaysController,
                      label: 'Express Shipping Days',
                      hint: '2-3',
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: _buildTextField(
                      controller: _expressShippingCostController,
                      label: 'Express Cost (\$)',
                      hint: '15.99',
                      keyboardType: TextInputType.number,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildTextField(
                      controller: _nextDayCostController,
                      label: 'Next Day Cost (\$)',
                      hint: '29.99',
                      keyboardType: TextInputType.number,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 24),
              const Divider(),
              const SizedBox(height: 16),

              // Return Policy
              const Text('Return Policy', style: TextStyle(fontWeight: FontWeight.w500)),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: _buildTextField(
                      controller: _returnDaysController,
                      label: 'Return Days',
                      hint: '30',
                      keyboardType: TextInputType.number,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildTextField(
                      controller: _refundDaysController,
                      label: 'Refund Processing Days',
                      hint: '5-7',
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              SwitchListTile(
                title: const Text('Free Return Shipping'),
                subtitle: const Text('Offer free return shipping to customers'),
                value: _freeReturns,
                onChanged: (value) => setState(() => _freeReturns = value),
                contentPadding: EdgeInsets.zero,
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _returnConditionInputController,
                      decoration: const InputDecoration(
                        hintText: 'Add return condition...',
                        border: OutlineInputBorder(),
                      ),
                      onSubmitted: (_) => _addReturnCondition(),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    onPressed: _addReturnCondition,
                    icon: const Icon(Icons.add),
                    color: Colors.teal,
                  ),
                ],
              ),
              const SizedBox(height: 8),
              // Quick add return condition presets
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  'Unused with tags',
                  'Original packaging',
                  'No damage',
                  'Within return period',
                ].map((preset) {
                  final isSelected = _returnConditions.contains(preset);
                  return FilterChip(
                    label: Text(preset, style: const TextStyle(fontSize: 12)),
                    selected: isSelected,
                    onSelected: (selected) {
                      setState(() {
                        if (selected && !_returnConditions.contains(preset)) {
                          _returnConditions.add(preset);
                        } else {
                          _returnConditions.remove(preset);
                        }
                      });
                    },
                  );
                }).toList(),
              ),
              if (_returnConditions.isNotEmpty) ...[
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  children: _returnConditions.map((condition) {
                    return Chip(
                      label: Text(condition),
                      deleteIcon: const Icon(Icons.close, size: 16),
                      onDeleted: () => _removeReturnCondition(condition),
                      backgroundColor: Colors.teal.shade100,
                    );
                  }).toList(),
                ),
              ],
            ],
          ),

          const SizedBox(height: 16),

          // 12. Status
          _buildSectionCard(
            theme,
            'Status',
            Icons.public,
            [
              SegmentedButton<String>(
                segments: const [
                  ButtonSegment(
                    value: 'draft',
                    label: Text('Draft'),
                    icon: Icon(Icons.edit_note),
                  ),
                  ButtonSegment(
                    value: 'published',
                    label: Text('Published'),
                    icon: Icon(Icons.public),
                  ),
                ],
                selected: {_selectedStatus},
                onSelectionChanged: (Set<String> newSelection) {
                  setState(() => _selectedStatus = newSelection.first);
                },
              ),
            ],
          ),

          const SizedBox(height: 16),

          // 13. Visibility
          _buildSectionCard(
            theme,
            'Visibility',
            Icons.visibility,
            [
              SwitchListTile(
                title: const Text('Visible on Store'),
                subtitle: const Text('Show this product to customers'),
                value: _isVisible,
                onChanged: (value) => setState(() => _isVisible = value),
                contentPadding: EdgeInsets.zero,
              ),
              const SizedBox(height: 8),
              SwitchListTile(
                title: const Text('Featured Product'),
                subtitle: const Text('Display in featured products section'),
                value: _isFeatured,
                onChanged: (value) => setState(() => _isFeatured = value),
                contentPadding: EdgeInsets.zero,
              ),
              const SizedBox(height: 16),
              const Text(
                'Schedule Publish',
                style: TextStyle(fontWeight: FontWeight.w500, fontSize: 14),
              ),
              const SizedBox(height: 8),
              InkWell(
                onTap: () async {
                  final date = await showDatePicker(
                    context: context,
                    initialDate: _schedulePublishDate ?? DateTime.now().add(const Duration(days: 1)),
                    firstDate: DateTime.now(),
                    lastDate: DateTime.now().add(const Duration(days: 365)),
                  );
                  if (date != null && mounted) {
                    final time = await showTimePicker(
                      context: context,
                      initialTime: TimeOfDay.now(),
                    );
                    if (time != null && mounted) {
                      setState(() {
                        _schedulePublishDate = DateTime(
                          date.year,
                          date.month,
                          date.day,
                          time.hour,
                          time.minute,
                        );
                      });
                    }
                  }
                },
                child: InputDecorator(
                  decoration: InputDecoration(
                    labelText: 'Publish Date & Time (Optional)',
                    border: const OutlineInputBorder(),
                    suffixIcon: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        if (_schedulePublishDate != null)
                          IconButton(
                            icon: const Icon(Icons.clear, size: 20),
                            onPressed: () {
                              setState(() {
                                _schedulePublishDate = null;
                              });
                            },
                          ),
                        const Icon(Icons.calendar_today),
                        const SizedBox(width: 8),
                      ],
                    ),
                  ),
                  child: Text(
                    _schedulePublishDate != null
                        ? '${_schedulePublishDate!.day}/${_schedulePublishDate!.month}/${_schedulePublishDate!.year} ${_schedulePublishDate!.hour}:${_schedulePublishDate!.minute.toString().padLeft(2, '0')}'
                        : 'Auto-publish immediately',
                    style: TextStyle(
                      color: _schedulePublishDate != null ? Colors.black : Colors.grey,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Icon(Icons.info_outline, size: 16, color: Colors.grey.shade600),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      'Schedule a future date to publish this product automatically',
                      style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                    ),
                  ),
                ],
              ),
            ],
          ),

          const SizedBox(height: 16),

          // 14. Quick Actions
          _buildSectionCard(
            theme,
            'Quick Actions',
            Icons.flash_on,
            [
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () {
                        // Preview product
                        _showProductPreview(context, theme);
                      },
                      icon: const Icon(Icons.visibility),
                      label: const Text('Preview'),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: _saveDraft,
                      icon: const Icon(Icons.save_outlined),
                      label: const Text('Save Draft'),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
    ];
  }

  Widget _buildQuickSpecButton(String label, IconData icon) {
    return OutlinedButton.icon(
      onPressed: () {
        setState(() {
          _specKeyController.text = label;
        });
      },
      icon: Icon(icon, size: 16),
      label: Text(label),
      style: OutlinedButton.styleFrom(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        textStyle: const TextStyle(fontSize: 12),
      ),
    );
  }

  Widget _buildSectionCard(ThemeData theme, String title, IconData icon, List<Widget> children) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, color: theme.colorScheme.primary, size: 20),
                const SizedBox(width: 8),
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: theme.colorScheme.primary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            ...children,
          ],
        ),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required String hint,
    int maxLines = 1,
    int? maxLength,
    TextInputType? keyboardType,
    Widget? prefix,
    String? helperText,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      maxLines: maxLines,
      maxLength: maxLength,
      keyboardType: keyboardType,
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        helperText: helperText,
        prefix: prefix,
        border: const OutlineInputBorder(),
      ),
      validator: validator,
    );
  }
}
