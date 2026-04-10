/**
 * ProtectedRoute - Route protection component
 * Supports customer, vendor, admin, and delivery_man authentication
 * Allows any authenticated user to access vendor routes if they have shops
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useVendorAuthStore } from '../../stores/useVendorAuthStore';
import { useDeliveryAuthStore } from '../../stores/useDeliveryAuthStore';
import { useShopStore } from '../../stores/useShopStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'customer' | 'vendor' | 'admin' | 'delivery_man';
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requireAuth = true,
}) => {
  const { isAuthenticated: customerAuthenticated, loading, user } = useAuth();
  const { isAuthenticated: vendorAuthenticated, vendor, shop: vendorShop } = useVendorAuthStore();
  const { isAuthenticated: deliveryAuthenticated, deliveryMan } = useDeliveryAuthStore();
  const { shops: userShops } = useShopStore();
  const location = useLocation();

  // Check if user is authenticated via any system
  const isAnyAuthenticated = customerAuthenticated || vendorAuthenticated || deliveryAuthenticated;

  // Route type checks
  const isVendorRoute = requiredRole === 'vendor';
  const isDeliveryRoute = requiredRole === 'delivery_man';
  const hasShops = userShops.length > 0;

  // Determine effective authentication based on route type
  let isAuthenticated = customerAuthenticated;
  if (isVendorRoute) {
    isAuthenticated = vendorAuthenticated || (customerAuthenticated && hasShops);
  } else if (isDeliveryRoute) {
    isAuthenticated = deliveryAuthenticated || customerAuthenticated;
  }

  // Determine current user based on auth type
  let currentUser: any = user;
  if (vendorAuthenticated) {
    currentUser = vendor;
  } else if (deliveryAuthenticated) {
    currentUser = deliveryMan;
  }

  // Show loading state while checking authentication (only for customer auth)
  if (loading && !vendorAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-lime mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // For vendor routes, if customer is authenticated but has no shops, redirect to create shop
    if (isVendorRoute && customerAuthenticated && !hasShops) {
      return <Navigate to="/vendor/create-shop" state={{ from: location }} replace />;
    }

    // All unauthenticated users go to single /login page
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role if specified (skip for vendor routes if customer has shops)
  if (requiredRole && currentUser && !(isVendorRoute && customerAuthenticated && hasShops)) {
    // Determine user role based on auth type
    let userRole: string | undefined;
    if (deliveryAuthenticated) {
      userRole = 'delivery_man';
    } else if (vendorAuthenticated) {
      userRole = (currentUser as any).role || 'vendor';
    } else {
      userRole = (currentUser as any).metadata?.role || (currentUser as any).role;
    }

    // console.log('[ProtectedRoute] Role check:', {
    //   requiredRole,
    //   userRole,
    //   isVendorRoute,
    //   isDeliveryRoute,
    //   vendorAuthenticated,
    //   deliveryAuthenticated,
    //   customerAuthenticated,
    //   hasShops
    // });

    // SPECIAL CASE: If vendor route and user is authenticated via vendorAuth,
    // trust that they are a vendor even if role field is missing
    if (isVendorRoute && vendorAuthenticated) {
      // Vendor authenticated via vendorAuth, allowing access
    } else if (isDeliveryRoute && deliveryAuthenticated) {
      // Delivery authenticated via deliveryAuth, allowing access
    } else if (userRole !== requiredRole) {
      console.warn('[ProtectedRoute] Role mismatch. Required:', requiredRole, 'Got:', userRole);

      // Redirect to appropriate dashboard based on role
      let redirectPath = '/';
      if (userRole === 'vendor' && vendorShop?.id) {
        redirectPath = `/shop/${vendorShop.id}/vendor/dashboard`;
      } else if (userRole === 'vendor') {
        redirectPath = '/vendor/create-shop';
      } else if (userRole === 'delivery_man' && deliveryMan?.id) {
        redirectPath = `/delivery/${deliveryMan.id}/dashboard`;
      } else if (userRole === 'delivery_man') {
        redirectPath = '/login';
      }
      return <Navigate to={redirectPath} replace />;
    }
  }

  // console.log('[ProtectedRoute] Access granted to:', location.pathname);

  return <>{children}</>;
};
