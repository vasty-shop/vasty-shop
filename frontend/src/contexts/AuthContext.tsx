/**
 * AuthContext - Central authentication state management
 * Unified login for both customers and vendors
 * If user has shops, they can access vendor dashboard
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api, User, LoginCredentials, RegisterData } from '../lib/api';
import { TokenManager } from '../lib/token-manager';
import { useVendorAuthStore } from '../stores/useVendorAuthStore';
import { useShopStore } from '../stores/useShopStore';
import { useCartStore } from '../stores/useCartStore';
import { useWishlistStore } from '../stores/useWishlistStore';

// Shop type for unified auth (matches VendorShop status types)
interface Shop {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  status: 'pending' | 'active' | 'suspended' | 'closed';
  isVerified: boolean;
}

interface AuthContextValue {
  user: User | null;
  shops: Shop[];
  isAuthenticated: boolean;
  isVendor: boolean; // true if user has at least one shop
  isAdmin: boolean; // true if user role is admin
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ user: User; shops: Shop[] }>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const isAuthenticated = !!user;
  const isVendor = shops.length > 0;
  const isAdmin = user?.role === 'admin';

  // Check authentication status on mount
  const checkAuth = useCallback(async () => {
    const token = TokenManager.getToken();

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const currentUser = await api.getCurrentUser();
      setUser(currentUser);

      // Use shops from getCurrentUser response (backend now returns them)
      const userShops: Shop[] = (currentUser as any).shops || [];

      if (userShops.length > 0) {
        setShops(userShops);

        // Also update shop store
        const shopStore = useShopStore.getState();
        shopStore.setShops(userShops as any);
        shopStore.setCurrentShop(userShops[0] as any);

        // Update vendor auth store for compatibility
        const vendorStore = useVendorAuthStore.getState();
        // Extract name fields - backend now returns these properly
        const firstName = (currentUser as any).firstName || currentUser.metadata?.firstName || currentUser.name?.split(' ')[0] || currentUser.email?.split('@')[0] || '';
        const lastName = (currentUser as any).lastName || currentUser.metadata?.lastName || currentUser.name?.split(' ').slice(1).join(' ') || '';
        const avatar = (currentUser as any).avatar || currentUser.metadata?.avatar || currentUser.avatar || undefined;
        vendorStore.setVendor({
          id: currentUser.id,
          email: currentUser.email,
          firstName,
          lastName,
          phone: (currentUser as any).phone || currentUser.metadata?.phone || '',
          avatar,
          role: 'vendor' as const,
          isEmailVerified: true,
          isActive: true,
          createdAt: new Date().toISOString(),
        });
        vendorStore.setShop(userShops[0] as any);
        vendorStore.setShops(userShops as any);
        // Sync token to vendor auth store for persistence
        if (token) {
          vendorStore.setToken(token);
        }
      } else {
        // Fallback: Load shops from shop store (persisted)
        const shopStore = useShopStore.getState();
        if (shopStore.shops.length > 0) {
          setShops(shopStore.shops as any);
        }
      }
    } catch (error: any) {
      console.error('Auth check failed:', error);
      // Don't clear TokenManager here - the token might be valid
      // Just clear customer auth state
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Listen for auth token storage event (from OAuth callback)
  useEffect(() => {
    const handleAuthTokenStored = () => {
      checkAuth();
    };

    window.addEventListener('auth-token-stored', handleAuthTokenStored);
    return () => window.removeEventListener('auth-token-stored', handleAuthTokenStored);
  }, [checkAuth]);

  const login = useCallback(async (credentials: LoginCredentials): Promise<{ user: User; shops: Shop[] }> => {
    try {
      const response = await api.login(credentials);
      setUser(response.user);

      // Handle shops from unified login
      const userShops: Shop[] = response.shops || [];
      setShops(userShops);

      // Populate shop stores for vendor functionality
      if (userShops.length > 0) {
        const shopStore = useShopStore.getState();
        // Cast to any for compatibility between Shop and VendorShop types
        shopStore.setShops(userShops as any);
        shopStore.setCurrentShop(userShops[0] as any);

        // Also update vendor auth store for compatibility
        const vendorStore = useVendorAuthStore.getState();
        // Extract name fields - backend now returns these properly
        const firstName = (response.user as any).firstName || response.user.metadata?.firstName || response.user.name?.split(' ')[0] || response.user.email?.split('@')[0] || '';
        const lastName = (response.user as any).lastName || response.user.metadata?.lastName || response.user.name?.split(' ').slice(1).join(' ') || '';
        const avatar = (response.user as any).avatar || response.user.metadata?.avatar || response.user.avatar || undefined;
        vendorStore.setVendor({
          id: response.user.id,
          email: response.user.email,
          firstName,
          lastName,
          phone: (response.user as any).phone || response.user.metadata?.phone || '',
          avatar,
          role: 'vendor',
          isEmailVerified: true,
          isActive: true,
          createdAt: new Date().toISOString(),
        });
        vendorStore.setShop(userShops[0] as any);
        vendorStore.setShops(userShops as any);
        // Also sync the token for vendor auth store persistence
        const token = TokenManager.getToken();
        if (token) {
          vendorStore.setToken(token);
        }
      }

      toast.success('Welcome back!', {
        description: `Logged in as ${response.user.email}`,
      });

      return { user: response.user, shops: userShops };
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Invalid email or password';
      toast.error('Login Failed', {
        description: errorMessage,
      });
      throw error;
    }
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<User> => {
    try {
      const response = await api.register(data);
      setUser(response.user);

      toast.success('Account Created!', {
        description: 'Welcome to Vasty Shop',
      });

      return response.user;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Registration failed';
      toast.error('Registration Failed', {
        description: errorMessage,
      });
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch (error: any) {
      console.error('Logout API error:', error);
    }

    // Always clear all local state regardless of API success
    TokenManager.clearAll();
    setUser(null);
    setShops([]);

    // Clear vendor auth store
    const vendorStore = useVendorAuthStore.getState();
    vendorStore.logout();

    // Clear shop store
    const shopStore = useShopStore.getState();
    shopStore.clearShopContext();

    // Clear cart and wishlist (local only, don't call API)
    useCartStore.setState({ items: [] });
    useWishlistStore.setState({ items: [], lastSyncedAt: null });

    // Clear any persisted storage - ALL auth stores
    localStorage.removeItem('vendor-auth-storage');
    localStorage.removeItem('delivery-auth-storage');  // Clear delivery man auth too!
    localStorage.removeItem('shop-context-storage');
    localStorage.removeItem('cart-storage');
    localStorage.removeItem('wishlist-storage');
    localStorage.removeItem('accessToken');  // Main token key used by TokenManager
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('auth-token');   // Legacy key (if any)
    sessionStorage.clear();

    toast.success('Logged Out', {
      description: 'You have been successfully logged out',
    });

    // Force page reload to ensure all state is cleared
    window.location.href = '/';
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await api.getCurrentUser();
      setUser(currentUser);
    } catch (error: any) {
      console.error('Failed to refresh user:', error);
      // If refresh fails, user might be logged out
      TokenManager.clearAll();
      setUser(null);
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    try {
      const response = await api.forgotPassword(email);
      toast.success('Reset Link Sent', {
        description: response.message,
      });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to send reset link';
      toast.error('Request Failed', {
        description: errorMessage,
      });
      throw error;
    }
  }, []);

  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    try {
      const response = await api.resetPassword(token, newPassword);
      toast.success('Password Reset', {
        description: response.message,
      });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to reset password';
      toast.error('Reset Failed', {
        description: errorMessage,
      });
      throw error;
    }
  }, []);

  const value: AuthContextValue = {
    user,
    shops,
    isAuthenticated,
    isVendor,
    isAdmin,
    loading,
    login,
    register,
    logout,
    refreshUser,
    forgotPassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
