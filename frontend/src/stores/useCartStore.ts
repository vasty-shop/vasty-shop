import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product, Size } from '@/types';
import { api } from '@/lib/api';
import { TokenManager } from '@/lib/token-manager';
import { toast } from 'sonner';

interface CartStore {
  items: CartItem[];
  loading: boolean;
  syncing: boolean;
  lastSyncedAt: Date | null;
  addItem: (product: Product, size: Size, color?: string) => Promise<void>;
  removeItem: (productId: string, size: Size) => Promise<void>;
  updateQuantity: (productId: string, size: Size, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  syncWithBackend: () => Promise<void>;
  fetchCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<any>;
  removeCoupon: (code: string) => Promise<any>;
}

const isAuthenticated = () => TokenManager.hasToken();

// Helper to convert backend cart items to store format
const mapBackendCartToStore = (backendCart: any): CartItem[] => {
  if (!backendCart?.items) return [];

  return backendCart.items.map((item: any) => {
    // Backend stores product info flat on the item, not nested
    // Map it to the nested product structure the frontend expects
    const product = item.product ? {
      ...item.product,
      shopId: item.shopId || item.shop_id || item.product?.shopId || item.product?.shop_id,
    } : {
      // Map flat backend structure to nested product
      id: item.productId || item.product_id,
      name: item.name || 'Unknown Product',
      images: item.image ? [item.image] : [],
      price: item.price || 0,
      salePrice: item.salePrice || item.sale_price,
      brand: item.brand || item.shopName || 'Unknown Brand',
      shopId: item.shopId || item.shop_id,
      stock: item.stock ?? 99,
    };

    return {
      product,
      size: item.size || item.variant?.size || 'M', // Default size if not provided
      color: item.color || item.variant?.color,
      quantity: item.quantity || 1,
    };
  });
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      syncing: false,
      lastSyncedAt: null,

      // Fetch cart from backend
      fetchCart: async () => {
        if (!isAuthenticated()) return;

        set({ loading: true });
        try {
          const backendCart = await api.getCart();
          const items = mapBackendCartToStore(backendCart);
          set({ items, lastSyncedAt: new Date(), loading: false });
        } catch (error: any) {
          console.error('Failed to fetch cart:', error);
          set({ loading: false });
          // Keep local cart if backend fetch fails
        }
      },

      // Sync local cart with backend
      syncWithBackend: async () => {
        if (!isAuthenticated()) return;

        const { items, syncing } = get();
        if (syncing) return; // Prevent concurrent syncs

        set({ syncing: true });
        try {
          // Fetch backend cart
          const backendCart = await api.getCart();
          const backendItems = mapBackendCartToStore(backendCart);

          // Merge logic: local cart takes precedence for authenticated users
          // In a real app, you might want more sophisticated merge logic
          if (items.length > 0 && backendItems.length === 0) {
            // Push local items to backend
            for (const item of items) {
              try {
                await api.addToCart(item.product.id, item.quantity, item.size, item.color);
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
          console.error('Failed to sync cart:', error);
          set({ syncing: false });
        }
      },

      addItem: async (product, size, color) => {
        // Optimistic update
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product.id === product.id && item.size === size
          );

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id && item.size === size
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }

          return {
            items: [...state.items, { product, size, color, quantity: 1 }],
          };
        });

        // Sync with backend if authenticated
        if (isAuthenticated()) {
          try {
            await api.addToCart(product.id, 1, size, color);
            set({ lastSyncedAt: new Date() });
          } catch (error: any) {
            console.error('Failed to add item to backend cart:', error);
            toast.error('Failed to update cart', {
              description: 'Your cart will be updated when you go online',
            });
          }
        }
      },

      removeItem: async (productId, size) => {
        const { items } = get();
        const itemToRemove = items.find(
          (item) => item.product.id === productId && item.size === size
        );

        // Optimistic update
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.product.id === productId && item.size === size)
          ),
        }));

        // Sync with backend if authenticated
        if (isAuthenticated() && itemToRemove) {
          try {
            // Backend expects itemId, we'll need to fetch cart to get the item ID
            // For now, we'll use the product ID (this might need adjustment based on backend)
            await api.removeFromCart(productId);
            set({ lastSyncedAt: new Date() });
          } catch (error: any) {
            console.error('Failed to remove item from backend cart:', error);
            // Rollback on error
            set((state) => ({
              items: [...state.items, itemToRemove],
            }));
            toast.error('Failed to update cart', {
              description: error.response?.data?.message || 'Please try again',
            });
          }
        }
      },

      updateQuantity: async (productId, size, quantity) => {
        const { items } = get();
        const oldItem = items.find(
          (item) => item.product.id === productId && item.size === size
        );

        if (quantity <= 0) {
          await get().removeItem(productId, size);
          return;
        }

        // Optimistic update
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId && item.size === size
              ? { ...item, quantity }
              : item
          ),
        }));

        // Sync with backend if authenticated
        if (isAuthenticated()) {
          try {
            await api.updateCartItem(productId, quantity);
            set({ lastSyncedAt: new Date() });
          } catch (error: any) {
            console.error('Failed to update item quantity in backend:', error);
            // Rollback on error
            if (oldItem) {
              set((state) => ({
                items: state.items.map((item) =>
                  item.product.id === productId && item.size === size
                    ? { ...item, quantity: oldItem.quantity }
                    : item
                ),
              }));
            }
            toast.error('Failed to update quantity', {
              description: error.response?.data?.message || 'Please try again',
            });
          }
        }
      },

      clearCart: async () => {
        const { items } = get();

        // Optimistic update
        set({ items: [] });

        // Sync with backend if authenticated
        if (isAuthenticated()) {
          try {
            await api.clearCart();
            set({ lastSyncedAt: new Date() });
          } catch (error: any) {
            console.error('Failed to clear cart in backend:', error);
            // Rollback on error
            set({ items });
            toast.error('Failed to clear cart', {
              description: error.response?.data?.message || 'Please try again',
            });
          }
        }
      },

      applyCoupon: async (code: string) => {
        if (!isAuthenticated()) {
          toast.error('Please login', {
            description: 'You need to be logged in to apply coupons',
          });
          throw new Error('Not authenticated');
        }

        try {
          const result = await api.applyCoupon(code);
          toast.success('Coupon applied!', {
            description: `You saved ${result.discount}`,
          });
          return result;
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Invalid coupon code';
          toast.error('Failed to apply coupon', {
            description: errorMessage,
          });
          throw error;
        }
      },

      removeCoupon: async (code: string) => {
        if (!isAuthenticated()) return;

        try {
          await api.removeCoupon(code);
          toast.success('Coupon removed');
        } catch (error: any) {
          console.error('Failed to remove coupon:', error);
          toast.error('Failed to remove coupon');
          throw error;
        }
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const price = item.product.salePrice || item.product.price;
          return total + price * item.quantity;
        }, 0);
      },
    }),
    {
      name: 'cart-storage',
      // Don't persist loading and syncing states
      partialize: (state) => ({
        items: state.items,
        lastSyncedAt: state.lastSyncedAt,
      }),
    }
  )
);
