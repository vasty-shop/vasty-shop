/**
 * BreadcrumbNavigation Component - Quick Start Guide
 *
 * This file provides ready-to-use code snippets for common breadcrumb scenarios.
 * Copy and paste these examples directly into your pages.
 */

import { BreadcrumbNavigation, BreadcrumbItem } from './BreadcrumbNavigation';
import { ShoppingBag, Package, Tag } from 'lucide-react';

// ============================================================================
// QUICK START: Copy these into your pages
// ============================================================================

// 1. PRODUCT DETAIL PAGE
// Usage: Place this at the top of your product detail page
export const ProductDetailBreadcrumb = ({
  categoryName,
  categorySlug,
  productName
}: {
  categoryName: string;
  categorySlug: string;
  productName: string;
}) => (
  <BreadcrumbNavigation
    items={[
      { label: 'Products', href: '/products' },
      { label: categoryName, href: `/products/${categorySlug}` },
      { label: productName }
    ]}
  />
);

// 2. CATEGORY PAGE
// Usage: Place this at the top of category listing pages
export const CategoryBreadcrumb = ({
  categoryName,
  parentCategory,
  parentSlug
}: {
  categoryName: string;
  parentCategory?: string;
  parentSlug?: string;
}) => {
  const items: BreadcrumbItem[] = [{ label: 'Categories', href: '/categories' }];

  if (parentCategory && parentSlug) {
    items.push({ label: parentCategory, href: `/categories/${parentSlug}` });
  }

  items.push({ label: categoryName });

  return <BreadcrumbNavigation items={items} />;
};

// 3. SEARCH RESULTS PAGE
// Usage: Show search breadcrumb with query
export const SearchBreadcrumb = ({ query }: { query: string }) => (
  <BreadcrumbNavigation
    items={[
      { label: 'Search Results', href: '/search' },
      { label: `"${query}"` }
    ]}
  />
);

// 4. USER ACCOUNT PAGES
// Usage: Account section navigation
export const AccountBreadcrumb = ({
  section,
  sectionSlug,
  detail
}: {
  section: string;
  sectionSlug: string;
  detail?: string;
}) => {
  const items: BreadcrumbItem[] = [
    { label: 'My Account', href: '/account' },
    { label: section, href: `/account/${sectionSlug}` }
  ];

  if (detail) {
    items.push({ label: detail });
  }

  return <BreadcrumbNavigation items={items} />;
};

// 5. BLOG POST
// Usage: Blog post breadcrumb
export const BlogBreadcrumb = ({
  categoryName,
  categorySlug,
  postTitle
}: {
  categoryName: string;
  categorySlug: string;
  postTitle: string;
}) => (
  <BreadcrumbNavigation
    items={[
      { label: 'Blog', href: '/blog' },
      { label: categoryName, href: `/blog/${categorySlug}` },
      { label: postTitle }
    ]}
  />
);

// 6. ORDER TRACKING
// Usage: Order detail/tracking page
export const OrderBreadcrumb = ({ orderId }: { orderId: string }) => (
  <BreadcrumbNavigation
    items={[
      { label: 'My Account', href: '/account' },
      { label: 'Orders', href: '/account/orders' },
      { label: `Order #${orderId}` }
    ]}
  />
);

// 7. SALE/OFFER PAGES
// Usage: Sale section breadcrumb
export const SaleBreadcrumb = ({
  saleType,
  categoryName
}: {
  saleType: string;
  categoryName?: string;
}) => {
  const items: BreadcrumbItem[] = [
    { label: 'Offers', href: '/offers' },
    { label: saleType }
  ];

  if (categoryName) {
    items.push({ label: categoryName });
  }

  return <BreadcrumbNavigation items={items} />;
};

// ============================================================================
// REAL-WORLD USAGE EXAMPLES
// ============================================================================

/**
 * Example 1: Product Detail Page Component
 */
export const ExampleProductPage = () => {
  // In a real app, this would come from props or API
  const product = {
    name: "Premium Wool Overcoat",
    category: "Men's Fashion",
    categorySlug: "mens-fashion"
  };

  return (
    <div className="container mx-auto px-4">
      <BreadcrumbNavigation
        items={[
          { label: 'Products', href: '/products' },
          { label: product.category, href: `/products/${product.categorySlug}` },
          { label: product.name }
        ]}
      />
      {/* Rest of your product page content */}
    </div>
  );
};

/**
 * Example 2: Category Page with Dynamic Data
 */
export const ExampleCategoryPage = () => {
  const category = {
    name: "Men's Fashion",
    slug: "mens-fashion",
    parent: {
      name: "Fashion",
      slug: "fashion"
    }
  };

  return (
    <div className="container mx-auto px-4">
      <BreadcrumbNavigation
        items={[
          { label: 'Categories', href: '/categories' },
          { label: category.parent.name, href: `/categories/${category.parent.slug}` },
          { label: category.name }
        ]}
      />
      {/* Category products grid */}
    </div>
  );
};

/**
 * Example 3: With Icons
 */
export const ExampleWithIcons = () => {
  return (
    <div className="container mx-auto px-4">
      <BreadcrumbNavigation
        items={[
          {
            label: 'Products',
            href: '/products',
            icon: <ShoppingBag className="w-4 h-4" />
          },
          {
            label: 'Featured Items',
            href: '/products/featured',
            icon: <Tag className="w-4 h-4" />
          },
          {
            label: 'Limited Edition Collection',
            icon: <Package className="w-4 h-4" />
          }
        ]}
      />
      {/* Page content */}
    </div>
  );
};

/**
 * Example 4: Account Order Details
 */
export const ExampleOrderDetails = () => {
  const orderId = "FLX-2024-001234";

  return (
    <div className="container mx-auto px-4">
      <BreadcrumbNavigation
        items={[
          { label: 'My Account', href: '/account' },
          { label: 'My Orders', href: '/account/orders' },
          { label: `Order ${orderId}` }
        ]}
      />
      {/* Order details */}
    </div>
  );
};

/**
 * Example 5: Search Results
 */
export const ExampleSearchResults = () => {
  const searchQuery = "winter jackets";
  const resultCount = 42;

  return (
    <div className="container mx-auto px-4">
      <BreadcrumbNavigation
        items={[
          { label: 'Search', href: '/search' },
          { label: `"${searchQuery}" (${resultCount} results)` }
        ]}
      />
      {/* Search results */}
    </div>
  );
};

// ============================================================================
// TIPS & BEST PRACTICES
// ============================================================================

/**
 * TIP 1: Keep breadcrumbs simple and meaningful
 * ✅ DO: Home / Products / Men's Fashion / Jackets
 * ❌ DON'T: Home / Shop / All Products / Category / Subcategory / Sub-subcategory / Items
 *
 * TIP 2: Last item should not be clickable
 * ✅ DO: { label: 'Current Page' } // No href
 * ❌ DON'T: { label: 'Current Page', href: '/current' } // Has href
 *
 * TIP 3: Use short, descriptive labels
 * ✅ DO: "Men's Fashion"
 * ❌ DON'T: "Browse All Men's Fashion Categories and Products"
 *
 * TIP 4: Place breadcrumbs consistently
 * Place them right after the header, before the main content
 *
 * TIP 5: Test on mobile
 * Long breadcrumbs will truncate on mobile - test to ensure readability
 */

export default {
  ProductDetailBreadcrumb,
  CategoryBreadcrumb,
  SearchBreadcrumb,
  AccountBreadcrumb,
  BlogBreadcrumb,
  OrderBreadcrumb,
  SaleBreadcrumb
};
