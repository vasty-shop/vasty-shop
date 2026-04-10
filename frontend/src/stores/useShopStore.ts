/**
 * Shop Context Store
 * Manages the current shop context for vendor operations
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { VendorShop } from '@/features/vendor-auth/types';
import { api } from '@/lib/api';

interface ShopStore {
  // State
  currentShop: VendorShop | null;
  shops: VendorShop[];
  ownedShopsCount: number; // Count of shops owned by user (for limit checking)
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentShop: (shop: VendorShop | null) => void;
  setShops: (shops: VendorShop[]) => void;
  switchShop: (shopId: string) => void;
  fetchUserShops: () => Promise<void>;
  clearShopContext: () => void;
  addShop: (shop: VendorShop) => void;
  updateShop: (shopId: string, updates: Partial<VendorShop>) => void;
  removeShop: (shopId: string) => void;
}

export const useShopStore = create<ShopStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentShop: null,
      shops: [],
      ownedShopsCount: 0,
      isLoading: false,
      error: null,

      // Set current shop
      setCurrentShop: (shop) => {
        set({ currentShop: shop, error: null });
      },

      // Set shops list
      setShops: (shops) => {
        set({ shops, error: null });
      },

      // Switch to a different shop
      switchShop: (shopId) => {
        const { shops } = get();
        const shop = shops.find((s) => s.id === shopId);

        if (shop) {
          set({ currentShop: shop, error: null });
        } else {
          set({ error: `Shop with ID ${shopId} not found` });
        }
      },

      // Fetch user's shops from API
      fetchUserShops: async () => {
        set({ isLoading: true, error: null });

        try {
          // Use my-shops endpoint which works for any authenticated user
          const response = await api.getMyShops();

          // Extract shops from response - handle different response formats
          // Backend returns: { owned: { data: [...] }, member: { data: [...] }, total: ... }
          let shops: VendorShop[] = [];
          let ownedShopsCount = 0;

          if (Array.isArray(response)) {
            shops = response;
            ownedShopsCount = response.length; // Assume all are owned if array
          } else if (response?.owned || response?.member) {
            // Handle my-shops endpoint format
            const ownedShops = response.owned?.data || [];
            const memberShops = response.member?.data || [];
            shops = [...ownedShops, ...memberShops];
            ownedShopsCount = ownedShops.length; // Only count owned shops for limits
          } else if (response?.data && Array.isArray(response.data)) {
            shops = response.data;
            ownedShopsCount = response.data.length;
          } else if (response?.shops && Array.isArray(response.shops)) {
            shops = response.shops;
            ownedShopsCount = response.shops.length;
          }

          console.log(`[ShopStore] Fetched ${shops.length} total shops, ${ownedShopsCount} owned`);

          set({
            shops,
            ownedShopsCount,
            isLoading: false,
            // Set first shop as current if none is selected
            currentShop: get().currentShop || shops[0] || null
          });
        } catch (error) {
          console.error('[ShopStore] Failed to fetch shops:', error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch shops';
          set({
            error: errorMessage,
            isLoading: false
          });
        }
      },

      // Clear shop context (on logout)
      clearShopContext: () => {
        set({
          currentShop: null,
          shops: [],
          ownedShopsCount: 0,
          isLoading: false,
          error: null,
        });
      },

      // Add a shop (new shop is always owned by current user)
      addShop: (shop) => {
        set((state) => ({
          shops: [...state.shops, shop],
          ownedShopsCount: state.ownedShopsCount + 1,
        }));
      },

      // Update shop
      updateShop: (shopId, updates) => {
        set((state) => ({
          shops: state.shops.map(shop =>
            shop.id === shopId ? { ...shop, ...updates } : shop
          ),
          currentShop: state.currentShop?.id === shopId
            ? { ...state.currentShop, ...updates }
            : state.currentShop
        }));
      },

      // Remove shop
      removeShop: (shopId) => {
        set((state) => ({
          shops: state.shops.filter(shop => shop.id !== shopId),
          currentShop: state.currentShop?.id === shopId ? null : state.currentShop
        }));
      }
    }),
    {
      name: 'shop-context-storage',
      partialize: (state) => ({
        currentShop: state.currentShop,
        shops: state.shops,
        ownedShopsCount: state.ownedShopsCount,
      }),
    }
  )
);

// Selector hooks for convenient access
export const useCurrentShop = () => useShopStore((state) => state.currentShop);
export const useShops = () => useShopStore((state) => state.shops);
export const useOwnedShopsCount = () => useShopStore((state) => state.ownedShopsCount);
export const useShopLoading = () => useShopStore((state) => state.isLoading);
export const useShopError = () => useShopStore((state) => state.error);
