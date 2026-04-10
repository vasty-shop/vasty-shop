import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../../auth/presentation/providers/auth_provider.dart';
import '../../../../auth/presentation/pages/login_page.dart';
import '../../../../../core/config/mobile_config_service.dart';
import '../../../../../core/providers/theme_provider.dart';

class SettingsPage extends ConsumerStatefulWidget {
  const SettingsPage({super.key});

  @override
  ConsumerState<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends ConsumerState<SettingsPage> {
  bool _emailNotifications = true;
  bool _pushNotifications = true;
  bool _orderUpdates = true;
  bool _promotions = false;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final user = ref.watch(authProvider).user;
    final currentLocale = context.locale;
    final currentThemeMode = ref.watch(themeModeProvider);

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text(
          'settings.settings'.tr(),
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.black87,
          ),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Account Settings
          _buildSection(
            'profile.personalInfo'.tr(),
            [
              _buildListTile(
                icon: Icons.person_outline,
                title: 'common.profile'.tr(),
                subtitle: user?.email ?? '',
                onTap: () {
                  // Navigate to profile - already handled in drawer
                  Navigator.pop(context);
                },
              ),
              _buildListTile(
                icon: Icons.lock_outline,
                title: 'profile.changePassword'.tr(),
                onTap: () => _showChangePasswordDialog(),
              ),
              _buildListTile(
                icon: Icons.security,
                title: 'settings.twoFactorAuth'.tr(),
                trailing: Switch(
                  value: false,
                  onChanged: (value) {
                    // TODO: Implement 2FA
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('messages.comingSoon'.tr())),
                    );
                  },
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Notifications
          _buildSection(
            'settings.notifications'.tr(),
            [
              _buildListTile(
                icon: Icons.notifications_outlined,
                title: 'settings.pushNotifications'.tr(),
                trailing: Switch(
                  value: _pushNotifications,
                  onChanged: (value) {
                    setState(() => _pushNotifications = value);
                    _saveSettings();
                  },
                ),
              ),
              _buildListTile(
                icon: Icons.email_outlined,
                title: 'settings.emailNotifications'.tr(),
                trailing: Switch(
                  value: _emailNotifications,
                  onChanged: (value) {
                    setState(() => _emailNotifications = value);
                    _saveSettings();
                  },
                ),
              ),
              if (_emailNotifications) ...[
                Padding(
                  padding: const EdgeInsets.only(left: 56),
                  child: Column(
                    children: [
                      _buildSwitchTile(
                        'settings.orderUpdates'.tr(),
                        _orderUpdates,
                        (value) => setState(() => _orderUpdates = value),
                      ),
                      _buildSwitchTile(
                        'settings.promotions'.tr(),
                        _promotions,
                        (value) => setState(() => _promotions = value),
                      ),
                    ],
                  ),
                ),
              ],
            ],
          ),
          const SizedBox(height: 16),

          // Appearance
          _buildSection(
            'settings.appearance'.tr(),
            [
              _buildListTile(
                icon: Icons.refresh,
                title: 'settings.refreshTheme'.tr(),
                subtitle: 'settings.syncDesign'.tr(),
                onTap: () => _refreshTheme(),
              ),
              _buildListTile(
                icon: Icons.palette_outlined,
                title: 'settings.theme'.tr(),
                subtitle: _getThemeLabel(currentThemeMode),
                onTap: () => _showThemeDialog(currentThemeMode),
              ),
              _buildListTile(
                icon: Icons.language,
                title: 'settings.language'.tr(),
                subtitle: _getLanguageLabel(currentLocale.languageCode),
                onTap: () => _showLanguageDialog(currentLocale.languageCode),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Privacy
          _buildSection(
            'settings.privacy'.tr(),
            [
              _buildListTile(
                icon: Icons.privacy_tip_outlined,
                title: 'common.privacyPolicy'.tr(),
                onTap: () {
                  // TODO: Navigate to privacy policy
                },
              ),
              _buildListTile(
                icon: Icons.description_outlined,
                title: 'settings.terms'.tr(),
                onTap: () {
                  // TODO: Navigate to terms
                },
              ),
              _buildListTile(
                icon: Icons.download_outlined,
                title: 'settings.downloadData'.tr(),
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('messages.dataExportEmail'.tr()),
                    ),
                  );
                },
              ),
            ],
          ),
          const SizedBox(height: 16),

          // About
          _buildSection(
            'settings.about'.tr(),
            [
              _buildListTile(
                icon: Icons.info_outline,
                title: 'settings.appVersion'.tr(),
                subtitle: '1.0.0',
              ),
              _buildListTile(
                icon: Icons.help_outline,
                title: 'settings.help'.tr(),
                onTap: () {
                  // TODO: Navigate to support
                },
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Danger Zone
          _buildSection(
            'settings.dangerZone'.tr(),
            [
              _buildListTile(
                icon: Icons.delete_forever,
                title: 'settings.deleteAccount'.tr(),
                titleColor: Colors.red,
                onTap: () => _showDeleteAccountDialog(),
              ),
            ],
          ),
          const SizedBox(height: 32),

          // Logout Button
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: () => _logout(),
              icon: const Icon(Icons.logout, color: Colors.red),
              label: Text(
                'auth.logout'.tr(),
                style: const TextStyle(color: Colors.red),
              ),
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                side: const BorderSide(color: Colors.red),
              ),
            ),
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildSection(String title, List<Widget> children) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Text(
              title,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: Colors.grey,
              ),
            ),
          ),
          ...children,
        ],
      ),
    );
  }

  Widget _buildListTile({
    required IconData icon,
    required String title,
    String? subtitle,
    Widget? trailing,
    VoidCallback? onTap,
    Color? titleColor,
  }) {
    return ListTile(
      leading: Icon(icon, color: titleColor ?? Colors.grey.shade700),
      title: Text(
        title,
        style: TextStyle(
          fontSize: 16,
          color: titleColor,
        ),
      ),
      subtitle: subtitle != null
          ? Text(
              subtitle,
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey.shade600,
              ),
            )
          : null,
      trailing: trailing ?? (onTap != null ? const Icon(Icons.chevron_right) : null),
      onTap: onTap,
    );
  }

  Widget _buildSwitchTile(String title, bool value, ValueChanged<bool> onChanged) {
    return SwitchListTile(
      title: Text(title),
      value: value,
      onChanged: onChanged,
      contentPadding: EdgeInsets.zero,
    );
  }

  void _saveSettings() {
    // TODO: Save to backend
    debugPrint('Saving settings...');
  }

  Future<void> _refreshTheme() async {
    // Show loading indicator
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(
        child: CircularProgressIndicator(),
      ),
    );

    try {
      // Invalidate and refresh the mobile config provider
      ref.invalidate(mobileConfigProvider);

      // Wait a bit for the config to reload
      await Future.delayed(const Duration(milliseconds: 500));

      if (mounted) {
        Navigator.pop(context); // Close loading dialog

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('messages.themeRefreshed'.tr()),
            backgroundColor: Colors.green,
            duration: const Duration(seconds: 2),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        Navigator.pop(context); // Close loading dialog

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${'errors.somethingWentWrong'.tr()}: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  String _getThemeLabel(ThemeMode theme) {
    switch (theme) {
      case ThemeMode.light:
        return 'settings.light'.tr();
      case ThemeMode.dark:
        return 'settings.dark'.tr();
      case ThemeMode.system:
        return 'settings.system'.tr();
    }
  }

  String _getLanguageLabel(String lang) {
    switch (lang) {
      case 'en':
        return 'English';
      case 'es':
        return 'Español (Spanish)';
      case 'fr':
        return 'Français (French)';
      case 'de':
        return 'Deutsch (German)';
      case 'it':
        return 'Italiano (Italian)';
      case 'pt':
        return 'Português (Portuguese)';
      case 'ar':
        return 'العربية (Arabic)';
      case 'zh':
        return '中文 (Chinese)';
      case 'ja':
        return '日本語 (Japanese)';
      case 'ko':
        return '한국어 (Korean)';
      case 'hi':
        return 'हिन्दी (Hindi)';
      case 'bn':
        return 'বাংলা (Bengali)';
      case 'ru':
        return 'Русский (Russian)';
      case 'tr':
        return 'Türkçe (Turkish)';
      default:
        return 'English';
    }
  }

  void _showThemeDialog(ThemeMode currentThemeMode) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('settings.selectTheme'.tr()),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            RadioListTile<ThemeMode>(
              title: Text('settings.light'.tr()),
              value: ThemeMode.light,
              groupValue: currentThemeMode,
              onChanged: (value) {
                if (value != null) {
                  ref.read(themeModeProvider.notifier).setThemeMode(value);
                  Navigator.pop(context);
                }
              },
            ),
            RadioListTile<ThemeMode>(
              title: Text('settings.dark'.tr()),
              value: ThemeMode.dark,
              groupValue: currentThemeMode,
              onChanged: (value) {
                if (value != null) {
                  ref.read(themeModeProvider.notifier).setThemeMode(value);
                  Navigator.pop(context);
                }
              },
            ),
            RadioListTile<ThemeMode>(
              title: Text('settings.system'.tr()),
              value: ThemeMode.system,
              groupValue: currentThemeMode,
              onChanged: (value) {
                if (value != null) {
                  ref.read(themeModeProvider.notifier).setThemeMode(value);
                  Navigator.pop(context);
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  void _showLanguageDialog(String currentLanguage) {
    final supportedLanguages = [
      'en',
      'es',
      'fr',
      'de',
      'it',
      'pt',
      'ar',
      'zh',
      'ja',
      'ko',
      'hi',
      'bn',
      'ru',
      'tr',
    ];

    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: Text('settings.selectLanguage'.tr()),
        content: SizedBox(
          width: double.maxFinite,
          child: ListView(
            shrinkWrap: true,
            children: supportedLanguages.map((langCode) {
              return RadioListTile<String>(
                title: Text(_getLanguageLabel(langCode)),
                value: langCode,
                groupValue: currentLanguage,
                onChanged: (value) async {
                  if (value != null) {
                    final navigator = Navigator.of(dialogContext);
                    final messenger = ScaffoldMessenger.of(context);

                    // Mark that user manually selected a locale
                    final prefs = await SharedPreferences.getInstance();
                    await prefs.setBool('user_selected_locale', true);

                    await dialogContext.setLocale(Locale(value));

                    if (mounted) {
                      navigator.pop();
                      messenger.showSnackBar(
                        SnackBar(
                          content: Text('messages.languageChanged'.tr()),
                          duration: const Duration(seconds: 2),
                        ),
                      );
                    }
                  }
                },
              );
            }).toList(),
          ),
        ),
      ),
    );
  }

  void _showChangePasswordDialog() {
    final currentPasswordController = TextEditingController();
    final newPasswordController = TextEditingController();
    final confirmPasswordController = TextEditingController();
    final formKey = GlobalKey<FormState>();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('profile.changePassword'.tr()),
        content: Form(
          key: formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(
                controller: currentPasswordController,
                decoration: InputDecoration(
                  labelText: 'profile.oldPassword'.tr(),
                  border: const OutlineInputBorder(),
                ),
                obscureText: true,
                validator: (value) =>
                    value == null || value.isEmpty ? 'validation.required'.tr() : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: newPasswordController,
                decoration: InputDecoration(
                  labelText: 'profile.newPassword'.tr(),
                  border: const OutlineInputBorder(),
                ),
                obscureText: true,
                validator: (value) {
                  if (value == null || value.isEmpty) return 'validation.required'.tr();
                  if (value.length < 6) return 'validation.passwordMin6'.tr();
                  return null;
                },
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: confirmPasswordController,
                decoration: InputDecoration(
                  labelText: 'auth.confirmPassword'.tr(),
                  border: const OutlineInputBorder(),
                ),
                obscureText: true,
                validator: (value) {
                  if (value != newPasswordController.text) {
                    return 'validation.passwordsDoNotMatch'.tr();
                  }
                  return null;
                },
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
            onPressed: () {
              if (formKey.currentState!.validate()) {
                // TODO: Call change password API
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('messages.passwordChanged'.tr())),
                );
              }
            },
            child: Text('common.save'.tr()),
          ),
        ],
      ),
    );
  }

  void _showDeleteAccountDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('settings.deleteAccount'.tr()),
        content: Text('settings.deleteAccountWarning'.tr()),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('common.cancel'.tr()),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
            ),
            onPressed: () {
              // TODO: Call delete account API
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('messages.accountDeletionRequested'.tr())),
              );
            },
            child: Text('common.delete'.tr()),
          ),
        ],
      ),
    );
  }

  Future<void> _logout() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('auth.logout'.tr()),
        content: Text('messages.confirmLogout'.tr()),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text('common.cancel'.tr()),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            child: Text('auth.logout'.tr()),
          ),
        ],
      ),
    );

    if (confirm == true) {
      await ref.read(authProvider.notifier).logout();
      if (mounted) {
        Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(builder: (_) => const LoginPage()),
          (route) => false,
        );
      }
    }
  }
}
