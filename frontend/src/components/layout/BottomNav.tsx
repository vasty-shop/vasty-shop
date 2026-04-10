import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, User, ShoppingBag, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/stores/useCartStore';

interface NavItem {
  name: string;
  icon: React.ElementType;
  route: string;
  badge?: number;
}

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const totalItems = useCartStore((state) => state.getTotalItems());

  const navItems: NavItem[] = [
    { name: 'Home', icon: Home, route: '/' },
    { name: 'Styling', icon: User, route: '/outfits' },
    { name: 'Cart', icon: ShoppingBag, route: '/cart', badge: totalItems },
    { name: 'Profile', icon: UserCircle, route: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-glass border-t border-gray-200 shadow-lg">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex justify-around h-20">
          {navItems.map((item) => {
            const isActive = location.pathname === item.route;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                to={item.route}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 flex-1 transition-colors relative',
                  isActive ? 'text-primary-lime' : 'text-text-secondary'
                )}
              >
                <div className="relative">
                  <Icon className="w-6 h-6" />
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-2 -right-2 bg-badge-sale text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-caption">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
