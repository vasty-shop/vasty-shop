/**
 * StoreAuthContext - Store-specific authentication management
 * Each store has its own authentication session
 * Customers must login separately to each store
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { api } from '../lib/api';

// Store customer interface
export interface StoreCustomer {
  id: string;
  email: string;
  name: string;
  phone?: string;
  shopId: string;
  avatar?: string;
  avatarUrl?: string;
}

// Store session interface
export interface StoreSession {
  shopId: string;
  token: string;
  refreshToken?: string;
  customer: StoreCustomer;
  expiresAt: number;
}

// Login credentials for store
export interface StoreLoginCredentials {
  email: string;
  password: string;
}

// Register data for store
export interface StoreRegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

interface StoreAuthContextValue {
  // Current store context (set by StorefrontLayout)
  currentShopId: string | null;
  setCurrentShopId: (shopId: string | null) => void;

  // Current store customer (for the current shop)
  storeCustomer: StoreCustomer | null;

  // Check if authenticated for a specific store
  isStoreAuthenticated: (shopId: string) => boolean;

  // Get session for a specific store
  getStoreSession: (shopId: string) => StoreSession | null;

  // Get token for a specific store (for API calls)
  getStoreToken: (shopId: string) => string | null;

  // Login to a specific store
  storeLogin: (shopId: string, credentials: StoreLoginCredentials) => Promise<StoreCustomer>;

  // Register at a specific store
  storeRegister: (shopId: string, data: StoreRegisterData) => Promise<StoreCustomer>;

  // Logout from a specific store
  storeLogout: (shopId: string) => void;

  // Logout from all stores
  storeLogoutAll: () => void;

  // Loading state
  loading: boolean;
}

const StoreAuthContext = createContext<StoreAuthContextValue | undefined>(undefined);

export const useStoreAuth = () => {
  const context = useContext(StoreAuthContext);
  if (!context) {
    throw new Error('useStoreAuth must be used within a StoreAuthProvider');
  }
  return context;
};

// Helper functions for localStorage
const STORE_TOKEN_PREFIX = 'storeToken_';
const STORE_SESSION_PREFIX = 'storeSession_';

const getStorageKey = (prefix: string, shopId: string) => `${prefix}${shopId}`;

const saveStoreSession = (session: StoreSession): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(
    getStorageKey(STORE_SESSION_PREFIX, session.shopId),
    JSON.stringify(session)
  );
  localStorage.setItem(
    getStorageKey(STORE_TOKEN_PREFIX, session.shopId),
    session.token
  );
};

const loadStoreSession = (shopId: string): StoreSession | null => {
  if (typeof window === 'undefined') return null;
  const sessionStr = localStorage.getItem(getStorageKey(STORE_SESSION_PREFIX, shopId));
  if (!sessionStr) return null;

  try {
    const session: StoreSession = JSON.parse(sessionStr);
    // Check if session is expired
    if (session.expiresAt && session.expiresAt < Date.now()) {
      clearStoreSession(shopId);
      return null;
    }
    return session;
  } catch {
    return null;
  }
};

const clearStoreSession = (shopId: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(getStorageKey(STORE_SESSION_PREFIX, shopId));
  localStorage.removeItem(getStorageKey(STORE_TOKEN_PREFIX, shopId));
};

const clearAllStoreSessions = (): void => {
  if (typeof window === 'undefined') return;
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith(STORE_TOKEN_PREFIX) || key.startsWith(STORE_SESSION_PREFIX))) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
};

interface StoreAuthProviderProps {
  children: React.ReactNode;
}

export const StoreAuthProvider: React.FC<StoreAuthProviderProps> = ({ children }) => {
  const [currentShopId, setCurrentShopId] = useState<string | null>(null);
  const [storeCustomer, setStoreCustomer] = useState<StoreCustomer | null>(null);
  const [loading, setLoading] = useState(false);

  // Update store customer when current shop changes
  useEffect(() => {
    if (currentShopId) {
      const session = loadStoreSession(currentShopId);
      setStoreCustomer(session?.customer || null);
    } else {
      setStoreCustomer(null);
    }
  }, [currentShopId]);

  const isStoreAuthenticated = useCallback((shopId: string): boolean => {
    const session = loadStoreSession(shopId);
    return !!session;
  }, []);

  const getStoreSession = useCallback((shopId: string): StoreSession | null => {
    return loadStoreSession(shopId);
  }, []);

  const getStoreToken = useCallback((shopId: string): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(getStorageKey(STORE_TOKEN_PREFIX, shopId));
  }, []);

  const storeLogin = useCallback(async (
    shopId: string,
    credentials: StoreLoginCredentials
  ): Promise<StoreCustomer> => {
    setLoading(true);
    try {
      // Call store-specific login endpoint
      const response = await api.post(`/auth/store/${shopId}/login`, credentials);

      const { user, accessToken, refreshToken, expiresIn } = response.data;

      const customer: StoreCustomer = {
        id: user.id,
        email: user.email,
        name: user.name || user.email.split('@')[0],
        phone: user.phone,
        shopId,
      };

      const session: StoreSession = {
        shopId,
        token: accessToken,
        refreshToken,
        customer,
        expiresAt: Date.now() + (expiresIn || 24 * 60 * 60) * 1000, // Default 24 hours
      };

      saveStoreSession(session);

      // Update current customer if this is the current shop
      if (shopId === currentShopId) {
        setStoreCustomer(customer);
      }

      toast.success('Welcome!', {
        description: `Logged in to store successfully`,
      });

      return customer;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Invalid email or password';
      toast.error('Login Failed', {
        description: errorMessage,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentShopId]);

  const storeRegister = useCallback(async (
    shopId: string,
    data: StoreRegisterData
  ): Promise<StoreCustomer> => {
    setLoading(true);
    try {
      // Call store-specific register endpoint
      const response = await api.post(`/auth/store/${shopId}/register`, data);

      const { user, accessToken, refreshToken, expiresIn } = response.data;

      const customer: StoreCustomer = {
        id: user.id,
        email: user.email,
        name: user.name || data.name,
        phone: user.phone || data.phone,
        shopId,
      };

      const session: StoreSession = {
        shopId,
        token: accessToken,
        refreshToken,
        customer,
        expiresAt: Date.now() + (expiresIn || 24 * 60 * 60) * 1000,
      };

      saveStoreSession(session);

      if (shopId === currentShopId) {
        setStoreCustomer(customer);
      }

      toast.success('Account Created!', {
        description: 'Welcome to our store',
      });

      return customer;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Registration failed';
      toast.error('Registration Failed', {
        description: errorMessage,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentShopId]);

  const storeLogout = useCallback((shopId: string): void => {
    clearStoreSession(shopId);

    if (shopId === currentShopId) {
      setStoreCustomer(null);
    }

    toast.success('Logged Out', {
      description: 'You have been logged out from the store',
    });
  }, [currentShopId]);

  const storeLogoutAll = useCallback((): void => {
    clearAllStoreSessions();
    setStoreCustomer(null);
  }, []);

  const value: StoreAuthContextValue = {
    currentShopId,
    setCurrentShopId,
    storeCustomer,
    isStoreAuthenticated,
    getStoreSession,
    getStoreToken,
    storeLogin,
    storeRegister,
    storeLogout,
    storeLogoutAll,
    loading,
  };

  return (
    <StoreAuthContext.Provider value={value}>
      {children}
    </StoreAuthContext.Provider>
  );
};
