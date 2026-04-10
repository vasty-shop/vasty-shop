import * as React from 'react';
import { ProductListingHeader } from './ProductListingHeader';

/**
 * Example usage of the ProductListingHeader component
 *
 * This demonstrates all features including:
 * - Results count display
 * - Sort dropdown with icons
 * - View mode toggles (grid-3, grid-4, list)
 * - Active filters with remove functionality
 * - Mobile filter button
 * - Responsive design
 */

export const ProductListingHeaderExample: React.FC = () => {
  const [sortBy, setSortBy] = React.useState('featured');
  const [viewMode, setViewMode] = React.useState<'grid-3' | 'grid-4' | 'list'>('grid-4');
  const [activeFilters, setActiveFilters] = React.useState([
    { type: 'category', label: 'Category', value: 'Electronics' },
    { type: 'price', label: 'Price', value: '$50-$100' },
    { type: 'color', label: 'Color', value: 'Black' },
    { type: 'brand', label: 'Brand', value: 'Apple' },
  ]);

  const handleRemoveFilter = (filterType: string, value: string) => {
    setActiveFilters((prev) =>
      prev.filter((f) => !(f.type === filterType && f.value === value))
    );
  };

  const handleOpenFilters = () => {
    console.log('Open filters drawer (mobile)');
    // In a real app, this would open a drawer/modal with filters
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ProductListingHeader
        totalProducts={156}
        currentStart={1}
        currentEnd={24}
        sortBy={sortBy}
        viewMode={viewMode}
        activeFilters={activeFilters}
        onSortChange={setSortBy}
        onViewModeChange={setViewMode}
        onRemoveFilter={handleRemoveFilter}
        onOpenFilters={handleOpenFilters}
      />

      {/* Demo Content Area */}
      <div className="container mx-auto px-4 lg:px-6 py-8">
        <div className="bg-white rounded-2xl p-8 shadow-card">
          <h2 className="text-2xl font-bold text-text-primary mb-4">
            Current State
          </h2>
          <div className="space-y-4 text-sm">
            <div>
              <span className="font-semibold">Sort By:</span>{' '}
              <span className="text-text-secondary">{sortBy}</span>
            </div>
            <div>
              <span className="font-semibold">View Mode:</span>{' '}
              <span className="text-text-secondary">{viewMode}</span>
            </div>
            <div>
              <span className="font-semibold">Active Filters:</span>{' '}
              <span className="text-text-secondary">
                {activeFilters.length > 0
                  ? activeFilters.map((f) => `${f.label}: ${f.value}`).join(', ')
                  : 'None'}
              </span>
            </div>
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-text-primary mb-2">Features:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-text-secondary">
              <li>Responsive design with mobile-optimized controls</li>
              <li>Sort dropdown with icons for each option</li>
              <li>View toggles: 3-column grid, 4-column grid, and list view</li>
              <li>Active filters display with individual remove buttons</li>
              <li>Clear all filters button when 2+ filters active</li>
              <li>Filter button (mobile only) with badge counter</li>
              <li>Smooth animations for filter pills</li>
              <li>Sticky header that stays at top when scrolling</li>
              <li>Lime green accent color matching brand theme</li>
            </ul>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">Try it:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
              <li>Click the sort dropdown to change sorting</li>
              <li>Toggle between different view modes (desktop only)</li>
              <li>Click the X on filter pills to remove them</li>
              <li>Click "Clear All" to remove all filters at once</li>
              <li>Resize the window to see mobile layout</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListingHeaderExample;
