/**
 * useSubdomainShop Hook
 *
 * Detects if the app is running on a shop subdomain and fetches shop data.
 *
 * Production: myshop.vasty.shop → detects "myshop" subdomain
 * Development: localhost:4005?subdomain=myshop → uses query param fallback
 */

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

// Get subdomain suffix from env (e.g., ".vasty.shop")
const SUBDOMAIN_SUFFIX = import.meta.env.VITE_SHOP_SUBDOMAIN_SUFFIX || '.vasty.shop';
const MAIN_DOMAIN = import.meta.env.VITE_DOMAIN || 'vasty.shop';

export interface SubdomainShop {
  id: string;
  name: string;
  slug: string;
  subdomain: string;
  customDomain?: string;
  logo?: string;
  description?: string;
  isActive: boolean;
}

interface UseSubdomainShopReturn {
  isSubdomain: boolean;
  subdomain: string | null;
  shop: SubdomainShop | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Extract subdomain from hostname
 * Examples:
 * - myshop.vasty.shop → "myshop"
 * - www.vasty.shop → null (www is not a shop)
 * - vasty.shop → null
 * - api.vasty.shop → null (api is reserved)
 */
const extractSubdomain = (hostname: string): string | null => {
  // Reserved subdomains that are not shops
  const RESERVED_SUBDOMAINS = ['www', 'api', 'admin', 'app', 'mail', 'smtp', 'ftp'];

  // Check if hostname ends with subdomain suffix
  if (hostname.endsWith(SUBDOMAIN_SUFFIX.replace(/^\./, ''))) {
    // Extract the part before the suffix
    const prefix = hostname.replace(SUBDOMAIN_SUFFIX.replace(/^\./, ''), '').replace(/\.$/, '');

    // If there's a prefix and it's not reserved
    if (prefix && !RESERVED_SUBDOMAINS.includes(prefix.toLowerCase())) {
      return prefix.toLowerCase();
    }
  }

  // Check for exact main domain match
  if (hostname === MAIN_DOMAIN || hostname === `www.${MAIN_DOMAIN}`) {
    return null;
  }

  return null;
};

/**
 * Get subdomain from URL query param (for development)
 */
const getSubdomainFromQuery = (): string | null => {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  return params.get('subdomain');
};

/**
 * Hook to detect and load shop data for subdomain visits
 */
export const useSubdomainShop = (): UseSubdomainShopReturn => {
  const [isSubdomain, setIsSubdomain] = useState(false);
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const [shop, setShop] = useState<SubdomainShop | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const detectSubdomain = async () => {
      try {
        const hostname = window.location.hostname;

        // Try to extract subdomain from hostname first
        let detectedSubdomain = extractSubdomain(hostname);

        // Fallback to query param for development (localhost)
        if (!detectedSubdomain && (hostname === 'localhost' || hostname === '127.0.0.1')) {
          detectedSubdomain = getSubdomainFromQuery();
          if (detectedSubdomain) {
            console.log('[useSubdomainShop] Development mode - using query param:', detectedSubdomain);
          }
        }

        if (!detectedSubdomain) {
          // Not a subdomain visit
          setIsSubdomain(false);
          setSubdomain(null);
          setShop(null);
          setIsLoading(false);
          return;
        }

        console.log('[useSubdomainShop] Detected subdomain:', detectedSubdomain);
        setIsSubdomain(true);
        setSubdomain(detectedSubdomain);

        // Fetch shop data by subdomain
        try {
          const response = await apiClient.get<SubdomainShop | { data: SubdomainShop }>(`/shops/subdomain/${detectedSubdomain}`);
          // Handle both wrapped and unwrapped response formats
          const responseData = response.data;
          const shopData: SubdomainShop = 'data' in responseData && responseData.data
            ? responseData.data
            : responseData as SubdomainShop;

          if (shopData && shopData.isActive) {
            setShop(shopData);
            console.log('[useSubdomainShop] Shop loaded:', shopData);
          } else {
            setError(new Error('Shop not found or inactive'));
          }
        } catch (err) {
          console.error('[useSubdomainShop] Error fetching shop:', err);
          setError(err as Error);
        }
      } catch (err) {
        console.error('[useSubdomainShop] Error detecting subdomain:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    detectSubdomain();
  }, []);

  return {
    isSubdomain,
    subdomain,
    shop,
    isLoading,
    error,
  };
};

/**
 * Utility to build shop subdomain URL
 */
export const buildSubdomainUrl = (subdomain: string): string => {
  const isProduction = import.meta.env.PROD;

  if (isProduction) {
    return `https://${subdomain}${SUBDOMAIN_SUFFIX}`;
  }

  // Development - use query param
  const port = window.location.port ? `:${window.location.port}` : '';
  return `${window.location.protocol}//${window.location.hostname}${port}?subdomain=${subdomain}`;
};

export default useSubdomainShop;
