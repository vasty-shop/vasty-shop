import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { VendorUser, VendorShop } from '@/features/vendor-auth/types';
import { vendorLogout } from '@/features/vendor-auth/vendorAuthApi';
import { useShopStore } from './useShopStore';
import { TokenManager } from '@/lib/token-manager';

interface VendorAuthStore {
  // State
  vendor: VendorUser | null;
  shop: VendorShop | null;
  shops: VendorShop[];
  token: string | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;

  // Actions
  setVendor: (vendor: VendorUser | null) => void;
  setShop: (shop: VendorShop | null) => void;
  setShops: (shops: VendorShop[]) => void;
  setToken: (token: string | null) => void;
  login: (vendor: VendorUser, shop: VendorShop | VendorShop[], token: string) => void;
  logout: () => void;
  updateShop: (updates: Partial<VendorShop>) => void;
  setHasHydrated: (state: boolean) => void;
}

export const useVendorAuthStore = create<VendorAuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      vendor: null,
      shop: null,
      shops: [],
      token: null,
      isAuthenticated: false,
      _hasHydrated: false,

      // Set hydration state
      setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),

      // Set vendor
      setVendor: (vendor) =>
        set({
          vendor,
          isAuthenticated: !!vendor,
        }),

      // Set shop
      setShop: (shop) => set({ shop }),

      // Set shops
      setShops: (shops) => set({ shops }),

      // Set token
      setToken: (token) => {
        // Sync with TokenManager for API client
        if (token) {
          TokenManager.setToken(token);
        } else {
          TokenManager.removeToken();
        }
        set({ token });
      },

      // Login
      login: (vendor, shopData, token) => {
        // Handle both single shop and array of shops
        const shops = Array.isArray(shopData) ? shopData : [shopData];
        const currentShop = shops[0]; // Default to first shop

        // Sync token with TokenManager for API client
        if (token) {
          TokenManager.setToken(token);
        }

        // Update shop store with shops data
        const shopStore = useShopStore.getState();
        shopStore.setShops(shops);
        shopStore.setCurrentShop(currentShop);

        set({
          vendor,
          shop: currentShop,
          shops,
          token,
          isAuthenticated: true,
        });
      },

      // Logout
      logout: () => {

        vendorLogout(); // Clear localStorage/sessionStorage

        // Clear TokenManager
        TokenManager.clearAll();

        // Clear shop store context
        const shopStore = useShopStore.getState();
        shopStore.clearShopContext();

        // Clear all auth storages to prevent session conflicts
        localStorage.removeItem('delivery-auth-storage');
        localStorage.removeItem('vendor-auth-storage');

        set({
          vendor: null,
          shop: null,
          shops: [],
          token: null,
          isAuthenticated: false,
        });

        console.log('[VendorAuthStore] Logout complete');
      },

      // Update shop info
      updateShop: (updates) =>
        set((state) => ({
          shop: state.shop ? { ...state.shop, ...updates } : null,
        })),
    }),
    {
      name: 'vendor-auth-storage',
      partialize: (state) => ({
        vendor: state.vendor,
        shop: state.shop,
        shops: state.shops,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => {
        // console.log('[VendorAuthStore] Starting rehydration');
        return (state, error) => {
          if (error) {
            console.error('[VendorAuthStore] Rehydration error:', error);
          } else if (state?.token) {
            // console.log('[VendorAuthStore] Rehydrating token to TokenManager');
            TokenManager.setToken(state.token);
          } else {
            console.log('[VendorAuthStore] No token to rehydrate');
          }
        };
      },
    }
  )
);

// Set hydration state after store is created
// Using onFinishHydration to properly detect when rehydration completes
useVendorAuthStore.persist.onFinishHydration(() => {
  console.log('[VendorAuthStore] Hydration finished');
  useVendorAuthStore.setState({ _hasHydrated: true });
});

// Also check if already hydrated (for cases where hydration happens before this code runs)
if (useVendorAuthStore.persist.hasHydrated()) {
  useVendorAuthStore.setState({ _hasHydrated: true });
}
