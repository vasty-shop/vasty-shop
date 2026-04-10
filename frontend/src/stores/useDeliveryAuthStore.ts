import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DeliveryMan } from '@/features/delivery/types/delivery.types';
import { TokenManager } from '@/lib/token-manager';

interface DeliveryAuthStore {
  // State
  deliveryMan: DeliveryMan | null;
  token: string | null;
  isAuthenticated: boolean;

  // Actions
  setDeliveryMan: (deliveryMan: DeliveryMan | null) => void;
  setToken: (token: string | null) => void;
  login: (deliveryMan: DeliveryMan, token: string) => void;
  logout: () => void;
  updateProfile: (updates: Partial<DeliveryMan>) => void;
  updateAvailability: (availability: DeliveryMan['availability']) => void;
  updateLocation: (location: DeliveryMan['currentLocation']) => void;
}

export const useDeliveryAuthStore = create<DeliveryAuthStore>()(
  persist(
    (set) => ({
      // Initial state
      deliveryMan: null,
      token: null,
      isAuthenticated: false,

      // Set delivery man
      setDeliveryMan: (deliveryMan) =>
        set({
          deliveryMan,
          isAuthenticated: !!deliveryMan,
        }),

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
      login: (deliveryMan, token) => {
        // Sync token with TokenManager for API client
        if (token) {
          TokenManager.setToken(token);
        }

        set({
          deliveryMan,
          token,
          isAuthenticated: true,
        });
      },

      // Logout
      logout: () => {
        // Clear TokenManager
        TokenManager.clearAll();

        // Clear all auth storages to prevent session conflicts
        localStorage.removeItem('delivery-auth-storage');
        localStorage.removeItem('vendor-auth-storage');

        set({
          deliveryMan: null,
          token: null,
          isAuthenticated: false,
        });

        console.log('[DeliveryAuthStore] Logout complete');
      },

      // Update profile info
      updateProfile: (updates) =>
        set((state) => ({
          deliveryMan: state.deliveryMan ? { ...state.deliveryMan, ...updates } : null,
        })),

      // Update availability status
      updateAvailability: (availability) =>
        set((state) => ({
          deliveryMan: state.deliveryMan ? { ...state.deliveryMan, availability } : null,
        })),

      // Update location
      updateLocation: (currentLocation) =>
        set((state) => ({
          deliveryMan: state.deliveryMan ? { ...state.deliveryMan, currentLocation } : null,
        })),
    }),
    {
      name: 'delivery-auth-storage',
      partialize: (state) => ({
        deliveryMan: state.deliveryMan,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => {
        // console.log('[DeliveryAuthStore] Starting rehydration');
        return (state, error) => {
          if (error) {
            console.error('[DeliveryAuthStore] Rehydration error:', error);
            return;
          }
          if (state?.token) {
            console.log('[DeliveryAuthStore] Rehydrating token to TokenManager');
            TokenManager.setToken(state.token);
          } else {
            // console.log('[DeliveryAuthStore] No token to rehydrate');
          }
        };
      },
    }
  )
);
