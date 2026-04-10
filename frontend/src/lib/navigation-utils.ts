import { useCurrentShop } from '../stores/useShopStore';

/**
 * Extracts shop context from React Router params
 * @param params - The params object from useParams()
 * @returns Object containing shopId
 *
 * @example
 * const params = useParams();
 * const { shopId } = extractRouteContext(params);
 */
export function extractRouteContext(params: Record<string, string | undefined>) {
  return {
    shopId: params.shopId || ''
  };
}

/**
 * Constructs a shop-aware URL for vendor routes
 * @param shopId - The shop identifier
 * @param path - The path within the vendor section (e.g., 'dashboard', 'products')
 * @returns The full path including shop context (e.g., '/shop/123/vendor/dashboard')
 */
export const getShopUrl = (shopId: string, path: string): string => {
  // Remove leading slash from path if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // Construct the shop-aware URL
  return `/shop/${shopId}/vendor/${cleanPath}`;
};

/**
 * Extracts the current shop ID from the URL pathname
 * @param pathname - The current URL pathname (defaults to window.location.pathname)
 * @returns The shop ID if found, null otherwise
 */
export const getCurrentShopId = (pathname?: string): string | null => {
  const path = pathname || (typeof window !== 'undefined' ? window.location.pathname : '');

  // Match pattern: /shop/:shopId/vendor/...
  const match = path.match(/^\/shop\/([^/]+)\/vendor/);

  return match ? match[1] : null;
};

/**
 * Navigates to a shop-aware vendor route
 * @param shopId - The shop identifier
 * @param path - The path within the vendor section
 * @param navigate - The react-router navigate function
 */
export const navigateToShop = (
  shopId: string,
  path: string,
  navigate: (path: string) => void
): void => {
  const url = getShopUrl(shopId, path);
  navigate(url);
};

/**
 * Hook to get shop-aware navigation utilities
 * Uses the current shop from the store if no shopId is provided
 */
export const useShopNavigation = () => {
  const currentShop = useCurrentShop();

  return {
    /**
     * Get a shop-aware URL using the current shop ID
     */
    getUrl: (path: string): string => {
      if (!currentShop?.id) {
        throw new Error('No current shop ID available');
      }
      return getShopUrl(currentShop.id, path);
    },

    /**
     * Navigate to a shop-aware route using the current shop ID
     */
    navigate: (path: string, navigateFn: (path: string) => void): void => {
      if (!currentShop?.id) {
        throw new Error('No current shop ID available');
      }
      navigateToShop(currentShop.id, path, navigateFn);
    },

    /**
     * Get the current shop ID
     */
    shopId: currentShop?.id || null
  };
};

/**
 * Validates if a shop ID is present in the URL and matches expectations
 * @param pathname - The current URL pathname
 * @param expectedShopId - Optional expected shop ID to validate against
 * @returns True if valid, false otherwise
 */
export const isValidShopUrl = (pathname: string, expectedShopId?: string): boolean => {
  const shopId = getCurrentShopId(pathname);

  if (!shopId) return false;
  if (expectedShopId && shopId !== expectedShopId) return false;

  return true;
};
