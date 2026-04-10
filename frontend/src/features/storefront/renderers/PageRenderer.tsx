/**
 * Base Page Renderer Component
 * Renders sections for any page type based on theme and section configuration
 */

import React from 'react';
import type { StorefrontTheme, BasePageSection, StorefrontSection } from '@/features/vendor/storefront-builder/types';

interface PageRendererProps {
  sections: (StorefrontSection | BasePageSection)[];
  theme: StorefrontTheme;
  pageType: string;
  pageData?: Record<string, unknown>;
}

export const PageRenderer: React.FC<PageRendererProps> = ({
  sections,
  theme,
  pageType,
  pageData,
}) => {
  // Get enabled sections sorted by order
  const enabledSections = sections
    .filter(s => s.enabled)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}>
      {enabledSections.map((section) => (
        <SectionRenderer
          key={section.id}
          section={section}
          theme={theme}
          pageData={pageData}
        />
      ))}
    </div>
  );
};

// Section Renderer
interface SectionRendererProps {
  section: StorefrontSection | BasePageSection;
  theme: StorefrontTheme;
  pageData?: Record<string, unknown>;
}

const SectionRenderer: React.FC<SectionRendererProps> = ({ section, theme, pageData }) => {
  const sectionType = section.type;

  // Render placeholder for page-specific sections
  // These will be implemented with actual functionality
  switch (sectionType) {
    // Collection page sections
    case 'collection-hero':
      return <CollectionHeroPlaceholder section={section} theme={theme} />;
    case 'collection-filters':
      return <CollectionFiltersPlaceholder section={section} theme={theme} />;
    case 'collection-grid':
      return <CollectionGridPlaceholder section={section} theme={theme} pageData={pageData} />;

    // Product page sections
    case 'product-gallery':
      return <ProductGalleryPlaceholder section={section} theme={theme} pageData={pageData} />;
    case 'product-info':
      return <ProductInfoPlaceholder section={section} theme={theme} pageData={pageData} />;
    case 'product-tabs':
      return <ProductTabsPlaceholder section={section} theme={theme} />;
    case 'product-reviews':
      return <ProductReviewsPlaceholder section={section} theme={theme} />;
    case 'related-products':
      return <RelatedProductsPlaceholder section={section} theme={theme} />;

    // Cart page sections
    case 'cart-items':
      return <CartItemsPlaceholder section={section} theme={theme} />;
    case 'cart-summary':
      return <CartSummaryPlaceholder section={section} theme={theme} />;
    case 'cart-recommendations':
      return <CartRecommendationsPlaceholder section={section} theme={theme} />;

    // Checkout page sections
    case 'checkout-steps':
      return <CheckoutStepsPlaceholder section={section} theme={theme} />;
    case 'checkout-form':
      return <CheckoutFormPlaceholder section={section} theme={theme} />;
    case 'checkout-summary':
      return <CheckoutSummaryPlaceholder section={section} theme={theme} />;

    // Wishlist page sections
    case 'wishlist-header':
      return <WishlistHeaderPlaceholder section={section} theme={theme} />;
    case 'wishlist-items':
      return <WishlistItemsPlaceholder section={section} theme={theme} />;

    // Profile page sections
    case 'profile-sidebar':
      return <ProfileSidebarPlaceholder section={section} theme={theme} />;
    case 'profile-info':
      return <ProfileInfoPlaceholder section={section} theme={theme} />;
    case 'profile-orders':
      return <ProfileOrdersPlaceholder section={section} theme={theme} />;

    // Track order sections
    case 'order-search':
      return <OrderSearchPlaceholder section={section} theme={theme} />;
    case 'order-timeline':
      return <OrderTimelinePlaceholder section={section} theme={theme} />;
    case 'order-details':
      return <OrderDetailsPlaceholder section={section} theme={theme} />;

    default:
      // Return a generic placeholder for unknown sections
      return (
        <div className="py-12 px-6 text-center" style={{ backgroundColor: theme.backgroundColor }}>
          <p className="text-gray-500">Section: {sectionType}</p>
        </div>
      );
  }
};

// Placeholder components - these will be replaced with actual implementations
// that integrate with existing functionality

const CollectionHeroPlaceholder: React.FC<{ section: any; theme: StorefrontTheme }> = ({ section, theme }) => (
  <div className="relative py-16 px-6 bg-gradient-to-r from-gray-100 to-gray-200" style={{ minHeight: '200px' }}>
    <div className="max-w-6xl mx-auto text-center">
      <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: theme.headingFont, color: theme.textColor }}>
        Collection Name
      </h1>
      <p className="text-lg opacity-80">Browse our curated selection</p>
    </div>
  </div>
);

