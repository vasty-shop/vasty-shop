/**
 * StorefrontMobileNav - Mobile bottom navigation for storefronts
 * Store-specific, auth-aware navigation with cart/wishlist badges
 */

import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Home, ShoppingBag, ShoppingCart, Heart, User, LogIn } from 'lucide-react';
import { useStoreAuth } from '@/contexts/StoreAuthContext';
import { useCartStore } from '@/stores/useCartStore';
import { useWishlistStore } from '@/stores/useWishlistStore';
import { useStorefront } from '../StorefrontLayout';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  requiresAuth?: boolean;
  badge?: number;
}

export function StorefrontMobileNav() {
  const { shopId } = useParams<{ shopId: string }>();
  const location = useLocation();
  const { isStoreAuthenticated } = useStoreAuth();
  const { items: cartItems } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { theme } = useStorefront();

  if (!shopId) return null;

  const isAuthenticated = isStoreAuthenticated(shopId);

  // Count items for this shop only
  const cartCount = cartItems.filter(item => item.product?.shopId === shopId).length;
  const wishlistCount = wishlistItems.filter(item => item.product?.shopId === shopId).length;

  // Build navigation items based on auth state
  const navItems: NavItem[] = isAuthenticated
    ? [
        {
          id: 'home',
          label: 'Home',
          icon: <Home className="w-5 h-5" />,
          path: `/store/${shopId}`,
        },
        {
          id: 'products',
          label: 'Products',
          icon: <ShoppingBag className="w-5 h-5" />,
          path: `/store/${shopId}/products`,
        },
        {
          id: 'cart',
          label: 'Cart',
          icon: <ShoppingCart className="w-5 h-5" />,
          path: `/store/${shopId}/cart`,
          badge: cartCount,
        },
        {
          id: 'wishlist',
          label: 'Wishlist',
          icon: <Heart className="w-5 h-5" />,
          path: `/store/${shopId}/wishlist`,
          badge: wishlistCount,
        },
        {
          id: 'account',
          label: 'Account',
          icon: <User className="w-5 h-5" />,
          path: `/store/${shopId}/profile`,
        },
      ]
    : [
        {
          id: 'home',
          label: 'Home',
          icon: <Home className="w-5 h-5" />,
          path: `/store/${shopId}`,
        },
        {
          id: 'products',
          label: 'Products',
          icon: <ShoppingBag className="w-5 h-5" />,
          path: `/store/${shopId}/products`,
        },
        {
          id: 'login',
          label: 'Login',
          icon: <LogIn className="w-5 h-5" />,
          path: `/store/${shopId}/login`,
        },
      ];

  // Check if current path matches nav item
  const isActive = (path: string) => {
    if (path === `/store/${shopId}`) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const primaryColor = theme?.primaryColor || '#4F46E5';
  const textColor = theme?.textColor || '#1F2937';
  const bgColor = theme?.backgroundColor || '#FFFFFF';

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t shadow-lg"
      style={{
        backgroundColor: bgColor,
        borderColor: `${textColor}10`,
      }}
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const active = isActive(item.path);

          return (
            <Link
              key={item.id}
              to={item.path}
              className="flex flex-col items-center justify-center flex-1 h-full relative transition-colors"
              style={{
                color: active ? primaryColor : `${textColor}80`,
              }}
            >
              <div className="relative">
                {item.icon}
                {item.badge && item.badge > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
              {active && (
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                  style={{ backgroundColor: primaryColor }}
                />
              )}
            </Link>
          );
        })}
      </div>

      {/* Safe area padding for devices with home indicator */}
      <div className="h-safe-area-inset-bottom" style={{ backgroundColor: bgColor }} />
    </nav>
  );
}

export default StorefrontMobileNav;
