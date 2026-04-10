/**
 * PlatformSettingsContext - Provides platform-wide settings to the app
 * Fetches public settings from /admin/platform-settings (no auth required)
 * Used by landing page, navbar, footer, etc.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

interface PlatformSettings {
  platformName: string;
  platformLogo: string;
  supportEmail: string;
  defaultCurrency: string;
  defaultLanguage: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
}

interface PlatformSettingsContextValue {
  settings: PlatformSettings;
  loading: boolean;
  error: string | null;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: PlatformSettings = {
  platformName: 'Vasty Shop',
  platformLogo: '/vasty-logo-small.png',
  supportEmail: 'support@vasty.shop',
  defaultCurrency: 'USD',
  defaultLanguage: 'en',
  maintenanceMode: false,
  maintenanceMessage: '',
};

// Canonical email - always use this regardless of database value
const CANONICAL_SUPPORT_EMAIL = 'support@vasty.shop';

const PlatformSettingsContext = createContext<PlatformSettingsContextValue | undefined>(undefined);

export const usePlatformSettings = () => {
  const context = useContext(PlatformSettingsContext);
  if (!context) {
    throw new Error('usePlatformSettings must be used within a PlatformSettingsProvider');
  }
  return context;
};

interface PlatformSettingsProviderProps {
  children: React.ReactNode;
}

export const PlatformSettingsProvider: React.FC<PlatformSettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<PlatformSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getPublicPlatformSettings();
      setSettings({
        platformName: data.platformName || defaultSettings.platformName,
        platformLogo: data.platformLogo || defaultSettings.platformLogo,
        // Always use canonical email to ensure consistency
        supportEmail: CANONICAL_SUPPORT_EMAIL,
        defaultCurrency: data.defaultCurrency || defaultSettings.defaultCurrency,
        defaultLanguage: data.defaultLanguage || defaultSettings.defaultLanguage,
        maintenanceMode: data.maintenanceMode || false,
        maintenanceMessage: data.maintenanceMessage || '',
      });
    } catch (err) {
      console.error('Failed to fetch platform settings:', err);
      setError('Failed to load platform settings');
      // Keep default settings on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const value: PlatformSettingsContextValue = {
    settings,
    loading,
    error,
    refreshSettings: fetchSettings,
  };

  return (
    <PlatformSettingsContext.Provider value={value}>
      {children}
    </PlatformSettingsContext.Provider>
  );
};

export default PlatformSettingsContext;