const CollectionFiltersPlaceholder: React.FC<{ section: any; theme: StorefrontTheme }> = ({ section, theme }) => (
  <div className="py-4 px-6 bg-gray-50 border-b">
    <div className="max-w-6xl mx-auto flex items-center gap-4 flex-wrap">
      <span className="font-medium">Filters:</span>
      <button className="px-4 py-2 rounded-lg border hover:bg-gray-100">Category</button>
      <button className="px-4 py-2 rounded-lg border hover:bg-gray-100">Price</button>
      <button className="px-4 py-2 rounded-lg border hover:bg-gray-100">Color</button>
      <button className="px-4 py-2 rounded-lg border hover:bg-gray-100">Size</button>
    </div>
  </div>
);

const CollectionGridPlaceholder: React.FC<{ section: any; theme: StorefrontTheme; pageData?: Record<string, unknown> }> = ({ section, theme }) => (
  <div className="py-12 px-6">
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-lg overflow-hidden shadow-sm border">
            <div className="aspect-square bg-gray-200" />
            <div className="p-4">
              <h3 className="font-medium">Product {i + 1}</h3>
              <p className="text-sm text-gray-500">$99.00</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ProductGalleryPlaceholder: React.FC<{ section: any; theme: StorefrontTheme; pageData?: Record<string, unknown> }> = ({ section, theme }) => (
  <div className="p-6">
    <div className="aspect-square bg-gray-200 rounded-lg mb-4" />
    <div className="grid grid-cols-4 gap-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="aspect-square bg-gray-200 rounded" />
      ))}
    </div>
  </div>
);

const ProductInfoPlaceholder: React.FC<{ section: any; theme: StorefrontTheme; pageData?: Record<string, unknown> }> = ({ section, theme }) => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: theme.headingFont }}>Product Name</h1>
    <p className="text-2xl font-semibold mb-4" style={{ color: theme.primaryColor }}>$99.00</p>
    <p className="text-gray-600 mb-6">Product description goes here...</p>
    <button className="px-6 py-3 rounded-lg text-white" style={{ backgroundColor: theme.primaryColor }}>
      Add to Cart
    </button>
  </div>
);

const ProductTabsPlaceholder: React.FC<{ section: any; theme: StorefrontTheme }> = ({ section, theme }) => (
  <div className="py-8 px-6 border-t">
    <div className="max-w-6xl mx-auto">
      <div className="flex gap-6 border-b mb-6">
        <button className="pb-3 font-medium border-b-2 border-current" style={{ color: theme.primaryColor }}>Description</button>
        <button className="pb-3 text-gray-500">Specifications</button>
        <button className="pb-3 text-gray-500">Reviews</button>
      </div>
      <p className="text-gray-600">Product details and description content...</p>
    </div>
  </div>
);

const ProductReviewsPlaceholder: React.FC<{ section: any; theme: StorefrontTheme }> = ({ section, theme }) => (
  <div className="py-8 px-6 bg-gray-50">
    <div className="max-w-6xl mx-auto">
      <h3 className="text-xl font-bold mb-6" style={{ fontFamily: theme.headingFont }}>Customer Reviews</h3>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-4 bg-white rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium">Customer {i + 1}</span>
              <span className="text-yellow-500">★★★★★</span>
            </div>
            <p className="text-gray-600">Great product! Highly recommended.</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const RelatedProductsPlaceholder: React.FC<{ section: any; theme: StorefrontTheme }> = ({ section, theme }) => (
  <div className="py-12 px-6">
    <div className="max-w-6xl mx-auto">
      <h3 className="text-xl font-bold mb-6" style={{ fontFamily: theme.headingFont }}>You May Also Like</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg overflow-hidden shadow-sm border">
            <div className="aspect-square bg-gray-200" />
            <div className="p-4">
              <h4 className="font-medium">Related Product {i + 1}</h4>
              <p className="text-sm" style={{ color: theme.primaryColor }}>$79.00</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const CartItemsPlaceholder: React.FC<{ section: any; theme: StorefrontTheme }> = ({ section, theme }) => (
  <div className="py-8 px-6">
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: theme.headingFont }}>Shopping Cart</h2>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4 p-4 bg-white rounded-lg shadow-sm border">
            <div className="w-24 h-24 bg-gray-200 rounded" />
            <div className="flex-1">
              <h3 className="font-medium">Product {i + 1}</h3>
              <p className="text-gray-500">Quantity: 1</p>
              <p className="font-semibold" style={{ color: theme.primaryColor }}>$99.00</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const CartSummaryPlaceholder: React.FC<{ section: any; theme: StorefrontTheme }> = ({ section, theme }) => (
  <div className="p-6 bg-gray-50 rounded-lg">
    <h3 className="text-lg font-bold mb-4">Order Summary</h3>
    <div className="space-y-2 mb-6">
      <div className="flex justify-between"><span>Subtotal</span><span>$297.00</span></div>
      <div className="flex justify-between"><span>Shipping</span><span>$10.00</span></div>
      <div className="flex justify-between font-bold text-lg border-t pt-2"><span>Total</span><span>$307.00</span></div>
    </div>
    <button className="w-full py-3 rounded-lg text-white font-medium" style={{ backgroundColor: theme.primaryColor }}>
      Proceed to Checkout
    </button>
  </div>
);

const CartRecommendationsPlaceholder: React.FC<{ section: any; theme: StorefrontTheme }> = ({ section, theme }) => (
  <div className="py-8 px-6 bg-gray-50">
    <h3 className="text-lg font-bold mb-4">Recommended for You</h3>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-lg overflow-hidden border bg-white">
          <div className="aspect-square bg-gray-200" />
          <div className="p-3">
            <h4 className="text-sm font-medium">Product {i + 1}</h4>
            <p className="text-sm" style={{ color: theme.primaryColor }}>$49.00</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const CheckoutStepsPlaceholder: React.FC<{ section: any; theme: StorefrontTheme }> = ({ section, theme }) => (
  <div className="py-6 px-6 border-b">
    <div className="max-w-4xl mx-auto flex items-center justify-center gap-8">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: theme.primaryColor }}>1</div>
        <span className="font-medium">Shipping</span>
      </div>
      <div className="w-12 h-0.5 bg-gray-300" />
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-300 text-gray-600">2</div>
        <span className="text-gray-500">Payment</span>
      </div>
      <div className="w-12 h-0.5 bg-gray-300" />
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-300 text-gray-600">3</div>
        <span className="text-gray-500">Review</span>
      </div>
    </div>
  </div>
);

