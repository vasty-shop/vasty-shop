import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Bell,
  Volume2,
  Smartphone,
  Clock,
  LogOut,
  Save,
  Loader2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDeliveryAuthStore } from '@/stores/useDeliveryAuthStore';
import { deliveryApi } from '../api/deliveryApi';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const DeliverySettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const { deliveryMan, logout } = useDeliveryAuthStore();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    autoAcceptOrders: false,
    maxOrdersPerTime: 3,
    notificationsEnabled: true,
    soundEnabled: true,
    vibrationEnabled: true,
    workingHoursStart: '09:00',
    workingHoursEnd: '21:00',
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: name === 'maxOrdersPerTime' ? parseInt(value) : value,
    }));
  };

  const handleSave = async () => {
    if (!deliveryMan?.id) return;

    setIsSaving(true);
    try {
      await deliveryApi.updateSettings(deliveryMan.id, {
        autoAcceptOrders: settings.autoAcceptOrders,
        maxOrdersPerTime: settings.maxOrdersPerTime,
        notificationsEnabled: settings.notificationsEnabled,
        soundEnabled: settings.soundEnabled,
        vibrationEnabled: settings.vibrationEnabled,
        workingHours: {
          start: settings.workingHoursStart,
          end: settings.workingHoursEnd,
        },
        preferredZones: [],
      });
      toast.success(t('delivery.settings.settingsSaved'));
    } catch (error) {
      toast.error(t('delivery.settings.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success(t('delivery.settings.logoutSuccess'));
    navigate('/delivery/login');
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('delivery.settings.title')}</h1>
          <p className="text-gray-500 mt-1">{t('delivery.settings.subtitle')}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {t('delivery.settings.saveChanges')}
        </button>
      </div>

      {/* Order Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100"
      >
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Settings className="w-5 h-5 mr-2 text-orange-500" />
            {t('delivery.settings.orderSettings')}
          </h3>
        </div>
        <div className="divide-y divide-gray-100">
          {/* Auto Accept */}
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{t('delivery.settings.autoAcceptOrders')}</p>
              <p className="text-sm text-gray-500">{t('delivery.settings.autoAcceptOrdersDesc')}</p>
            </div>
            <button
              onClick={() => handleToggle('autoAcceptOrders')}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.autoAcceptOrders ? 'bg-orange-500' : 'bg-gray-200'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings.autoAcceptOrders ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Max Orders */}
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{t('delivery.settings.maxConcurrentOrders')}</p>
              <p className="text-sm text-gray-500">{t('delivery.settings.maxConcurrentOrdersDesc')}</p>
            </div>
            <select
              name="maxOrdersPerTime"
              value={settings.maxOrdersPerTime}
              onChange={handleInputChange}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  {num} {num > 1 ? t('delivery.settings.orders') : t('delivery.settings.order')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Notification Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100"
      >
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Bell className="w-5 h-5 mr-2 text-orange-500" />
            {t('delivery.settings.notifications')}
          </h3>
        </div>
        <div className="divide-y divide-gray-100">
          {/* Push Notifications */}
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{t('delivery.settings.pushNotifications')}</p>
              <p className="text-sm text-gray-500">{t('delivery.settings.pushNotificationsDesc')}</p>
            </div>
            <button
              onClick={() => handleToggle('notificationsEnabled')}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.notificationsEnabled ? 'bg-orange-500' : 'bg-gray-200'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings.notificationsEnabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Sound */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Volume2 className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">{t('delivery.settings.sound')}</p>
                <p className="text-sm text-gray-500">{t('delivery.settings.soundDesc')}</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('soundEnabled')}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.soundEnabled ? 'bg-orange-500' : 'bg-gray-200'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings.soundEnabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Vibration */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Smartphone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">{t('delivery.settings.vibration')}</p>
                <p className="text-sm text-gray-500">{t('delivery.settings.vibrationDesc')}</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('vibrationEnabled')}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.vibrationEnabled ? 'bg-orange-500' : 'bg-gray-200'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings.vibrationEnabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Working Hours */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100"
      >
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-orange-500" />
            {t('delivery.settings.workingHours')}
          </h3>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-500 mb-4">{t('delivery.settings.workingHoursDesc')}</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('delivery.settings.startTime')}</label>
              <input
                type="time"
                name="workingHoursStart"
                value={settings.workingHoursStart}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('delivery.settings.endTime')}</label>
              <input
                type="time"
                name="workingHoursEnd"
                value={settings.workingHoursEnd}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Logout */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onClick={handleLogout}
        className="w-full p-4 bg-red-50 text-red-600 font-medium rounded-2xl hover:bg-red-100 transition-colors flex items-center justify-center"
      >
        <LogOut className="w-5 h-5 mr-2" />
        {t('delivery.sidebar.logout')}
      </motion.button>

      {/* Version */}
      <p className="text-center text-sm text-gray-400">
        {t('delivery.settings.appVersion')}
      </p>
    </div>
  );
};
