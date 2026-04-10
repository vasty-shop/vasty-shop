import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../auth/presentation/providers/auth_provider.dart';
import '../../../../../core/network/dio_client.dart';
import '../../../../../core/constants/api_constants.dart';


import 'package:easy_localization/easy_localization.dart';class AccountSettingsPage extends ConsumerStatefulWidget {
  const AccountSettingsPage({super.key});

  @override
  ConsumerState<AccountSettingsPage> createState() => _AccountSettingsPageState();
}

class _AccountSettingsPageState extends ConsumerState<AccountSettingsPage> {
  // Password controllers
  final _currentPasswordController = TextEditingController();
  final _newPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _obscureCurrentPassword = true;
  bool _obscureNewPassword = true;
  bool _obscureConfirmPassword = true;
  bool _isChangingPassword = false;

  // Notification settings
  bool _orderUpdates = true;
  bool _newCustomers = true;
  bool _reviews = true;
  bool _promotions = false;
  bool _newsletter = true;

  // 2FA settings
  bool _twoFactorEnabled = false;
  bool _isEnabling2FA = false;

  final _dioClient = DioClient.instance;

  @override
  void dispose() {
    _currentPasswordController.dispose();
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _changePassword() async {
    if (_currentPasswordController.text.isEmpty ||
        _newPasswordController.text.isEmpty ||
        _confirmPasswordController.text.isEmpty) {
      _showError('accountSettings.fillAllPasswordFields'.tr());
      return;
    }

    if (_newPasswordController.text != _confirmPasswordController.text) {
      _showError('accountSettings.passwordsDoNotMatch'.tr());
      return;
    }

    if (_newPasswordController.text.length < 6) {
      _showError('accountSettings.passwordMinLength'.tr());
      return;
    }

    setState(() => _isChangingPassword = true);

    try {
      await _dioClient.post(
        ApiConstants.changePassword,
        data: {
          'currentPassword': _currentPasswordController.text,
          'newPassword': _newPasswordController.text,
        },
      );

      if (mounted) {
        _currentPasswordController.clear();
        _newPasswordController.clear();
        _confirmPasswordController.clear();

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('accountSettings.passwordChangedSuccessfully'.tr()),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        _showError(e.toString());
      }
    } finally {
      if (mounted) {
        setState(() => _isChangingPassword = false);
      }
    }
  }

  Future<void> _updateNotificationSettings() async {
    try {
      // TODO: Implement notification settings update API call
      await Future.delayed(const Duration(seconds: 1));

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('accountSettings.notificationUpdated'.tr()),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        _showError(e.toString());
      }
    }
  }

  Future<void> _enable2FA() async {
    setState(() => _isEnabling2FA = true);

    try {
      // TODO: Implement 2FA enable/disable API call
      await Future.delayed(const Duration(seconds: 1));

      if (mounted) {
        setState(() => _twoFactorEnabled = !_twoFactorEnabled);

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(_twoFactorEnabled
                ? 'accountSettings.twoFactorEnabled'.tr()
                : 'accountSettings.twoFactorDisabled'.tr()),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        _showError(e.toString());
      }
    } finally {
      if (mounted) {
        setState(() => _isEnabling2FA = false);
      }
    }
  }

  Future<void> _deleteAccount() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('accountSettings.deleteAccount'.tr()),
        content: Text('accountSettings.deleteAccountWarning'.tr()),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text('common.cancel'.tr()),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: Text('common.delete'.tr(),
              style: const TextStyle(color: Colors.red),
            ),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        // TODO: Implement account deletion API call
        await Future.delayed(const Duration(seconds: 1));

