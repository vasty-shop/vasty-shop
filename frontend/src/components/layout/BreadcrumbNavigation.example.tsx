import React from 'react';
import { BreadcrumbNavigation } from './BreadcrumbNavigation';
import { ShoppingBag, Shirt, Package } from 'lucide-react';

/**
 * Example usage demonstrations for the BreadcrumbNavigation component
 */
export const BreadcrumbNavigationExamples: React.FC = () => {
  return (
    <div className="space-y-8 p-8 bg-gray-50">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-text-primary">Breadcrumb Navigation Examples</h2>
        <p className="text-text-secondary">
          Various usage examples of the BreadcrumbNavigation component
        </p>
      </div>

      {/* Example 1: Basic Product Navigation */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Example 1: Basic Product Navigation
        </h3>
        <BreadcrumbNavigation
          items={[
            { label: 'Products', href: '/products' },
            { label: "Men's Fashion", href: '/products/mens' },
            { label: 'Premium Wool Overcoat' },
          ]}
        />
        <pre className="mt-4 p-4 bg-gray-100 rounded text-sm overflow-x-auto">
{`<BreadcrumbNavigation
  items={[
    { label: 'Products', href: '/products' },
    { label: "Men's Fashion", href: '/products/mens' },
    { label: 'Premium Wool Overcoat' },
  ]}
/>`}
        </pre>
      </div>

      {/* Example 2: Category Navigation */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Example 2: Multi-level Category Navigation
        </h3>
        <BreadcrumbNavigation
          items={[
            { label: 'Categories', href: '/categories' },
            { label: 'Electronics', href: '/categories/electronics' },
            { label: 'Laptops', href: '/categories/electronics/laptops' },
            { label: 'Gaming Laptops' },
          ]}
        />
        <pre className="mt-4 p-4 bg-gray-100 rounded text-sm overflow-x-auto">
{`<BreadcrumbNavigation
  items={[
    { label: 'Categories', href: '/categories' },
    { label: 'Electronics', href: '/categories/electronics' },
    { label: 'Laptops', href: '/categories/electronics/laptops' },
    { label: 'Gaming Laptops' },
  ]}
/>`}
        </pre>
      </div>

      {/* Example 3: With Custom Icons */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Example 3: Breadcrumbs with Custom Icons
        </h3>
        <BreadcrumbNavigation
          items={[
            {
              label: 'Products',
              href: '/products',
              icon: <ShoppingBag className="w-4 h-4" />,
            },
            {
              label: 'Clothing',
              href: '/products/clothing',
              icon: <Shirt className="w-4 h-4" />,
            },
            {
              label: 'Winter Collection 2024',
              icon: <Package className="w-4 h-4" />,
            },
          ]}
        />
        <pre className="mt-4 p-4 bg-gray-100 rounded text-sm overflow-x-auto">
{`<BreadcrumbNavigation
  items={[
    {
      label: 'Products',
      href: '/products',
      icon: <ShoppingBag className="w-4 h-4" />,
    },
    {
      label: 'Clothing',
      href: '/products/clothing',
      icon: <Shirt className="w-4 h-4" />,
    },
    {
      label: 'Winter Collection 2024',
      icon: <Package className="w-4 h-4" />,
    },
  ]}
/>`}
        </pre>
      </div>

      {/* Example 4: Without Home Icon */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Example 4: Without Home Icon (Text Only)
        </h3>
        <BreadcrumbNavigation
          showHomeIcon={false}
          items={[
            { label: 'Blog', href: '/blog' },
            { label: 'Fashion Tips', href: '/blog/fashion-tips' },
            { label: 'How to Style Your Winter Wardrobe' },
          ]}
        />
        <pre className="mt-4 p-4 bg-gray-100 rounded text-sm overflow-x-auto">
{`<BreadcrumbNavigation
  showHomeIcon={false}
  items={[
    { label: 'Blog', href: '/blog' },
    { label: 'Fashion Tips', href: '/blog/fashion-tips' },
    { label: 'How to Style Your Winter Wardrobe' },
  ]}
/>`}
        </pre>
      </div>

      {/* Example 5: Long Breadcrumb (Responsive) */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Example 5: Long Breadcrumb Trail (Auto-truncates on Mobile)
        </h3>
        <BreadcrumbNavigation
          items={[
            { label: 'Categories', href: '/categories' },
            { label: 'Fashion & Apparel', href: '/categories/fashion' },
            { label: 'Women\'s Clothing', href: '/categories/fashion/womens' },
            { label: 'Dresses & Gowns', href: '/categories/fashion/womens/dresses' },
            { label: 'Evening Wear Collection', href: '/categories/fashion/womens/dresses/evening' },
            { label: 'Elegant Black Sequin Evening Gown with Sweetheart Neckline' },
          ]}
        />
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded text-sm">
          <p className="text-blue-800">
            <strong>Note:</strong> On mobile devices, long breadcrumb labels will automatically
            truncate to prevent overflow. The trail is also horizontally scrollable on very small screens.
          </p>
        </div>
      </div>

      {/* Example 6: Simple Two-Level */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Example 6: Simple Two-Level Navigation
        </h3>
        <BreadcrumbNavigation
          items={[
            { label: 'Products', href: '/products' },
            { label: 'New Arrivals' },
          ]}
        />
        <pre className="mt-4 p-4 bg-gray-100 rounded text-sm overflow-x-auto">
{`<BreadcrumbNavigation
  items={[
    { label: 'Products', href: '/products' },
    { label: 'New Arrivals' },
  ]}
/>`}
        </pre>
      </div>

      {/* Feature Highlights */}
      <div className="bg-gradient-to-r from-primary-lime/10 to-accent-blue/10 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Component Features
        </h3>
        <ul className="space-y-2 text-sm text-text-secondary">
          <li className="flex items-start gap-2">
            <span className="text-primary-lime font-bold">✓</span>
            <span><strong>Semantic HTML:</strong> Uses proper nav, ol, and li elements for accessibility</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-lime font-bold">✓</span>
            <span><strong>ARIA Labels:</strong> Includes aria-label and aria-current attributes</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-lime font-bold">✓</span>
            <span><strong>Keyboard Navigation:</strong> Fully accessible via keyboard with focus indicators</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-lime font-bold">✓</span>
            <span><strong>Responsive Design:</strong> Truncates on mobile, scrollable overflow</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-lime font-bold">✓</span>
            <span><strong>Vasty Branding:</strong> Uses primary-lime for hover states and text-secondary for inactive items</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-lime font-bold">✓</span>
            <span><strong>Customizable:</strong> Supports custom icons, separators, and home path</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-lime font-bold">✓</span>
            <span><strong>TypeScript:</strong> Fully typed with exported interfaces</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default BreadcrumbNavigationExamples;