const CheckoutFormPlaceholder: React.FC<{ section: any; theme: StorefrontTheme }> = ({ section, theme }) => (
  <div className="py-8 px-6">
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-6">Shipping Information</h2>
      <div className="space-y-4">
        <input type="text" placeholder="Full Name" className="w-full px-4 py-3 rounded-lg border" />
        <input type="text" placeholder="Address" className="w-full px-4 py-3 rounded-lg border" />
        <div className="grid grid-cols-2 gap-4">
          <input type="text" placeholder="City" className="px-4 py-3 rounded-lg border" />
          <input type="text" placeholder="Postal Code" className="px-4 py-3 rounded-lg border" />
        </div>
        <button className="w-full py-3 rounded-lg text-white font-medium" style={{ backgroundColor: theme.primaryColor }}>
          Continue to Payment
        </button>
      </div>
    </div>
  </div>
);

const CheckoutSummaryPlaceholder: React.FC<{ section: any; theme: StorefrontTheme }> = ({ section, theme }) => (
  <div className="p-6 bg-gray-50 rounded-lg sticky top-4">
    <h3 className="text-lg font-bold mb-4">Order Summary</h3>
    <div className="space-y-3 mb-4">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <div className="w-16 h-16 bg-gray-200 rounded" />
          <div className="flex-1">
            <p className="text-sm font-medium">Product {i + 1}</p>
            <p className="text-sm text-gray-500">Qty: 1</p>
          </div>
          <span className="font-medium">$99.00</span>
        </div>
      ))}
    </div>
    <div className="space-y-2 border-t pt-4">
      <div className="flex justify-between"><span>Subtotal</span><span>$198.00</span></div>
      <div className="flex justify-between"><span>Shipping</span><span>$10.00</span></div>
      <div className="flex justify-between font-bold text-lg"><span>Total</span><span>$208.00</span></div>
    </div>
  </div>
);

const WishlistHeaderPlaceholder: React.FC<{ section: any; theme: StorefrontTheme }> = ({ section, theme }) => (
  <div className="py-8 px-6 border-b">
    <div className="max-w-6xl mx-auto flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: theme.headingFont }}>My Wishlist</h1>
        <p className="text-gray-500">4 items saved</p>
      </div>
      <button className="px-4 py-2 rounded-lg border hover:bg-gray-50">Share Wishlist</button>
    </div>
  </div>
);

