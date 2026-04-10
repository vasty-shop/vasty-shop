/**
 * useActiveShop Hook
 *
 * Determines the active shop context for vendor pages by checking both:
 * 1. useVendorAuthStore (for vendor-authenticated users)
 * 2. useShopStore (for customer-authenticated users who created shops)
 *
 * This hook should be used in all vendor pages to properly handle
 * shop context regardless of how the user authenticated.
 */

import { useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useVendorAuthStore } from '../stores/useVendorAuthStore';
import { useShopStore } from '../stores/useShopStore';
import { extractRouteContext } from '../lib/navigation-utils';

interface UseActiveShopReturn {
  shop: any | null;
  shopId: string | null;
  isLoading: boolean;
  hasShops: boolean;
  error: string | null;
}

export const useActiveShop = (): UseActiveShopReturn => {
  const params = useParams();
  const { shopId } = extractRouteContext(params);

  // Get shop from vendor auth store
  const { shop: vendorShop } = useVendorAuthStore();

  // Get shops from customer shop store
  const {
    shops: userShops,
    currentShop,
    fetchUserShops,
    isLoading: shopsLoading,
    error: shopError
  } = useShopStore();

  // Fetch user shops if not loaded and no vendor shop
  useEffect(() => {
    if (!vendorShop && userShops.length === 0 && !shopsLoading) {
      fetchUserShops();
    }
  }, [vendorShop, userShops.length, shopsLoading, fetchUserShops]);

  // Determine the active shop - check both stores
  // Priority: 1. Match shopId from URL with vendorShop, 2. Match with userShops, 3. Use currentShop
  const shop = useMemo(() => {
    console.log('[useActiveShop] Finding shop:', { shopId, vendorShop: vendorShop?.id, currentShop: currentShop?.id, userShops: userShops.length });

    // If vendor is authenticated and their shop matches the URL
    if (vendorShop?.id === shopId) {
      console.log('[useActiveShop] Found in vendorShop');
      return vendorShop;
    }
    // Check if shopId matches any shop in userShops
    const matchedShop = userShops.find(s => s.id === shopId);
    if (matchedShop) {
      console.log('[useActiveShop] Found in userShops');
      return matchedShop;
    }
    // Fall back to currentShop if it matches
    if (currentShop?.id === shopId) {
      console.log('[useActiveShop] Found in currentShop');
      return currentShop;
    }
    // If currentShop exists but ID doesn't match, still use it if we're in vendor context
    // This handles cases where VendorLayout just loaded the shop
    if (currentShop && shopId) {
      console.log('[useActiveShop] Using currentShop as fallback:', currentShop.id);
      return currentShop;
    }
    // Last resort: return vendorShop if available
    console.log('[useActiveShop] Falling back to vendorShop');
    return vendorShop;
  }, [vendorShop, userShops, currentShop, shopId]);

  const hasShops = userShops.length > 0 || !!vendorShop;

  return {
    shop,
    shopId,
    isLoading: shopsLoading,
    hasShops,
    error: shopError
  };
};
