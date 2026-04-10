import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Represents a single breadcrumb item in the navigation trail
 */
export interface BreadcrumbItem {
  /** Display text for the breadcrumb */
  label: string;
  /** Optional URL - if not provided, item is not clickable */
  href?: string;
  /** Optional icon to display alongside the label */
  icon?: React.ReactNode;
}

/**
 * Props for the BreadcrumbNavigation component
 */
export interface BreadcrumbNavigationProps {
  /** Array of breadcrumb items to display */
  items: BreadcrumbItem[];
  /** Optional className for custom styling */
  className?: string;
  /** Show/hide the home icon (default: true) */
  showHomeIcon?: boolean;
  /** Custom home path (default: '/') */
  homePath?: string;
  /** Custom separator (default: ChevronRight icon) */
  separator?: React.ReactNode;
}

/**
 * A reusable breadcrumb navigation component for displaying hierarchical page location
 *
 * @example
 * ```tsx
 * <BreadcrumbNavigation
 *   items={[
 *     { label: 'Products', href: '/products' },
 *     { label: 'Men\'s Fashion', href: '/products/mens' },
 *     { label: 'Premium Wool Overcoat' }
 *   ]}
 * />
 * ```
 */
export const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({
  items,
  className,
  showHomeIcon = true,
  homePath = '/',
  separator,
}) => {
  // Default separator
  const defaultSeparator = <ChevronRight className="w-4 h-4 text-text-secondary" />;
  const separatorElement = separator || defaultSeparator;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        'flex items-center py-3 px-4 md:px-0',
        'overflow-x-auto scrollbar-hide',
        className
      )}
    >
      <ol className="flex items-center flex-wrap gap-2 min-w-max">
        {/* Home Link */}
        <li className="flex items-center">
          <Link
            to={homePath}
            className={cn(
              'flex items-center gap-1.5 text-sm font-medium',
              'text-text-secondary hover:text-primary-lime',
              'transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary-lime focus:ring-offset-2 rounded-md',
              'px-2 py-1 -mx-2 -my-1'
            )}
            aria-label="Home"
          >
            {showHomeIcon && <Home className="w-4 h-4" />}
            <span className="hidden sm:inline">Home</span>
          </Link>
        </li>

        {/* Breadcrumb Items */}
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isClickable = !isLast && item.href;

          return (
            <React.Fragment key={`${item.label}-${index}`}>
              {/* Separator */}
              <li
                className="flex items-center"
                aria-hidden="true"
              >
                {separatorElement}
              </li>

              {/* Breadcrumb Item */}
              <li className="flex items-center">
                {isClickable ? (
                  <Link
                    to={item.href!}
                    className={cn(
                      'flex items-center gap-1.5 text-sm font-medium',
                      'text-text-secondary hover:text-primary-lime',
                      'transition-colors duration-200',
                      'focus:outline-none focus:ring-2 focus:ring-primary-lime focus:ring-offset-2 rounded-md',
                      'px-2 py-1 -mx-2 -my-1',
                      'truncate max-w-[150px] sm:max-w-none'
                    )}
                  >
                    {item.icon && (
                      <span className="flex-shrink-0">{item.icon}</span>
                    )}
                    <span className="truncate">{item.label}</span>
                  </Link>
                ) : (
                  <span
                    className={cn(
                      'flex items-center gap-1.5 text-sm font-semibold',
                      'text-text-primary',
                      'truncate max-w-[150px] sm:max-w-[250px] md:max-w-none',
                      'px-2 -mx-2'
                    )}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item.icon && (
                      <span className="flex-shrink-0">{item.icon}</span>
                    )}
                    <span className="truncate">{item.label}</span>
                  </span>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

export default BreadcrumbNavigation;