const WishlistItemsPlaceholder: React.FC<{ section: any; theme: StorefrontTheme }> = ({ section, theme }) => (
  <div className="py-8 px-6">
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg overflow-hidden shadow-sm border">
            <div className="aspect-square bg-gray-200 relative">
              <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow">❤️</button>
            </div>
            <div className="p-4">
              <h3 className="font-medium">Saved Item {i + 1}</h3>
              <p className="font-semibold" style={{ color: theme.primaryColor }}>$99.00</p>
              <button className="w-full mt-3 py-2 rounded-lg border text-sm hover:bg-gray-50">
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ProfileSidebarPlaceholder: React.FC<{ section: any; theme: StorefrontTheme }> = ({ section, theme }) => (
  <div className="p-6 bg-gray-50 rounded-lg">
    <div className="flex items-center gap-4 mb-6">
      <div className="w-16 h-16 rounded-full bg-gray-200" />
      <div>
        <h3 className="font-bold">John Doe</h3>
        <p className="text-sm text-gray-500">john@example.com</p>
      </div>
    </div>
    <nav className="space-y-2">
      <button className="w-full text-left px-4 py-2 rounded-lg font-medium" style={{ backgroundColor: theme.primaryColor, color: 'white' }}>Dashboard</button>
      <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100">Orders</button>
      <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100">Addresses</button>
      <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100">Settings</button>
    </nav>
  </div>
);

const ProfileInfoPlaceholder: React.FC<{ section: any; theme: StorefrontTheme }> = ({ section, theme }) => (
  <div className="p-6">
    <h2 className="text-xl font-bold mb-6" style={{ fontFamily: theme.headingFont }}>Account Information</h2>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm text-gray-500 mb-1">Full Name</label>
        <p className="font-medium">John Doe</p>
      </div>
      <div>
        <label className="block text-sm text-gray-500 mb-1">Email</label>
        <p className="font-medium">john@example.com</p>
      </div>
      <div>
        <label className="block text-sm text-gray-500 mb-1">Phone</label>
        <p className="font-medium">+1 234 567 890</p>
      </div>
      <div>
        <label className="block text-sm text-gray-500 mb-1">Member Since</label>
        <p className="font-medium">January 2024</p>
      </div>
    </div>
  </div>
);

const ProfileOrdersPlaceholder: React.FC<{ section: any; theme: StorefrontTheme }> = ({ section, theme }) => (
  <div className="p-6">
    <h2 className="text-xl font-bold mb-6" style={{ fontFamily: theme.headingFont }}>Recent Orders</h2>
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="p-4 border rounded-lg flex items-center justify-between">
          <div>
            <p className="font-medium">Order #123{i}</p>
            <p className="text-sm text-gray-500">December 2024</p>
          </div>
          <div className="text-right">
            <p className="font-medium">$199.00</p>
            <span className="text-sm px-2 py-1 rounded bg-green-100 text-green-700">Delivered</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const OrderSearchPlaceholder: React.FC<{ section: any; theme: StorefrontTheme }> = ({ section, theme }) => (
  <div className="py-12 px-6 bg-gradient-to-b from-gray-100 to-white">
    <div className="max-w-xl mx-auto text-center">
      <h1 className="text-2xl font-bold mb-4" style={{ fontFamily: theme.headingFont }}>Track Your Order</h1>
      <p className="text-gray-600 mb-6">Enter your order ID to see the latest status</p>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Enter Order ID"
          className="flex-1 px-4 py-3 rounded-lg border"
        />
        <button className="px-6 py-3 rounded-lg text-white font-medium" style={{ backgroundColor: theme.primaryColor }}>
          Track
        </button>
      </div>
    </div>
  </div>
);

const OrderTimelinePlaceholder: React.FC<{ section: any; theme: StorefrontTheme }> = ({ section, theme }) => (
  <div className="py-8 px-6">
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-6">Order Status</h2>
      <div className="space-y-6">
        {[
          { status: 'Order Placed', date: 'Dec 20, 2024', done: true },
          { status: 'Processing', date: 'Dec 21, 2024', done: true },
          { status: 'Shipped', date: 'Dec 22, 2024', done: true },
          { status: 'Out for Delivery', date: 'Expected Dec 24', done: false },
          { status: 'Delivered', date: '', done: false },
        ].map((step, i) => (
          <div key={i} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: step.done ? theme.primaryColor : '#e5e7eb' }}
              />
              {i < 4 && <div className="w-0.5 h-12 bg-gray-200" />}
            </div>
            <div>
              <p className={`font-medium ${step.done ? '' : 'text-gray-400'}`}>{step.status}</p>
              <p className="text-sm text-gray-500">{step.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const OrderDetailsPlaceholder: React.FC<{ section: any; theme: StorefrontTheme }> = ({ section, theme }) => (
  <div className="py-8 px-6 bg-gray-50">
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-6">Order Details</h2>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">Order Number</p>
            <p className="font-medium">#ORD-12345</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Order Date</p>
            <p className="font-medium">December 20, 2024</p>
          </div>
        </div>
        <div className="border-t pt-4">
          <p className="font-medium mb-4">Items</p>
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded" />
                <div className="flex-1">
                  <p className="font-medium">Product {i + 1}</p>
                  <p className="text-sm text-gray-500">Qty: 1</p>
                </div>
                <span className="font-medium">$99.00</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default PageRenderer;
