'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface AppConfig {
  appName: string;
  packageName: string;
  versionCode: string;
  versionName: string;
}

interface AppConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: (config: AppConfig) => void;
  existingConfig?: AppConfig | null;
  isDownloading?: boolean;
  shopName?: string;
}

export function AppConfigModal({
  isOpen,
  onClose,
  onDownload,
  existingConfig,
  isDownloading = false,
  shopName = 'My Shop',
}: AppConfigModalProps) {
  const { t } = useTranslation();
  const [config, setConfig] = useState<AppConfig>({
    appName: existingConfig?.appName || shopName,
    packageName: existingConfig?.packageName || 'com.yourcompany.app',
    versionCode: existingConfig?.versionCode || '1',
    versionName: existingConfig?.versionName || '1.0.0',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof AppConfig, string>>>({});

  // Update config when existingConfig changes
  useEffect(() => {
    if (existingConfig) {
      setConfig(existingConfig);
    } else {
      setConfig({
        appName: shopName,
        packageName: 'com.yourcompany.app',
        versionCode: '1',
        versionName: '1.0.0',
      });
    }
  }, [existingConfig, shopName]);

  const validateConfig = (): boolean => {
    const newErrors: Partial<Record<keyof AppConfig, string>> = {};

    // Validate APP_NAME
    if (!config.appName.trim()) {
      newErrors.appName = 'App name is required';
    }

    // Validate PACKAGE_NAME (should be in format com.company.app)
    if (!config.packageName.trim()) {
      newErrors.packageName = 'Package name is required';
    } else if (!/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(config.packageName)) {
      newErrors.packageName = 'Invalid format. Use lowercase letters, numbers, and dots (e.g., com.company.app)';
    }

    // Validate VERSION_CODE (should be a positive integer)
    if (!config.versionCode.trim()) {
      newErrors.versionCode = 'Version code is required';
    } else if (!/^\d+$/.test(config.versionCode)) {
      newErrors.versionCode = 'Version code must be a positive integer';
    }

    // Validate VERSION_NAME (should be in format X.Y.Z)
    if (!config.versionName.trim()) {
      newErrors.versionName = 'Version name is required';
    } else if (!/^\d+\.\d+\.\d+$/.test(config.versionName)) {
      newErrors.versionName = 'Version name must be in format X.Y.Z (e.g., 1.0.0)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDownload = () => {
    if (validateConfig()) {
      onDownload(config);
    }
  };

  const handleChange = (field: keyof AppConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-slate-800 rounded-xl shadow-2xl border border-white/10 w-full max-w-md mx-4 overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {existingConfig ? 'App Configuration' : 'Configure Your App'}
              </h3>
              <p className="text-sm text-white/60 mt-1">
                {existingConfig
                  ? 'Review or update your app settings before downloading'
                  : 'Set up your app details for the first time'}
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={isDownloading}
              className="text-white/60 hover:text-white transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Info Banner */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex gap-3">
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-300">
                These settings will be used to configure your mobile app's .env file.
              </div>
            </div>

            {/* APP_NAME */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                App Name
                <span className="text-red-400 ml-1">*</span>
              </label>
              <input
                type="text"
                value={config.appName}
                onChange={(e) => handleChange('appName', e.target.value)}
                placeholder={t('vendor.placeholders.appName')}
                disabled={isDownloading}
                className={`w-full px-3 py-2 bg-white/5 border ${
                  errors.appName ? 'border-red-500' : 'border-white/10'
                } rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary-lime/50 disabled:opacity-50 disabled:cursor-not-allowed`}
              />
              {errors.appName && (
                <p className="text-red-400 text-xs mt-1">{errors.appName}</p>
              )}
              <p className="text-white/40 text-xs mt-1">
                The display name of your mobile app
              </p>
            </div>

            {/* PACKAGE_NAME */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Package Name
                <span className="text-red-400 ml-1">*</span>
              </label>
              <input
                type="text"
                value={config.packageName}
                onChange={(e) => handleChange('packageName', e.target.value)}
                placeholder="com.yourcompany.app"
                disabled={isDownloading}
                className={`w-full px-3 py-2 bg-white/5 border ${
                  errors.packageName ? 'border-red-500' : 'border-white/10'
                } rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary-lime/50 disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm`}
              />
              {errors.packageName && (
                <p className="text-red-400 text-xs mt-1">{errors.packageName}</p>
              )}
              <p className="text-white/40 text-xs mt-1">
                Unique identifier for your app (e.g., com.company.product)
              </p>
            </div>

            {/* VERSION_CODE */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Version Code
                <span className="text-red-400 ml-1">*</span>
              </label>
              <input
                type="text"
                value={config.versionCode}
                onChange={(e) => handleChange('versionCode', e.target.value)}
                placeholder="1"
                disabled={isDownloading}
                className={`w-full px-3 py-2 bg-white/5 border ${
                  errors.versionCode ? 'border-red-500' : 'border-white/10'
                } rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary-lime/50 disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm`}
              />
              {errors.versionCode && (
                <p className="text-red-400 text-xs mt-1">{errors.versionCode}</p>
              )}
              <p className="text-white/40 text-xs mt-1">
                Internal version number (increment for each release)
              </p>
            </div>

            {/* VERSION_NAME */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Version Name
                <span className="text-red-400 ml-1">*</span>
              </label>
              <input
                type="text"
                value={config.versionName}
                onChange={(e) => handleChange('versionName', e.target.value)}
                placeholder="1.0.0"
                disabled={isDownloading}
                className={`w-full px-3 py-2 bg-white/5 border ${
                  errors.versionName ? 'border-red-500' : 'border-white/10'
                } rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary-lime/50 disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm`}
              />
              {errors.versionName && (
                <p className="text-red-400 text-xs mt-1">{errors.versionName}</p>
              )}
              <p className="text-white/40 text-xs mt-1">
                User-visible version (e.g., 1.0.0, 2.1.3)
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/10 flex items-center justify-end gap-3">
            <Button
              onClick={onClose}
              disabled={isDownloading}
              className="bg-slate-600/50 hover:bg-slate-600/70 text-white px-8 py-2.5 rounded-lg font-medium disabled:opacity-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              className="bg-primary-lime hover:bg-primary-lime/90 text-white px-8 py-2.5 rounded-lg font-medium"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download App
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
