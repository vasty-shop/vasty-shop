import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../../auth/presentation/providers/auth_provider.dart';
import '../../../../auth/presentation/pages/login_page.dart';
import '../../../../../core/localization/locale_provider.dart';
import 'package:easy_localization/easy_localization.dart';

// Keys for storing settings in SharedPreferences
class _SettingsKeys {
  static const autoAcceptOrders = 'delivery_auto_accept_orders';
  static const notificationsEnabled = 'delivery_notifications_enabled';
  static const soundEnabled = 'delivery_sound_enabled';
  static const vibrationEnabled = 'delivery_vibration_enabled';
  static const maxConcurrentOrders = 'delivery_max_concurrent_orders';
  static const workingHoursStart = 'delivery_working_hours_start';
  static const workingHoursEnd = 'delivery_working_hours_end';
}

class DeliverySettingsPage extends ConsumerStatefulWidget {
  const DeliverySettingsPage({super.key});

  @override
  ConsumerState<DeliverySettingsPage> createState() => _DeliverySettingsPageState();
}

class _DeliverySettingsPageState extends ConsumerState<DeliverySettingsPage> {
  bool _isLoading = false;
  bool _isSaving = false;
  bool _hasChanges = false;

  // Settings state
  bool _autoAcceptOrders = false;
  bool _notificationsEnabled = true;
  bool _soundEnabled = true;
  bool _vibrationEnabled = true;
  int _maxOrdersPerTime = 3;
  TimeOfDay _workingHoursStart = const TimeOfDay(hour: 9, minute: 0);
  TimeOfDay _workingHoursEnd = const TimeOfDay(hour: 21, minute: 0);

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    setState(() => _isLoading = true);
    try {
      final prefs = await SharedPreferences.getInstance();
      if (mounted) {
        setState(() {
          _autoAcceptOrders = prefs.getBool(_SettingsKeys.autoAcceptOrders) ?? false;
          _notificationsEnabled = prefs.getBool(_SettingsKeys.notificationsEnabled) ?? true;
          _soundEnabled = prefs.getBool(_SettingsKeys.soundEnabled) ?? true;
          _vibrationEnabled = prefs.getBool(_SettingsKeys.vibrationEnabled) ?? true;
          _maxOrdersPerTime = prefs.getInt(_SettingsKeys.maxConcurrentOrders) ?? 3;

          // Parse working hours
          final startTime = prefs.getString(_SettingsKeys.workingHoursStart);
          final endTime = prefs.getString(_SettingsKeys.workingHoursEnd);
          if (startTime != null) {
            final parts = startTime.split(':');
            if (parts.length >= 2) {
              _workingHoursStart = TimeOfDay(
                hour: int.tryParse(parts[0]) ?? 9,
                minute: int.tryParse(parts[1]) ?? 0,
              );
            }
          }
          if (endTime != null) {
            final parts = endTime.split(':');
            if (parts.length >= 2) {
              _workingHoursEnd = TimeOfDay(
                hour: int.tryParse(parts[0]) ?? 21,
                minute: int.tryParse(parts[1]) ?? 0,
              );
            }
          }

          _isLoading = false;
          _hasChanges = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _markChanged() {
    if (!_hasChanges) {
      setState(() => _hasChanges = true);
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
        title: Text(
          'settings.settings'.tr(),
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: theme.appBarTheme.foregroundColor,
          ),
        ),
        actions: [
          if (_hasChanges)
            _isSaving
                ? const Padding(
                    padding: EdgeInsets.all(16),
                    child: SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    ),
                  )
                : IconButton(
                    icon: const Icon(Icons.save),
                    onPressed: _saveSettings,
                  ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadSettings,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // Order Settings
                _buildSectionCard(
                  title: 'delivery.orderSettings'.tr(),
                  icon: Icons.settings,
                  children: [
                    _buildSwitchTile(
                      title: 'delivery.autoAcceptOrders'.tr(),
                      subtitle: 'delivery.autoAcceptOrdersDesc'.tr(),
                      value: _autoAcceptOrders,
                      onChanged: (value) {
                        setState(() => _autoAcceptOrders = value);
                        _markChanged();
                      },
                    ),
                    const Divider(),
                    ListTile(
                      title: Text('delivery.maxConcurrentOrders'.tr()),
                      subtitle: Text('delivery.maxConcurrentOrdersDesc'.tr()),
                      trailing: SizedBox(
                        width: 80,
                        child: DropdownButtonFormField<int>(
                          initialValue: _maxOrdersPerTime,
                          decoration: const InputDecoration(
                            border: OutlineInputBorder(),
                            contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          ),
                          items: [1, 2, 3, 4, 5]
                              .map((n) => DropdownMenuItem(
                                    value: n,
                                    child: Text('$n'),
                                  ))
                              .toList(),
                          onChanged: (value) {
                            setState(() => _maxOrdersPerTime = value!);
                            _markChanged();
                          },
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Notification Settings
                _buildSectionCard(
                  title: 'delivery.notificationSettings'.tr(),
                  icon: Icons.notifications,
                  children: [
                    _buildSwitchTile(
                      title: 'delivery.pushNotifications'.tr(),
                      subtitle: 'delivery.pushNotificationsDesc'.tr(),
                      value: _notificationsEnabled,
                      onChanged: (value) {
                        setState(() => _notificationsEnabled = value);
                        _markChanged();
                      },
                    ),
                    const Divider(),
                    _buildSwitchTile(
                      title: 'delivery.sound'.tr(),
                      subtitle: 'delivery.soundDesc'.tr(),
                      value: _soundEnabled,
                      onChanged: (value) {
                        setState(() => _soundEnabled = value);
                        _markChanged();
                      },
                    ),
                    const Divider(),
                    _buildSwitchTile(
                      title: 'delivery.vibration'.tr(),
                      subtitle: 'delivery.vibrationDesc'.tr(),
                      value: _vibrationEnabled,
                      onChanged: (value) {
                        setState(() => _vibrationEnabled = value);
                        _markChanged();
                      },
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Working Hours
                _buildSectionCard(
                  title: 'delivery.workingHours'.tr(),
                  icon: Icons.schedule,
                  children: [
                    ListTile(
                      title: Text('delivery.startTime'.tr()),
                      subtitle: Text(_formatTime(_workingHoursStart)),
                      trailing: const Icon(Icons.access_time),
                      onTap: () => _selectTime(true),
                    ),
                    const Divider(),
                    ListTile(
                      title: Text('delivery.endTime'.tr()),
                      subtitle: Text(_formatTime(_workingHoursEnd)),
                      trailing: const Icon(Icons.access_time),
                      onTap: () => _selectTime(false),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Language Settings
                _buildSectionCard(
                  title: 'settings.language'.tr(),
                  icon: Icons.language,
                  children: [
                    Consumer(
                      builder: (context, ref, child) {
                        final currentLocale = ref.watch(localeProvider);
                        final supportedLanguages = ref.watch(supportedLanguagesProvider);

                        return ListTile(
                          title: Text('settings.selectLanguage'.tr()),
                          subtitle: Text(_getLanguageName(currentLocale.languageCode)),
                          trailing: const Icon(Icons.chevron_right),
                          onTap: () => _showLanguageSelector(context, ref, currentLocale, supportedLanguages),
                        );
                      },
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Logout
                Card(
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                    side: BorderSide(color: Colors.red.shade100),
                  ),
                  child: ListTile(
                    leading: const Icon(Icons.logout, color: Colors.red),
                    title: Text(
                      'common.logout'.tr(),
                      style: const TextStyle(
                        color: Colors.red,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    trailing: const Icon(Icons.chevron_right, color: Colors.red),
                    onTap: _handleLogout,
                  ),
                ),
                const SizedBox(height: 100), // Bottom padding
              ],
            ),
    );
  }

  Widget _buildSectionCard({
    required String title,
    required IconData icon,
    required List<Widget> children,
  }) {
    final theme = Theme.of(context);
    return Card(
      elevation: 0,
      color: theme.colorScheme.surface,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: theme.dividerColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Icon(icon, color: theme.colorScheme.primary),
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
          ),
          ...children,
        ],
      ),
    );
  }

  Widget _buildSwitchTile({
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    final theme = Theme.of(context);
    return SwitchListTile(
      title: Text(title, style: TextStyle(color: theme.colorScheme.onSurface)),
      subtitle: Text(subtitle, style: TextStyle(fontSize: 12, color: theme.hintColor)),
      value: value,
      onChanged: onChanged,
      activeTrackColor: theme.colorScheme.primary.withValues(alpha: 0.5),
      inactiveTrackColor: theme.disabledColor,
    );
  }

  String _formatTime(TimeOfDay time) {
    final hour = time.hour.toString().padLeft(2, '0');
    final minute = time.minute.toString().padLeft(2, '0');
    return '$hour:$minute';
  }

  Future<void> _selectTime(bool isStart) async {
    final TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: isStart ? _workingHoursStart : _workingHoursEnd,
    );
    if (picked != null) {
      setState(() {
        if (isStart) {
          _workingHoursStart = picked;
        } else {
          _workingHoursEnd = picked;
        }
      });
      _markChanged();
    }
  }

  Future<void> _saveSettings() async {
    setState(() => _isSaving = true);

    try {
      final prefs = await SharedPreferences.getInstance();

      await prefs.setBool(_SettingsKeys.autoAcceptOrders, _autoAcceptOrders);
      await prefs.setBool(_SettingsKeys.notificationsEnabled, _notificationsEnabled);
      await prefs.setBool(_SettingsKeys.soundEnabled, _soundEnabled);
      await prefs.setBool(_SettingsKeys.vibrationEnabled, _vibrationEnabled);
      await prefs.setInt(_SettingsKeys.maxConcurrentOrders, _maxOrdersPerTime);
      await prefs.setString(_SettingsKeys.workingHoursStart, _formatTime(_workingHoursStart));
      await prefs.setString(_SettingsKeys.workingHoursEnd, _formatTime(_workingHoursEnd));

      if (mounted) {
        setState(() {
          _isSaving = false;
          _hasChanges = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('settings.settingsSaved'.tr()),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSaving = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('delivery.errorSavingSettings'.tr()),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  void _handleLogout() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('common.logout'.tr()),
        content: Text('auth.confirmLogout'.tr()),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text('common.cancel'.tr()),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: Text('common.logout'.tr()),
          ),
        ],
      ),
    );

    if (confirmed == true && mounted) {
      await ref.read(authProvider.notifier).logout();
      if (mounted) {
        Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(builder: (_) => const LoginPage()),
          (route) => false,
        );
      }
    }
  }

  String _getLanguageName(String code) {
    final languageNames = {
      'en': 'English',
      'es': 'Español',
      'fr': 'Français',
      'de': 'Deutsch',
      'it': 'Italiano',
      'pt': 'Português',
      'ja': '日本語',
      'ko': '한국어',
      'zh': '中文',
      'ar': 'العربية',
      'hi': 'हिन्दी',
      'bn': 'বাংলা',
    };
    return languageNames[code] ?? code.toUpperCase();
  }

  void _showLanguageSelector(
    BuildContext parentContext,
    WidgetRef ref,
    Locale currentLocale,
    List<String> supportedLanguages,
  ) {
    showModalBottomSheet(
      context: parentContext,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (bottomSheetContext) {
        final sheetTheme = Theme.of(bottomSheetContext);
        return SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Icon(Icons.language, color: sheetTheme.colorScheme.primary),
                  const SizedBox(width: 12),
                  Text(
                    'settings.selectLanguage'.tr(),
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: sheetTheme.colorScheme.onSurface,
                    ),
                  ),
                ],
              ),
            ),
            const Divider(height: 1),
            ...supportedLanguages.map((langCode) {
              final isSelected = currentLocale.languageCode == langCode;
              return ListTile(
                leading: Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: isSelected ? sheetTheme.colorScheme.primary.withValues(alpha: 0.2) : sheetTheme.colorScheme.surfaceContainerHighest,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    langCode.toUpperCase(),
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: isSelected ? sheetTheme.colorScheme.primary : sheetTheme.hintColor,
                    ),
                  ),
                ),
                title: Text(_getLanguageName(langCode), style: TextStyle(color: sheetTheme.colorScheme.onSurface)),
                trailing: isSelected
                    ? Icon(Icons.check_circle, color: sheetTheme.colorScheme.primary)
                    : null,
                onTap: () {
                  Navigator.pop(bottomSheetContext);
                  if (!isSelected) {
                    _changeLanguage(parentContext, ref, langCode);
                  }
                },
              );
            }),
            const SizedBox(height: 16),
          ],
        ),
      );
      },
    );
  }

  Future<void> _changeLanguage(BuildContext _, WidgetRef ref, String langCode) async {
    // Change locale using the provider
    await ref.read(localeProvider.notifier).changeLocale(langCode);

    // Update easy_localization using this widget's context
    if (!mounted) return;

    await context.setLocale(Locale(langCode));

    // Show confirmation
    if (!mounted) return;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('${'settings.languageChanged'.tr()} ${_getLanguageName(langCode)}'),
        backgroundColor: Colors.green,
        duration: const Duration(seconds: 2),
      ),
    );
  }
}