        if (mounted) {
          final navigator = Navigator.of(context);
          await ref.read(authProvider.notifier).logout();
          navigator.pushNamedAndRemoveUntil('/', (route) => false);
        }
      } catch (e) {
        if (mounted) {
          _showError(e.toString());
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

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final user = ref.watch(authProvider).user;

    return Scaffold(
      appBar: AppBar(
        title: Text('accountSettings.title'.tr()),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Profile Section
          _buildSection(
            title: 'accountSettings.profileInformation'.tr(),
            children: [
              ListTile(
                leading: CircleAvatar(
                  backgroundColor: theme.colorScheme.primary.withValues(alpha: 0.1),
                  child: Text(
                    user?.initials ?? 'U',
                    style: TextStyle(
                      color: theme.colorScheme.primary,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                title: Text(user?.name ?? 'accountSettings.user'.tr()),
                subtitle: Text(user?.email ?? ''),
                trailing: TextButton(
                  onPressed: () {
                    // TODO: Navigate to profile edit
                  },
                  child: Text('common.edit'.tr()),
                ),
              ),
            ],
          ),

          const SizedBox(height: 24),

          // Change Password Section
          _buildSection(
            title: 'accountSettings.changePassword'.tr(),
            children: [
              _buildPasswordField(
                controller: _currentPasswordController,
                label: 'accountSettings.currentPassword'.tr(),
                obscureText: _obscureCurrentPassword,
                onToggleVisibility: () {
                  setState(() => _obscureCurrentPassword = !_obscureCurrentPassword);
                },
              ),
              const SizedBox(height: 12),
              _buildPasswordField(
                controller: _newPasswordController,
                label: 'accountSettings.newPassword'.tr(),
                obscureText: _obscureNewPassword,
                onToggleVisibility: () {
                  setState(() => _obscureNewPassword = !_obscureNewPassword);
                },
              ),
              const SizedBox(height: 12),
              _buildPasswordField(
                controller: _confirmPasswordController,
                label: 'accountSettings.confirmNewPassword'.tr(),
                obscureText: _obscureConfirmPassword,
                onToggleVisibility: () {
                  setState(() => _obscureConfirmPassword = !_obscureConfirmPassword);
                },
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isChangingPassword ? null : _changePassword,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: theme.colorScheme.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: _isChangingPassword
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        )
                      : Text('profile.changePassword'.tr()),
                ),
              ),
            ],
          ),

          const SizedBox(height: 24),

          // Two-Factor Authentication Section
          _buildSection(
            title: 'accountSettings.twoFactorAuth'.tr(),
            children: [
              SwitchListTile(
                value: _twoFactorEnabled,
                onChanged: _isEnabling2FA ? null : (_) => _enable2FA(),
                title: Text('accountSettings.enableAuthenticatorApp'.tr()),
                subtitle: Text('accountSettings.authAppSubtitle'.tr()),
                secondary: Icon(
                  _twoFactorEnabled ? Icons.security : Icons.security_outlined,
                  color: theme.colorScheme.primary,
                ),
              ),
            ],
          ),

          const SizedBox(height: 24),

          // Notification Preferences Section
          _buildSection(
            title: 'accountSettings.notificationPreferences'.tr(),
            children: [
              SwitchListTile(
                value: _orderUpdates,
                onChanged: (value) {
                  setState(() => _orderUpdates = value);
                  _updateNotificationSettings();
                },
                title: Text('accountSettings.orderUpdates'.tr()),
                subtitle: Text('accountSettings.orderUpdatesSubtitle'.tr()),
              ),
              const Divider(height: 1),
              SwitchListTile(
                value: _newCustomers,
                onChanged: (value) {
                  setState(() => _newCustomers = value);
                  _updateNotificationSettings();
                },
                title: Text('accountSettings.newCustomers'.tr()),
                subtitle: Text('accountSettings.newCustomersSubtitle'.tr()),
              ),
              const Divider(height: 1),
              SwitchListTile(
                value: _reviews,
                onChanged: (value) {
                  setState(() => _reviews = value);
                  _updateNotificationSettings();
                },
                title: Text('accountSettings.productReviews'.tr()),
                subtitle: Text('accountSettings.productReviewsSubtitle'.tr()),
              ),
              const Divider(height: 1),
              SwitchListTile(
                value: _promotions,
                onChanged: (value) {
                  setState(() => _promotions = value);
                  _updateNotificationSettings();
                },
                title: Text('accountSettings.promotions'.tr()),
                subtitle: Text('accountSettings.promotionsSubtitle'.tr()),
              ),
              const Divider(height: 1),
              SwitchListTile(
                value: _newsletter,
                onChanged: (value) {
                  setState(() => _newsletter = value);
                  _updateNotificationSettings();
                },
                title: Text('accountSettings.newsletter'.tr()),
                subtitle: Text('accountSettings.newsletterSubtitle'.tr()),
              ),
            ],
          ),

          const SizedBox(height: 24),

          // Danger Zone Section
          _buildSection(
            title: 'accountSettings.dangerZone'.tr(),
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.red.shade200),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.warning_amber, color: Colors.red.shade700),
                        const SizedBox(width: 8),
                        Text(
                          'accountSettings.deleteAccount'.tr(),
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.red.shade700,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'accountSettings.deleteAccountMessage'.tr(),
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.red.shade900,
                      ),
                    ),
                    const SizedBox(height: 12),
                    OutlinedButton(
                      onPressed: _deleteAccount,
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.red.shade700,
                        side: BorderSide(color: Colors.red.shade700),
                      ),
                      child: Text('accountSettings.deleteMyAccount'.tr()),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildSection({
    required String title,
    required List<Widget> children,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              children: children,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildPasswordField({
    required TextEditingController controller,
    required String label,
    required bool obscureText,
    required VoidCallback onToggleVisibility,
  }) {
    return TextFormField(
      controller: controller,
      obscureText: obscureText,
      decoration: InputDecoration(
        labelText: label,
        border: const OutlineInputBorder(),
        suffixIcon: IconButton(
          icon: Icon(
            obscureText ? Icons.visibility_outlined : Icons.visibility_off_outlined,
          ),
          onPressed: onToggleVisibility,
        ),
      ),
    );
  }
}
