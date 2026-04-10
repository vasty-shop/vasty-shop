/**
 * SubdomainRouter Component
 *
 * Handles routing for subdomain visits vs main domain visits.
 * When on a shop subdomain (e.g., myshop.vasty.shop), renders the PublicStorefront.
 * Otherwise, renders the normal app routes.
 */

import React from 'react';
import { useSubdomainShop } from '@/hooks/useSubdomainShop';
import { PublicStorefront } from '@/features/storefront';
import { Loader2 } from 'lucide-react';

interface SubdomainRouterProps {
  children: React.ReactNode;
}

/**
 * Loading state while detecting subdomain
 */
const SubdomainLoading: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin text-violet-600 mx-auto mb-4" />
      <p className="text-gray-600">Loading store...</p>
    </div>
  </div>
);

/**
 * Error state when shop not found
 */
const SubdomainNotFound: React.FC<{ subdomain: string }> = ({ subdomain }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center max-w-md px-4">
      <div className="text-6xl mb-4">🏪</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Store Not Found</h1>
      <p className="text-gray-600 mb-6">
        The store "{subdomain}" doesn't exist or is currently unavailable.
      </p>
      <a
        href={`https://${import.meta.env.VITE_DOMAIN || 'vasty.shop'}`}
        className="inline-flex items-center justify-center px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
      >
        Go to Main Site
      </a>
    </div>
  </div>
);

/**
 * SubdomainRouter - Conditionally renders based on subdomain detection
 */
export const SubdomainRouter: React.FC<SubdomainRouterProps> = ({ children }) => {
  const { isSubdomain, subdomain, shop, isLoading, error } = useSubdomainShop();

  // Still detecting subdomain
  if (isLoading) {
    return <SubdomainLoading />;
  }

  // Not a subdomain visit - render normal app
  if (!isSubdomain) {
    return <>{children}</>;
  }

  // Subdomain visit but shop not found
  if (error || !shop) {
    return <SubdomainNotFound subdomain={subdomain || 'unknown'} />;
  }

  // Subdomain visit with valid shop - render storefront
  // Pass shop ID to PublicStorefront
  return <PublicStorefront shopIdOverride={shop.id} />;
};

export default SubdomainRouter;
