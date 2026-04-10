import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import '../../../../auth/presentation/providers/auth_provider.dart';
import '../../../../auth/presentation/pages/login_page.dart';
import '../../../orders/data/repositories/delivery_repository.dart';
import 'package:easy_localization/easy_localization.dart';
import 'dart:io';

// Provider for delivery profile data
final deliveryProfileProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final repository = DeliveryRepository();
  return repository.getProfile();
});

class DeliveryProfilePage extends ConsumerStatefulWidget {
  const DeliveryProfilePage({super.key});

  @override
  ConsumerState<DeliveryProfilePage> createState() => _DeliveryProfilePageState();
}

class _DeliveryProfilePageState extends ConsumerState<DeliveryProfilePage> {
  final DeliveryRepository _repository = DeliveryRepository();
  bool _isEditing = false;
  bool _isSaving = false;
  bool _isLoading = true;
  bool _isUploadingImage = false;
  final _formKey = GlobalKey<FormState>();

  late TextEditingController _firstNameController;
  late TextEditingController _lastNameController;
  late TextEditingController _phoneController;

  String? _email;
  String? _avatarUrl;
  String? _createdAt;

  @override
  void initState() {
    super.initState();
    _firstNameController = TextEditingController();
    _lastNameController = TextEditingController();
    _phoneController = TextEditingController();
    _loadProfile();
  }

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _loadProfile() async {
    setState(() => _isLoading = true);
    try {
      final profile = await _repository.getProfile();
      if (mounted) {
        setState(() {
          final name = profile['name'] ?? '';
          final nameParts = name.split(' ');
          _firstNameController.text = nameParts.isNotEmpty ? nameParts.first : '';
          _lastNameController.text = nameParts.length > 1 ? nameParts.sublist(1).join(' ') : '';
          _phoneController.text = profile['phone'] ?? '';
          _email = profile['email'] ?? '';
          _avatarUrl = profile['avatar'] ?? profile['imageUrl'];
          _createdAt = profile['createdAt'];
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _saveProfile() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSaving = true);
    try {
      final name = '${_firstNameController.text} ${_lastNameController.text}'.trim();
      await _repository.updateProfile({
        'name': name,
        'phone': _phoneController.text,
      });

      if (mounted) {
        setState(() {
          _isSaving = false;
          _isEditing = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('delivery.profile.profileUpdated'.tr()),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSaving = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('delivery.profile.updateFailed'.tr()),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _pickAndUploadImage() async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(
      source: ImageSource.gallery,
      maxWidth: 512,
      maxHeight: 512,
      imageQuality: 80,
    );

    if (pickedFile == null) return;

    setState(() => _isUploadingImage = true);
    try {
      final imageUrl = await _repository.uploadAvatar(File(pickedFile.path));
      await _repository.updateProfile({'imageUrl': imageUrl});

      if (mounted) {
        setState(() {
          _avatarUrl = imageUrl;
          _isUploadingImage = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('delivery.profile.imageUpdated'.tr()),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isUploadingImage = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('delivery.profile.uploadFailed'.tr()),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  void _showDeleteAccountDialog() {
    final deleteController = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) {
          return AlertDialog(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            title: Row(
              children: [
                Icon(Icons.warning_amber_rounded, color: Colors.red, size: 28),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'delivery.profile.deleteAccount'.tr(),
                    style: const TextStyle(color: Colors.red, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
            content: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'delivery.profile.deleteConfirmMessage'.tr(),
                    style: TextStyle(color: Colors.grey.shade700),
                  ),
                  const SizedBox(height: 12),
                  Text('• ${'delivery.profile.deleteItem1'.tr()}',
                      style: TextStyle(color: Colors.grey.shade600, fontSize: 13)),
                  Text('• ${'delivery.profile.deleteItem2'.tr()}',
                      style: TextStyle(color: Colors.grey.shade600, fontSize: 13)),
                  Text('• ${'delivery.profile.deleteItem3'.tr()}',
                      style: TextStyle(color: Colors.grey.shade600, fontSize: 13)),
                  const SizedBox(height: 16),
                  RichText(
                    text: TextSpan(
                      style: TextStyle(color: Colors.grey.shade800),
                      children: [
                        TextSpan(text: 'delivery.profile.typeDelete'.tr()),
                        const TextSpan(
                          text: ' DELETE ',
                          style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold),
                        ),
                        TextSpan(text: 'delivery.profile.toConfirm'.tr()),
                      ],
                    ),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: deleteController,
                    onChanged: (_) => setDialogState(() {}),
                    decoration: InputDecoration(
                      hintText: 'delivery.profile.typeDeletePlaceholder'.tr(),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Colors.red),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: Text('common.cancel'.tr()),
              ),
              ElevatedButton(
                onPressed: deleteController.text == 'DELETE'
                    ? () async {
                        Navigator.pop(context);
                        await _deleteAccount();
                      }
                    : null,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: Text('delivery.profile.deleteAccount'.tr()),
              ),
            ],
          );
        },
      ),
    );
  }

  Future<void> _deleteAccount() async {
    try {
      await _repository.deleteAccount();
      if (!mounted) return;
      await ref.read(authProvider.notifier).logout();
      if (!mounted) return;
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const LoginPage()),
        (route) => false,
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('delivery.profile.deleteFailed'.tr()),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  String _getMemberSinceYear() {
    if (_createdAt == null) return DateTime.now().year.toString();
    try {
      return DateTime.parse(_createdAt!).year.toString();
    } catch (_) {
      return DateTime.now().year.toString();
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: theme.appBarTheme.backgroundColor,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'delivery.profile.title'.tr(),
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: theme.appBarTheme.foregroundColor,
              ),
            ),
            Text(
              'delivery.profile.subtitle'.tr(),
              style: TextStyle(
                fontSize: 12,
                color: theme.hintColor,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadProfile,
          ),
          if (!_isEditing)
            TextButton(
              onPressed: () => setState(() => _isEditing = true),
              child: Text(
                'delivery.profile.editProfile'.tr(),
                style: TextStyle(color: Colors.orange.shade600, fontWeight: FontWeight.w600),
              ),
            )
          else ...[
            TextButton(
              onPressed: () => setState(() => _isEditing = false),
              child: Text('common.cancel'.tr()),
            ),
            _isSaving
                ? const Padding(
                    padding: EdgeInsets.all(12),
                    child: SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    ),
                  )
                : TextButton.icon(
                    onPressed: _saveProfile,
                    icon: const Icon(Icons.save, size: 18),
                    label: Text('common.save'.tr()),
                    style: TextButton.styleFrom(foregroundColor: Colors.orange.shade600),
                  ),
          ],
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadProfile,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Profile Header Card
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [Colors.orange.shade500, Colors.amber.shade500],
                            begin: Alignment.centerLeft,
                            end: Alignment.centerRight,
                          ),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Column(
                          children: [
                            // Avatar with upload button
                            Stack(
                              children: [
                                Container(
                                  width: 96,
                                  height: 96,
                                  decoration: BoxDecoration(
                                    color: Colors.white.withValues(alpha: 0.2),
                                    borderRadius: BorderRadius.circular(16),
                                  ),
                                  child: _isUploadingImage
                                      ? const Center(
                                          child: CircularProgressIndicator(
                                            color: Colors.white,
                                            strokeWidth: 2,
                                          ),
                                        )
                                      : _avatarUrl != null && _avatarUrl!.isNotEmpty
                                          ? ClipRRect(
                                              borderRadius: BorderRadius.circular(16),
                                              child: Image.network(
                                                _avatarUrl!,
                                                fit: BoxFit.cover,
                                                width: 96,
                                                height: 96,
                                                errorBuilder: (context, error, stackTrace) => const Icon(
                                                  Icons.person,
                                                  size: 48,
                                                  color: Colors.white,
                                                ),
                                              ),
                                            )
                                          : const Icon(
                                              Icons.person,
                                              size: 48,
                                              color: Colors.white,
                                            ),
                                ),
                                Positioned(
                                  bottom: -4,
                                  right: -4,
                                  child: GestureDetector(
                                    onTap: _isUploadingImage ? null : _pickAndUploadImage,
                                    child: Container(
                                      width: 32,
                                      height: 32,
                                      decoration: BoxDecoration(
                                        color: Colors.white,
                                        shape: BoxShape.circle,
                                        boxShadow: [
                                          BoxShadow(
                                            color: Colors.black.withValues(alpha: 0.2),
                                            blurRadius: 8,
                                          ),
                                        ],
                                      ),
                                      child: Icon(
                                        Icons.camera_alt,
                                        size: 16,
                                        color: Colors.orange.shade500,
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),
                            // Name
                            Text(
                              '${_firstNameController.text} ${_lastNameController.text}'.trim(),
                              style: const TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(height: 4),
                            // Email
                            Text(
                              _email ?? '',
                              style: TextStyle(
                                fontSize: 14,
                                color: Colors.orange.shade100,
                              ),
                            ),
                            const SizedBox(height: 16),
                            // Member since
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(Icons.schedule, color: Colors.white, size: 20),
                                const SizedBox(width: 8),
                                Text(
                                  '${'delivery.profile.memberSince'.tr()} ${_getMemberSinceYear()}',
                                  style: const TextStyle(color: Colors.white, fontSize: 14),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Personal Information Section
                      _buildSectionCard(
                        title: 'delivery.profile.personalInfo'.tr(),
                        icon: Icons.person_outline,
                        theme: theme,
                        children: [
                          _buildFormField(
                            label: 'delivery.profile.firstName'.tr(),
                            controller: _firstNameController,
                            enabled: _isEditing,
                            theme: theme,
                          ),
                          const SizedBox(height: 16),
                          _buildFormField(
                            label: 'delivery.profile.lastName'.tr(),
                            controller: _lastNameController,
                            enabled: _isEditing,
                            theme: theme,
                          ),
                          const SizedBox(height: 16),
                          // Email (read-only)
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'delivery.profile.email'.tr(),
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w500,
                                  color: theme.hintColor,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  Icon(Icons.mail_outline, size: 18, color: theme.hintColor),
                                  const SizedBox(width: 8),
                                  Text(
                                    _email ?? '',
                                    style: TextStyle(fontSize: 16, color: theme.colorScheme.onSurface),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          _buildFormField(
                            label: 'delivery.profile.phone'.tr(),
                            controller: _phoneController,
                            enabled: _isEditing,
                            keyboardType: TextInputType.phone,
                            icon: Icons.phone_outlined,
                            theme: theme,
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),

                      // Delete Account Section
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: theme.colorScheme.surface,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: Colors.red.shade100),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Icon(Icons.delete_outline, color: Colors.red.shade600),
                                const SizedBox(width: 12),
                                Text(
                                  'delivery.profile.deleteAccount'.tr(),
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.red.shade600,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Text(
                              'delivery.profile.deleteWarning'.tr(),
                              style: TextStyle(
                                fontSize: 14,
                                color: theme.hintColor,
                              ),
                            ),
                            const SizedBox(height: 16),
                            ElevatedButton(
                              onPressed: _showDeleteAccountDialog,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.red,
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                              ),
                              child: Text('delivery.profile.deleteMyAccount'.tr()),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 100), // Bottom padding
                    ],
                  ),
                ),
              ),
            ),
    );
  }

  Widget _buildSectionCard({
    required String title,
    required IconData icon,
    required List<Widget> children,
    required ThemeData theme,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: theme.dividerColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: Colors.orange.shade500),
              const SizedBox(width: 12),
              Text(
                title,
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: theme.colorScheme.onSurface,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          ...children,
        ],
      ),
    );
  }

  Widget _buildFormField({
    required String label,
    required TextEditingController controller,
    required bool enabled,
    required ThemeData theme,
    TextInputType? keyboardType,
    IconData? icon,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: theme.hintColor,
          ),
        ),
        const SizedBox(height: 8),
        if (enabled)
          TextFormField(
            controller: controller,
            keyboardType: keyboardType,
            decoration: InputDecoration(
              prefixIcon: icon != null ? Icon(icon, color: theme.hintColor) : null,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: theme.dividerColor),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: Colors.orange.shade500),
              ),
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please enter $label';
              }
              return null;
            },
          )
        else
          Row(
            children: [
              if (icon != null) ...[
                Icon(icon, size: 18, color: theme.hintColor),
                const SizedBox(width: 8),
              ],
              Text(
                controller.text.isNotEmpty ? controller.text : 'delivery.profile.notProvided'.tr(),
                style: TextStyle(
                  fontSize: 16,
                  color: controller.text.isNotEmpty ? theme.colorScheme.onSurface : theme.hintColor,
                ),
              ),
            ],
          ),
      ],
    );
  }
}
