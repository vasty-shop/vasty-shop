import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types';
import { api } from '@/lib/api';
import { TokenManager } from '@/lib/token-manager';
import { toast } from 'sonner';

export interface WishlistItem {
  product: Product;
  addedAt: Date;
  priceAtAdd: number; // Track price when added for price drop detection
}

interface WishlistStore {
  items: WishlistItem[];
  loading: boolean;
  syncing: boolean;
  lastSyncedAt: Date | null;
  addItem: (product: Product) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  toggleItem: (product: Product) => Promise<void>;
  clearWishlist: () => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  getTotalItems: () => number;
  removeMultipleItems: (productIds: string[]) => Promise<void>;
  syncWithBackend: () => Promise<void>;
  fetchWishlist: () => Promise<void>;
}

const isAuthenticated = () => TokenManager.hasToken();

// Helper to convert backend wishlist items to store format
const mapBackendWishlistToStore = (backendWishlist: any): WishlistItem[] => {
  if (!backendWishlist?.items) return [];

  return backendWishlist.items.map((item: any) => ({
    product: item.product,
    addedAt: item.addedAt ? new Date(item.addedAt) : new Date(),
    priceAtAdd: item.priceAtAdd || item.product.salePrice || item.product.price,
  }));
};

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      syncing: false,
      lastSyncedAt: null,

      // Fetch wishlist from backend
      fetchWishlist: async () => {
        if (!isAuthenticated()) return;

        set({ loading: true });
        try {
          const backendWishlist = await api.getWishlist();
          const items = mapBackendWishlistToStore(backendWishlist);
          set({ items, lastSyncedAt: new Date(), loading: false });
        } catch (error: any) {
          console.error('Failed to fetch wishlist:', error);
          set({ loading: false });
          // Keep local wishlist if backend fetch fails
        }
      },

      // Sync local wishlist with backend
      syncWithBackend: async () => {
        if (!isAuthenticated()) return;

        const { items, syncing } = get();
        if (syncing) return; // Prevent concurrent syncs

        set({ syncing: true });
        try {
          // Fetch backend wishlist
          const backendWishlist = await api.getWishlist();
          const backendItems = mapBackendWishlistToStore(backendWishlist);

          // Merge logic: local wishlist takes precedence for authenticated users
          if (items.length > 0 && backendItems.length === 0) {
            // Push local items to backend
            for (const item of items) {
              try {
                await api.addToWishlist(item.product.id);
              } catch (error) {
                console.error('Failed to sync item to backend:', error);
              }
            }
          } else if (backendItems.length > 0) {
            // Use backend items as source of truth
            set({ items: backendItems });
          }

          set({ lastSyncedAt: new Date(), syncing: false });
        } catch (error: any) {
          console.error('Failed to sync wishlist:', error);
          set({ syncing: false });
        }
      },

      addItem: async (product) => {
        const existingItem = get().items.find(
          (item) => item.product.id === product.id
        );

        if (existingItem) {
          return; // Already in wishlist
        }

        // Optimistic update
        set((state) => ({
          items: [
            ...state.items,
            {
              product,
              addedAt: new Date(),
              priceAtAdd: product.salePrice || product.price,
            },
          ],
        }));

        // Sync with backend if authenticated
        if (isAuthenticated()) {
          try {
            await api.addToWishlist(product.id);
            set({ lastSyncedAt: new Date() });
            toast.success('Added to wishlist', {
              description: `${product.name} has been added to your wishlist`,
            });
          } catch (error: any) {
            console.error('Failed to add item to backend wishlist:', error);
            // Rollback on error
            set((state) => ({
              items: state.items.filter((item) => item.product.id !== product.id),
            }));
            toast.error('Failed to add to wishlist', {
              description: error.response?.data?.message || 'Please try again',
            });
          }
        } else {
          toast.success('Added to wishlist', {
            description: `${product.name} has been added to your wishlist`,
          });
        }
      },

      removeItem: async (productId) => {
        const { items } = get();
        const itemToRemove = items.find((item) => item.product.id === productId);

        // Optimistic update
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));

        // Sync with backend if authenticated
        if (isAuthenticated() && itemToRemove) {
          try {
            // Backend expects itemId, we'll use product ID (might need adjustment)
            await api.removeFromWishlist(productId);
            set({ lastSyncedAt: new Date() });
          } catch (error: any) {
            console.error('Failed to remove item from backend wishlist:', error);
            // Rollback on error
            set((state) => ({
              items: [...state.items, itemToRemove],
            }));
            toast.error('Failed to remove from wishlist', {
              description: error.response?.data?.message || 'Please try again',
            });
          }
        }
      },

      toggleItem: async (product) => {
        const isInWishlist = get().isInWishlist(product.id);
        if (isInWishlist) {
          await get().removeItem(product.id);
        } else {
          await get().addItem(product);
        }
      },

      clearWishlist: async () => {
        const { items } = get();

        // Optimistic update
        set({ items: [] });

        // Sync with backend if authenticated
        if (isAuthenticated()) {
          try {
            // Clear all items from backend
            for (const item of items) {
              await api.removeFromWishlist(item.product.id);
            }
            set({ lastSyncedAt: new Date() });
            toast.success('Wishlist cleared');
          } catch (error: any) {
            console.error('Failed to clear wishlist in backend:', error);
            // Rollback on error
            set({ items });
            toast.error('Failed to clear wishlist', {
              description: error.response?.data?.message || 'Please try again',
            });
          }
        } else {
          toast.success('Wishlist cleared');
        }
      },

      isInWishlist: (productId) => {
        return get().items.some((item) => item.product.id === productId);
      },

      getTotalItems: () => {
        return get().items.length;
      },

      removeMultipleItems: async (productIds) => {
        const { items } = get();
        const itemsToRemove = items.filter((item) =>
          productIds.includes(item.product.id)
        );

        // Optimistic update
        set((state) => ({
          items: state.items.filter(
            (item) => !productIds.includes(item.product.id)
          ),
        }));

        // Sync with backend if authenticated
        if (isAuthenticated()) {
          try {
            // Remove multiple items from backend
            for (const productId of productIds) {
              await api.removeFromWishlist(productId);
            }
            set({ lastSyncedAt: new Date() });
            toast.success('Items removed from wishlist');
          } catch (error: any) {
            console.error('Failed to remove items from backend wishlist:', error);
            // Rollback on error
            set((state) => ({
              items: [...state.items, ...itemsToRemove],
            }));
            toast.error('Failed to remove items', {
              description: error.response?.data?.message || 'Please try again',
            });
          }
        } else {
          toast.success('Items removed from wishlist');
        }
      },
    }),
    {
      name: 'wishlist-storage',
      // Don't persist loading and syncing states
      partialize: (state) => ({
        items: state.items,
        lastSyncedAt: state.lastSyncedAt,
      }),
    }
  )
);
