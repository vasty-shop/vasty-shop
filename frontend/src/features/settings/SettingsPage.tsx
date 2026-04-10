import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Settings,
  Bell,
  Shield,
  Globe,
  Palette,
  Mail,
  Lock,
  Smartphone,
  Download,
  Trash2,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { BreadcrumbNavigation } from '@/components/layout/BreadcrumbNavigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast, ToastContainer } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

interface NotificationSettings {
  email: {
    orderUpdates: boolean;
    promotions: boolean;
    newArrivals: boolean;
    priceDropAlerts: boolean;
    backInStockAlerts: boolean;
    newsletter: boolean;
  };
  sms: {
    orderShipped: boolean;
    deliveryUpdates: boolean;
    securityAlerts: boolean;
  };
  push: boolean;
}

export const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const { toasts, showToast } = useToast();
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light');
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(true);

  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: {
      orderUpdates: true,
      promotions: true,
      newArrivals: false,
      priceDropAlerts: true,
      backInStockAlerts: true,
      newsletter: false,
    },
    sms: {
      orderShipped: true,
      deliveryUpdates: true,
      securityAlerts: true,
    },
    push: true,
  });

  const handleNotificationToggle = (
    category: keyof NotificationSettings,
    setting: string
  ) => {
    if (category === 'push') {
      setNotifications((prev) => ({
        ...prev,
        push: !prev.push,
      }));
    } else {
      setNotifications((prev) => ({
        ...prev,
        [category]: {
          ...(prev[category] as any),
          [setting]: !(prev[category] as any)[setting],
        },
      }));
    }
    showToast({
      title: t('settingsPage.toasts.settingsUpdated', { defaultValue: 'Settings Updated' }),
      description: t('settingsPage.toasts.notificationsSaved', { defaultValue: 'Your notification preferences have been saved.' }),
      variant: 'success',
    });
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    showToast({
      title: t('settingsPage.toasts.passwordChanged', { defaultValue: 'Password Changed' }),
      description: t('settingsPage.toasts.passwordUpdated', { defaultValue: 'Your password has been updated successfully.' }),
      variant: 'success',
    });
  };

  const handleDataDownload = () => {
    showToast({
      title: t('settingsPage.toasts.downloadStarted', { defaultValue: 'Download Started' }),
      description: t('settingsPage.toasts.dataPreparing', { defaultValue: 'Your data is being prepared for download.' }),
      variant: 'success',
    });
  };

  const handleDeleteAccount = () => {
    showToast({
      title: t('settingsPage.toasts.deletionRequested', { defaultValue: 'Account Deletion Requested' }),
      description: t('settingsPage.toasts.deletionProcessing', { defaultValue: 'We will process your request within 24 hours.' }),
      variant: 'warning',
    });
    setIsDeleteAccountOpen(false);
  };

  return (
    <div className="min-h-screen bg-cloud-gradient flex flex-col">
      <Header />
      <ToastContainer toasts={toasts} />

      <div className="container mx-auto px-4 py-6">
        <BreadcrumbNavigation
          items={[
            { label: t('settingsPage.breadcrumb.account', { defaultValue: 'Account' }), href: '/profile' },
            { label: t('settingsPage.breadcrumb.settings', { defaultValue: 'Settings' }) },
          ]}
        />
      </div>

      <div className="flex-1 pb-12">
        <div className="container mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-8 max-w-3xl mx-auto">
              <h1 className="text-3xl font-bold text-text-primary mb-2">{t('settingsPage.title', { defaultValue: 'Settings' })}</h1>
              <p className="text-text-secondary">
                {t('settingsPage.subtitle', { defaultValue: 'Manage your account settings and preferences' })}
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible defaultValue="account">
                {/* Account Settings */}
                <AccordionItem value="account">
                  <AccordionTrigger>
                    <div className="flex items-center gap-3">
                      <Settings className="w-5 h-5 text-accent-blue" />
                      <span className="text-lg font-semibold">{t('settingsPage.account.title', { defaultValue: 'Account Settings' })}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Card className="p-6 space-y-6">
                      {/* Change Email */}
                      <div>
                        <h3 className="font-semibold text-text-primary mb-4">{t('settingsPage.account.changeEmail', { defaultValue: 'Change Email' })}</h3>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="current-email">{t('settingsPage.account.currentEmail', { defaultValue: 'Current Email' })}</Label>
                            <Input
                              id="current-email"
                              type="email"
                              defaultValue="evelyn.flare@example.com"
                              disabled
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label htmlFor="new-email">{t('settingsPage.account.newEmail', { defaultValue: 'New Email' })}</Label>
                            <Input id="new-email" type="email" placeholder={t('settingsPage.account.newEmailPlaceholder', { defaultValue: 'new.email@example.com' })} className="mt-2" />
                          </div>
                          <Button size="sm">{t('settingsPage.account.updateEmail', { defaultValue: 'Update Email' })}</Button>
                        </div>
                      </div>

                      <div className="border-t border-gray-200" />

                      {/* Change Password */}
                      <div>
                        <h3 className="font-semibold text-text-primary mb-4">{t('settingsPage.account.changePassword', { defaultValue: 'Change Password' })}</h3>
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                          <div>
                            <Label htmlFor="current-password">{t('settingsPage.account.currentPassword', { defaultValue: 'Current Password' })}</Label>
                            <Input id="current-password" type="password" className="mt-2" />
                          </div>
                          <div>
                            <Label htmlFor="new-password">{t('settingsPage.account.newPassword', { defaultValue: 'New Password' })}</Label>
                            <Input id="new-password" type="password" className="mt-2" />
                          </div>
                          <div>
                            <Label htmlFor="confirm-password">{t('settingsPage.account.confirmNewPassword', { defaultValue: 'Confirm New Password' })}</Label>
                            <Input id="confirm-password" type="password" className="mt-2" />
                          </div>
                          <Button type="submit" size="sm">
                            {t('settingsPage.account.changePasswordBtn', { defaultValue: 'Change Password' })}
                          </Button>
                        </form>
                      </div>

                      <div className="border-t border-gray-200" />

                      {/* Two-Factor Authentication */}
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-text-primary mb-1">
                              {t('settingsPage.account.twoFactorAuth', { defaultValue: 'Two-Factor Authentication' })}
                            </h3>
                            <p className="text-sm text-text-secondary">
                              {t('settingsPage.account.twoFactorAuthDesc', { defaultValue: 'Add an extra layer of security to your account' })}
                            </p>
                          </div>
                          <Switch
                            checked={isTwoFactorEnabled}
                            onCheckedChange={(checked) => {
                              setIsTwoFactorEnabled(checked);
                              showToast({
                                title: checked ? t('settingsPage.toasts.twoFAEnabled', { defaultValue: '2FA Enabled' }) : t('settingsPage.toasts.twoFADisabled', { defaultValue: '2FA Disabled' }),
                                description: checked
                                  ? t('settingsPage.toasts.twoFAEnabledDesc', { defaultValue: 'Two-factor authentication has been enabled.' })
                                  : t('settingsPage.toasts.twoFADisabledDesc', { defaultValue: 'Two-factor authentication has been disabled.' }),
                                variant: 'success',
                              });
                            }}
                          />
                        </div>
                      </div>

                      <div className="border-t border-gray-200" />

                      {/* Login History */}
                      <div>
                        <h3 className="font-semibold text-text-primary mb-4">{t('settingsPage.account.loginHistory', { defaultValue: 'Login History' })}</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-button">
                            <div>
                              <p className="text-sm font-medium text-text-primary">
                                {t('settingsPage.account.chromeOnWindows', { defaultValue: 'Chrome on Windows' })}
                              </p>
                              <p className="text-xs text-text-secondary">
                                {t('settingsPage.account.loginLocation1', { defaultValue: 'New York, NY • Today at 10:30 AM' })}
                              </p>
                            </div>
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                              {t('settingsPage.account.current', { defaultValue: 'Current' })}
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-button">
                            <div>
                              <p className="text-sm font-medium text-text-primary">
                                {t('settingsPage.account.safariOnIphone', { defaultValue: 'Safari on iPhone' })}
                              </p>
                              <p className="text-xs text-text-secondary">
                                {t('settingsPage.account.loginLocation2', { defaultValue: 'New York, NY • Yesterday at 6:15 PM' })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-gray-200" />

                      {/* Active Sessions */}
                      <div>
                        <h3 className="font-semibold text-text-primary mb-4">{t('settingsPage.account.activeSessions', { defaultValue: 'Active Sessions' })}</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-button">
                            <div>
                              <p className="text-sm font-medium text-text-primary">
                                {t('settingsPage.account.chromeOnWindows', { defaultValue: 'Chrome on Windows' })}
                              </p>
                              <p className="text-xs text-text-secondary">{t('settingsPage.account.lastActiveNow', { defaultValue: 'Last active: Just now' })}</p>
                            </div>
                            <Button variant="outline" size="sm">
                              {t('settingsPage.account.revoke', { defaultValue: 'Revoke' })}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </AccordionContent>
                </AccordionItem>

                {/* Notification Preferences */}
                <AccordionItem value="notifications">
                  <AccordionTrigger>
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-accent-blue" />
                      <span className="text-lg font-semibold">{t('settingsPage.notifications.title', { defaultValue: 'Notification Preferences' })}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Card className="p-6 space-y-6">
                      {/* Email Notifications */}
                      <div>
                        <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                          <Mail className="w-5 h-5" />
                          {t('settingsPage.notifications.emailNotifications', { defaultValue: 'Email Notifications' })}
                        </h3>
                        <div className="space-y-3">
                          {Object.entries(notifications.email).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-button">
                              <Label htmlFor={`email-${key}`} className="cursor-pointer">
                                {t(`settingsPage.notifications.email.${key}`, { defaultValue: key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()) })}
                              </Label>
                              <Switch
                                id={`email-${key}`}
                                checked={value}
                                onCheckedChange={() => handleNotificationToggle('email', key)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-gray-200" />

                      {/* SMS Notifications */}
                      <div>
                        <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                          <Smartphone className="w-5 h-5" />
                          {t('settingsPage.notifications.smsNotifications', { defaultValue: 'SMS Notifications' })}
                        </h3>
                        <div className="space-y-3">
                          {Object.entries(notifications.sms).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-button">
                              <Label htmlFor={`sms-${key}`} className="cursor-pointer">
                                {t(`settingsPage.notifications.sms.${key}`, { defaultValue: key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()) })}
                              </Label>
                              <Switch
                                id={`sms-${key}`}
                                checked={value}
                                onCheckedChange={() => handleNotificationToggle('sms', key)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-gray-200" />

                      {/* Push Notifications */}
                      <div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-button">
                          <div className="flex-1">
                            <h3 className="font-semibold text-text-primary mb-1">
                              {t('settingsPage.notifications.pushNotifications', { defaultValue: 'Push Notifications' })}
                            </h3>
                            <p className="text-sm text-text-secondary">
                              {t('settingsPage.notifications.pushNotificationsDesc', { defaultValue: 'Receive notifications in your browser' })}
                            </p>
                          </div>
                          <Switch
                            checked={notifications.push}
                            onCheckedChange={() => handleNotificationToggle('push', '')}
                          />
                        </div>
                      </div>
                    </Card>
                  </AccordionContent>
                </AccordionItem>

                {/* Privacy Settings */}
                <AccordionItem value="privacy">
                  <AccordionTrigger>
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-accent-blue" />
                      <span className="text-lg font-semibold">{t('settingsPage.privacy.title', { defaultValue: 'Privacy Settings' })}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Card className="p-6 space-y-6">
                      {/* Profile Visibility */}
                      <div>
                        <h3 className="font-semibold text-text-primary mb-4">{t('settingsPage.privacy.profileVisibility', { defaultValue: 'Profile Visibility' })}</h3>
                        <div className="space-y-3">
                          <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-button cursor-pointer hover:border-primary-lime transition-colors">
                            <input type="radio" name="visibility" defaultChecked />
                            <div>
                              <p className="font-medium text-text-primary">{t('settingsPage.privacy.public', { defaultValue: 'Public' })}</p>
                              <p className="text-sm text-text-secondary">
                                {t('settingsPage.privacy.publicDesc', { defaultValue: 'Anyone can view your profile' })}
                              </p>
                            </div>
                          </label>
                          <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-button cursor-pointer hover:border-primary-lime transition-colors">
                            <input type="radio" name="visibility" />
                            <div>
                              <p className="font-medium text-text-primary">{t('settingsPage.privacy.private', { defaultValue: 'Private' })}</p>
                              <p className="text-sm text-text-secondary">
                                {t('settingsPage.privacy.privateDesc', { defaultValue: 'Only you can view your profile' })}
                              </p>
                            </div>
                          </label>
                        </div>
                      </div>

                      <div className="border-t border-gray-200" />

                      {/* Data Sharing */}
                      <div>
                        <h3 className="font-semibold text-text-primary mb-4">
                          {t('settingsPage.privacy.dataSharingPreferences', { defaultValue: 'Data Sharing Preferences' })}
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="analytics" className="cursor-pointer">
                              {t('settingsPage.privacy.shareAnalytics', { defaultValue: 'Share analytics data' })}
                            </Label>
                            <Switch id="analytics" defaultChecked />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="personalization" className="cursor-pointer">
                              {t('settingsPage.privacy.allowPersonalization', { defaultValue: 'Allow personalized recommendations' })}
                            </Label>
                            <Switch id="personalization" defaultChecked />
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-gray-200" />

                      {/* Cookie Preferences */}
                      <div>
                        <h3 className="font-semibold text-text-primary mb-4">{t('settingsPage.privacy.cookiePreferences', { defaultValue: 'Cookie Preferences' })}</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label className="cursor-pointer">
                              <span className="font-medium">{t('settingsPage.privacy.essentialCookies', { defaultValue: 'Essential Cookies' })}</span>
                              <p className="text-sm text-text-secondary">
                                {t('settingsPage.privacy.essentialCookiesDesc', { defaultValue: 'Required for the website to function' })}
                              </p>
                            </Label>
                            <Switch checked disabled />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="analytics-cookies" className="cursor-pointer">
                              <span className="font-medium">{t('settingsPage.privacy.analyticsCookies', { defaultValue: 'Analytics Cookies' })}</span>
                              <p className="text-sm text-text-secondary">
                                {t('settingsPage.privacy.analyticsCookiesDesc', { defaultValue: 'Help us improve the website' })}
                              </p>
                            </Label>
                            <Switch id="analytics-cookies" defaultChecked />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="marketing-cookies" className="cursor-pointer">
                              <span className="font-medium">{t('settingsPage.privacy.marketingCookies', { defaultValue: 'Marketing Cookies' })}</span>
                              <p className="text-sm text-text-secondary">
                                {t('settingsPage.privacy.marketingCookiesDesc', { defaultValue: 'Used for personalized ads' })}
                              </p>
                            </Label>
                            <Switch id="marketing-cookies" defaultChecked />
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-gray-200" />

                      {/* Download Data */}
                      <div>
                        <h3 className="font-semibold text-text-primary mb-4">{t('settingsPage.privacy.downloadMyData', { defaultValue: 'Download My Data' })}</h3>
                        <p className="text-sm text-text-secondary mb-4">
                          {t('settingsPage.privacy.downloadDataDesc', { defaultValue: 'Request a copy of your personal data in compliance with GDPR' })}
                        </p>
                        <Button variant="outline" onClick={handleDataDownload}>
                          <Download className="w-4 h-4 mr-2" />
                          {t('settingsPage.privacy.downloadData', { defaultValue: 'Download Data' })}
                        </Button>
                      </div>

                      <div className="border-t border-gray-200" />

                      {/* Delete Account */}
                      <div>
                        <h3 className="font-semibold text-text-primary mb-4 text-red-600">
                          {t('settingsPage.privacy.deleteAccount', { defaultValue: 'Delete Account' })}
                        </h3>
                        <p className="text-sm text-text-secondary mb-4">
                          {t('settingsPage.privacy.deleteAccountDesc', { defaultValue: 'Permanently delete your account and all associated data. This action cannot be undone.' })}
                        </p>
                        <Dialog open={isDeleteAccountOpen} onOpenChange={setIsDeleteAccountOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
                              <Trash2 className="w-4 h-4 mr-2" />
                              {t('settingsPage.privacy.deleteAccount', { defaultValue: 'Delete Account' })}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{t('settingsPage.privacy.deleteAccount', { defaultValue: 'Delete Account' })}</DialogTitle>
                              <DialogDescription>
                                {t('settingsPage.privacy.deleteConfirmation', { defaultValue: 'Are you sure you want to delete your account? This action is permanent and cannot be undone. All your data, orders, and preferences will be permanently deleted.' })}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                              <Label htmlFor="confirm-delete">
                                {t('settingsPage.privacy.typeDeleteToConfirm', { defaultValue: 'Type "DELETE" to confirm' })}
                              </Label>
                              <Input id="confirm-delete" placeholder="DELETE" className="mt-2" />
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsDeleteAccountOpen(false)}>
                                {t('common.cancel', { defaultValue: 'Cancel' })}
                              </Button>
                              <Button
                                variant="outline"
                                className="border-red-600 text-red-600 hover:bg-red-50"
                                onClick={handleDeleteAccount}
                              >
                                {t('settingsPage.privacy.deleteAccount', { defaultValue: 'Delete Account' })}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </Card>
                  </AccordionContent>
                </AccordionItem>

                {/* Language & Region */}
                <AccordionItem value="language">
                  <AccordionTrigger>
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-accent-blue" />
                      <span className="text-lg font-semibold">{t('settingsPage.languageRegion.title', { defaultValue: 'Language & Region' })}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Card className="p-6 space-y-6">
                      {/* Language */}
                      <div>
                        <Label htmlFor="language">{t('settingsPage.languageRegion.language', { defaultValue: 'Language' })}</Label>
                        <select
                          id="language"
                          className="flex h-12 w-full rounded-button border border-input bg-white px-4 py-3 text-sm mt-2"
                        >
                          <option value="en">{t('settingsPage.languageRegion.languages.english', { defaultValue: 'English' })}</option>
                          <option value="es">{t('settingsPage.languageRegion.languages.spanish', { defaultValue: 'Spanish' })}</option>
                          <option value="fr">{t('settingsPage.languageRegion.languages.french', { defaultValue: 'French' })}</option>
                          <option value="de">{t('settingsPage.languageRegion.languages.german', { defaultValue: 'German' })}</option>
                          <option value="it">{t('settingsPage.languageRegion.languages.italian', { defaultValue: 'Italian' })}</option>
                          <option value="pt">{t('settingsPage.languageRegion.languages.portuguese', { defaultValue: 'Portuguese' })}</option>
                        </select>
                      </div>

                      {/* Currency */}
                      <div>
                        <Label htmlFor="currency">{t('settingsPage.languageRegion.currency', { defaultValue: 'Currency' })}</Label>
                        <select
                          id="currency"
                          className="flex h-12 w-full rounded-button border border-input bg-white px-4 py-3 text-sm mt-2"
                        >
                          <option value="usd">USD ($)</option>
                          <option value="eur">EUR (€)</option>
                          <option value="gbp">GBP (£)</option>
                          <option value="jpy">JPY (¥)</option>
                          <option value="cad">CAD ($)</option>
                          <option value="aud">AUD ($)</option>
                        </select>
                      </div>

                      {/* Time Zone */}
                      <div>
                        <Label htmlFor="timezone">{t('settingsPage.languageRegion.timeZone', { defaultValue: 'Time Zone' })}</Label>
                        <select
                          id="timezone"
                          className="flex h-12 w-full rounded-button border border-input bg-white px-4 py-3 text-sm mt-2"
                        >
                          <option value="est">{t('settingsPage.languageRegion.timezones.eastern', { defaultValue: 'Eastern Time (ET)' })}</option>
                          <option value="cst">{t('settingsPage.languageRegion.timezones.central', { defaultValue: 'Central Time (CT)' })}</option>
                          <option value="mst">{t('settingsPage.languageRegion.timezones.mountain', { defaultValue: 'Mountain Time (MT)' })}</option>
                          <option value="pst">{t('settingsPage.languageRegion.timezones.pacific', { defaultValue: 'Pacific Time (PT)' })}</option>
                          <option value="utc">UTC</option>
                        </select>
                      </div>

                      {/* Date Format */}
                      <div>
                        <Label htmlFor="date-format">{t('settingsPage.languageRegion.dateFormat', { defaultValue: 'Date Format' })}</Label>
                        <select
                          id="date-format"
                          className="flex h-12 w-full rounded-button border border-input bg-white px-4 py-3 text-sm mt-2"
                        >
                          <option value="mm-dd-yyyy">MM/DD/YYYY</option>
                          <option value="dd-mm-yyyy">DD/MM/YYYY</option>
                          <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                        </select>
                      </div>

                      <Button>{t('common.saveChanges', { defaultValue: 'Save Changes' })}</Button>
                    </Card>
                  </AccordionContent>
                </AccordionItem>

                {/* Appearance */}
                <AccordionItem value="appearance">
                  <AccordionTrigger>
                    <div className="flex items-center gap-3">
                      <Palette className="w-5 h-5 text-accent-blue" />
                      <span className="text-lg font-semibold">{t('settingsPage.appearance.title', { defaultValue: 'Appearance' })}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Card className="p-6 space-y-6">
                      {/* Theme */}
                      <div>
                        <h3 className="font-semibold text-text-primary mb-4">{t('settingsPage.appearance.theme', { defaultValue: 'Theme' })}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <button
                            onClick={() => setTheme('light')}
                            className={cn(
                              'p-4 border-2 rounded-button transition-all',
                              theme === 'light'
                                ? 'border-primary-lime bg-primary-lime/5'
                                : 'border-gray-200 hover:border-gray-300'
                            )}
                          >
                            <Sun className="w-8 h-8 mx-auto mb-2 text-accent-blue" />
                            <p className="font-medium text-text-primary">{t('settingsPage.appearance.light', { defaultValue: 'Light' })}</p>
                          </button>
                          <button
                            onClick={() => setTheme('dark')}
                            className={cn(
                              'p-4 border-2 rounded-button transition-all',
                              theme === 'dark'
                                ? 'border-primary-lime bg-primary-lime/5'
                                : 'border-gray-200 hover:border-gray-300'
                            )}
                          >
                            <Moon className="w-8 h-8 mx-auto mb-2 text-accent-blue" />
                            <p className="font-medium text-text-primary">{t('settingsPage.appearance.dark', { defaultValue: 'Dark' })}</p>
                          </button>
                          <button
                            onClick={() => setTheme('auto')}
                            className={cn(
                              'p-4 border-2 rounded-button transition-all',
                              theme === 'auto'
                                ? 'border-primary-lime bg-primary-lime/5'
                                : 'border-gray-200 hover:border-gray-300'
                            )}
                          >
                            <Monitor className="w-8 h-8 mx-auto mb-2 text-accent-blue" />
                            <p className="font-medium text-text-primary">{t('settingsPage.appearance.auto', { defaultValue: 'Auto' })}</p>
                          </button>
                        </div>
                      </div>

                      <div className="border-t border-gray-200" />

                      {/* Font Size */}
                      <div>
                        <Label htmlFor="font-size">{t('settingsPage.appearance.fontSize', { defaultValue: 'Font Size' })}</Label>
                        <select
                          id="font-size"
                          className="flex h-12 w-full rounded-button border border-input bg-white px-4 py-3 text-sm mt-2"
                        >
                          <option value="small">{t('settingsPage.appearance.small', { defaultValue: 'Small' })}</option>
                          <option value="medium" selected>
                            {t('settingsPage.appearance.medium', { defaultValue: 'Medium' })}
                          </option>
                          <option value="large">{t('settingsPage.appearance.large', { defaultValue: 'Large' })}</option>
                        </select>
                      </div>

                      <div className="border-t border-gray-200" />

                      {/* Accessibility Options */}
                      <div>
                        <h3 className="font-semibold text-text-primary mb-4">
                          {t('settingsPage.appearance.accessibilityOptions', { defaultValue: 'Accessibility Options' })}
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="high-contrast" className="cursor-pointer">
                              {t('settingsPage.appearance.highContrast', { defaultValue: 'High Contrast Mode' })}
                            </Label>
                            <Switch id="high-contrast" />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="reduce-motion" className="cursor-pointer">
                              {t('settingsPage.appearance.reduceMotion', { defaultValue: 'Reduce Motion' })}
                            </Label>
                            <Switch id="reduce-motion" />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="screen-reader" className="cursor-pointer">
                              {t('settingsPage.appearance.screenReader', { defaultValue: 'Screen Reader Optimization' })}
                            </Label>
                            <Switch id="screen-reader" />
                          </div>
                        </div>
                      </div>
                    </Card>
                  </AccordionContent>
                </AccordionItem>

                {/* Security */}
                <AccordionItem value="security">
                  <AccordionTrigger>
                    <div className="flex items-center gap-3">
                      <Lock className="w-5 h-5 text-accent-blue" />
                      <span className="text-lg font-semibold">{t('settingsPage.security.title', { defaultValue: 'Security' })}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Card className="p-6 space-y-6">
                      {/* Change Password */}
                      <div>
                        <h3 className="font-semibold text-text-primary mb-4">{t('settingsPage.security.changePassword', { defaultValue: 'Change Password' })}</h3>
                        <form className="space-y-4">
                          <div>
                            <Label htmlFor="security-current-password">{t('settingsPage.security.currentPassword', { defaultValue: 'Current Password' })}</Label>
                            <Input id="security-current-password" type="password" className="mt-2" />
                          </div>
                          <div>
                            <Label htmlFor="security-new-password">{t('settingsPage.security.newPassword', { defaultValue: 'New Password' })}</Label>
                            <Input id="security-new-password" type="password" className="mt-2" />
                          </div>
                          <div>
                            <Label htmlFor="security-confirm-password">
                              {t('settingsPage.security.confirmNewPassword', { defaultValue: 'Confirm New Password' })}
                            </Label>
                            <Input id="security-confirm-password" type="password" className="mt-2" />
                          </div>
                          <Button type="submit">{t('settingsPage.security.updatePassword', { defaultValue: 'Update Password' })}</Button>
                        </form>
                      </div>

                      <div className="border-t border-gray-200" />

                      {/* Two-Factor Authentication Setup */}
                      <div>
                        <h3 className="font-semibold text-text-primary mb-4">
                          {t('settingsPage.security.twoFactorAuth', { defaultValue: 'Two-Factor Authentication' })}
                        </h3>
                        <div className="p-4 bg-green-50 border border-green-200 rounded-button mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-5 h-5 text-green-600" />
                            <p className="font-semibold text-green-900">{t('settingsPage.security.twoFAActive', { defaultValue: '2FA is Active' })}</p>
                          </div>
                          <p className="text-sm text-green-700">
                            {t('settingsPage.security.twoFAActiveDesc', { defaultValue: 'Your account is protected with two-factor authentication.' })}
                          </p>
                        </div>
                        <Button variant="outline">{t('settingsPage.security.manage2FA', { defaultValue: 'Manage 2FA Settings' })}</Button>
                      </div>

                      <div className="border-t border-gray-200" />

                      {/* Trusted Devices */}
                      <div>
                        <h3 className="font-semibold text-text-primary mb-4">{t('settingsPage.security.trustedDevices', { defaultValue: 'Trusted Devices' })}</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-button">
                            <div>
                              <p className="text-sm font-medium text-text-primary">
                                {t('settingsPage.account.chromeOnWindows', { defaultValue: 'Chrome on Windows' })}
                              </p>
                              <p className="text-xs text-text-secondary">{t('settingsPage.security.addedToday', { defaultValue: 'Added today' })}</p>
                            </div>
                            <Button variant="outline" size="sm">
                              {t('settingsPage.security.remove', { defaultValue: 'Remove' })}
                            </Button>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-button">
                            <div>
                              <p className="text-sm font-medium text-text-primary">
                                {t('settingsPage.account.safariOnIphone', { defaultValue: 'Safari on iPhone' })}
                              </p>
                              <p className="text-xs text-text-secondary">{t('settingsPage.security.addedDaysAgo', { days: 2, defaultValue: 'Added 2 days ago' })}</p>
                            </div>
                            <Button variant="outline" size="sm">
                              {t('settingsPage.security.remove', { defaultValue: 'Remove' })}
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-gray-200" />

                      {/* Login Alerts */}
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-text-primary mb-1">{t('settingsPage.security.loginAlerts', { defaultValue: 'Login Alerts' })}</h3>
                            <p className="text-sm text-text-secondary">
                              {t('settingsPage.security.loginAlertsDesc', { defaultValue: 'Get notified when someone logs into your account' })}
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </Card>
                  </AccordionContent>
                </AccordionItem>

                {/* Communication */}
                <AccordionItem value="communication">
                  <AccordionTrigger>
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-accent-blue" />
                      <span className="text-lg font-semibold">{t('settingsPage.communication.title', { defaultValue: 'Communication' })}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Card className="p-6 space-y-6">
                      {/* Email Preferences */}
                      <div>
                        <h3 className="font-semibold text-text-primary mb-4">{t('settingsPage.communication.emailPreferences', { defaultValue: 'Email Preferences' })}</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="comm-order-updates" className="cursor-pointer">
                              {t('settingsPage.communication.orderUpdates', { defaultValue: 'Order Updates' })}
                            </Label>
                            <Switch id="comm-order-updates" defaultChecked />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="comm-promotions" className="cursor-pointer">
                              {t('settingsPage.communication.promotionsOffers', { defaultValue: 'Promotions & Offers' })}
                            </Label>
                            <Switch id="comm-promotions" defaultChecked />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="comm-newsletter" className="cursor-pointer">
                              {t('settingsPage.communication.newsletter', { defaultValue: 'Newsletter' })}
                            </Label>
                            <Switch id="comm-newsletter" />
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-gray-200" />

                      {/* SMS Preferences */}
                      <div>
                        <h3 className="font-semibold text-text-primary mb-4">{t('settingsPage.communication.smsPreferences', { defaultValue: 'SMS Preferences' })}</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="comm-sms-order" className="cursor-pointer">
                              {t('settingsPage.communication.orderShippedNotifications', { defaultValue: 'Order Shipped Notifications' })}
                            </Label>
                            <Switch id="comm-sms-order" defaultChecked />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="comm-sms-delivery" className="cursor-pointer">
                              {t('settingsPage.communication.deliveryUpdates', { defaultValue: 'Delivery Updates' })}
                            </Label>
                            <Switch id="comm-sms-delivery" defaultChecked />
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-gray-200" />

                      {/* Push Notification Settings */}
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-text-primary mb-1">
                              {t('settingsPage.communication.pushNotifications', { defaultValue: 'Push Notifications' })}
                            </h3>
                            <p className="text-sm text-text-secondary">
                              {t('settingsPage.communication.pushNotificationsDesc', { defaultValue: 'Receive real-time updates in your browser' })}
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </Card>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};
