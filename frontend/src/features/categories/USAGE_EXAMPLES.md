# CategoriesPage Usage Examples

This document provides practical examples of how to use and integrate the CategoriesPage component.

## Table of Contents
1. [Basic Navigation](#basic-navigation)
2. [Category Links Component](#category-links-component)
3. [Category Grid Component](#category-grid-component)
4. [Deep Linking to Subcategories](#deep-linking-to-subcategories)
5. [Integration with Search](#integration-with-search)

## Basic Navigation

### Simple Category Link

```tsx
import { Link } from 'react-router-dom';

function CategoryMenuItem() {
  return (
    <Link
      to="/category/mens-fashion"
      className="text-text-primary hover:text-primary-lime"
    >
      Men's Fashion
    </Link>
  );
}
```

### Category Link with Icon

```tsx
import { Link } from 'react-router-dom';
import { Shirt } from 'lucide-react';

function CategoryCard({ slug, name, icon: Icon }) {
  return (
    <Link to={`/category/${slug}`}>
      <div className="p-4 bg-white rounded-lg hover:shadow-lg transition-shadow">
        <Icon className="w-8 h-8 mb-2 text-primary-lime" />
        <h3 className="font-semibold">{name}</h3>
      </div>
    </Link>
  );
}

// Usage
<CategoryCard
  slug="mens-fashion"
  name="Men's Fashion"
  icon={Shirt}
/>
```

## Category Links Component

Create a reusable navigation component for categories:

```tsx
// components/navigation/CategoryNav.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { categories, getCategoryIcon } from '@/data/categories';
import { cn } from '@/lib/utils';

interface CategoryNavProps {
  variant?: 'horizontal' | 'vertical';
  className?: string;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  variant = 'horizontal',
  className
}) => {
  return (
    <nav
      className={cn(
        'flex gap-4',
        variant === 'horizontal' ? 'flex-row overflow-x-auto' : 'flex-col',
        className
      )}
    >
      {categories.map((category) => {
        const Icon = getCategoryIcon(category.icon);
        return (
          <Link
            key={category.id}
            to={`/category/${category.slug}`}
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-primary-lime/10 transition-colors"
          >
            <Icon className="w-5 h-5 text-primary-lime" />
            <span className="font-medium text-text-primary">{category.name}</span>
          </Link>
        );
      })}
    </nav>
  );
};

// Usage in Header
<CategoryNav variant="horizontal" />

// Usage in Sidebar
<CategoryNav variant="vertical" />
```

## Category Grid Component

Display categories in a grid layout:

```tsx
// components/categories/CategoryGrid.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { categories, getCategoryIcon } from '@/data/categories';
import { Card } from '@/components/ui/card';

export const CategoryGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {categories.map((category, index) => {
        const Icon = getCategoryIcon(category.icon);
        return (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link to={`/category/${category.slug}`}>
              <Card className="p-6 hover:shadow-lg transition-all hover:-translate-y-1">
                {/* Icon */}
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-lime/10 flex items-center justify-center">
                  <Icon className="w-8 h-8 text-primary-lime" />
                </div>

                {/* Name */}
                <h3 className="text-center font-semibold text-text-primary mb-2">
                  {category.name}
                </h3>

                {/* Description */}
                <p className="text-xs text-text-secondary text-center line-clamp-2">
                  {category.description}
                </p>

                {/* Banner Preview (optional) */}
                {category.bannerImage && (
                  <div className="mt-4 aspect-video rounded-lg overflow-hidden">
                    <img
                      src={category.bannerImage}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </Card>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
};

// Usage in a Shop/Browse page
function BrowsePage() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shop by Category</h1>
      <CategoryGrid />
    </div>
  );
}
```

## Deep Linking to Subcategories

### Direct Subcategory Link

```tsx
import { Link } from 'react-router-dom';

function QuickLinks() {
  return (
    <div className="flex flex-col gap-2">
      {/* Link directly to a subcategory */}
      <Link to="/category/mens-fashion?subcategory=shirts">
        Men's Shirts
      </Link>

      <Link to="/category/womens-fashion?subcategory=dresses">
        Women's Dresses
      </Link>

      <Link to="/category/electronics?subcategory=phones">
        Mobile Phones
      </Link>
    </div>
  );
}
```

### Subcategory Navigation Component

```tsx
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { getCategoryBySlug } from '@/data/categories';
import { Button } from '@/components/ui/button';

export const SubcategoryQuickNav: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const category = getCategoryBySlug(categorySlug || '');

  if (!category?.subcategories) return null;

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-sm text-text-secondary">Quick Browse</h3>
      <div className="flex flex-wrap gap-2">
        {category.subcategories.map((sub) => (
          <Button
            key={sub.id}
            variant="outline"
            size="sm"
            asChild
          >
            <Link to={`/category/${categorySlug}?subcategory=${sub.slug}`}>
              {sub.name}
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
};
```

## Integration with Search

### Search with Category Filter

```tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { categories } from '@/data/categories';

export const CategorySearch: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedCategory) {
      // Navigate to category with search query
      navigate(`/category/${selectedCategory}?q=${searchQuery}`);
    } else {
      // Navigate to general search
      navigate(`/search?q=${searchQuery}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      {/* Category Selector */}
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="px-4 py-2 border rounded-lg"
      >
        <option value="">All Categories</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.slug}>
            {cat.name}
          </option>
        ))}
      </select>

      {/* Search Input */}
      <div className="flex-1 relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products..."
          className="w-full px-4 py-2 pr-10 border rounded-lg"
        />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>

      <button
        type="submit"
        className="px-6 py-2 bg-primary-lime text-white rounded-lg hover:bg-primary-lime/90"
      >
        Search
      </button>
    </form>
  );
};
```

## Advanced: Category-Based Product Recommendations

```tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { getCategoryBySlug } from '@/data/categories';
import { ProductCard } from '@/components/products/ProductCard';
import { ChevronRight } from 'lucide-react';

interface CategoryRecommendationsProps {
  categorySlug: string;
  title?: string;
  maxProducts?: number;
}

export const CategoryRecommendations: React.FC<CategoryRecommendationsProps> = ({
  categorySlug,
  title,
  maxProducts = 4,
}) => {
  const category = getCategoryBySlug(categorySlug);

  if (!category) return null;

  // In real app, fetch products from API
  const products = []; // Mock products for this category

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-text-primary">
          {title || `Trending in ${category.name}`}
        </h2>
        <Link
          to={`/category/${categorySlug}`}
          className="text-primary-lime hover:underline flex items-center gap-1"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.slice(0, maxProducts).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

// Usage
<CategoryRecommendations
  categorySlug="electronics"
  title="Latest Tech"
  maxProducts={6}
/>
```

## Navigation from Header/Menu

```tsx
// components/layout/Header.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { categories, getCategoryIcon } from '@/data/categories';

export const Header: React.FC = () => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-screen-xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold">
            Fluxez
          </Link>

          {/* Desktop Category Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {categories.map((category) => {
              const Icon = getCategoryIcon(category.icon);
              return (
                <Link
                  key={category.id}
                  to={`/category/${category.slug}`}
                  className="flex items-center gap-2 text-text-primary hover:text-primary-lime transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  {category.name}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="md:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {showMenu && (
          <nav className="md:hidden mt-4 pb-4 space-y-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="block py-2 px-4 rounded-lg hover:bg-gray-100"
                onClick={() => setShowMenu(false)}
              >
                {category.name}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};
```

## Programmatic Navigation

```tsx
import { useNavigate } from 'react-router-dom';

function ProductCard({ product }) {
  const navigate = useNavigate();

  const handleViewCategory = () => {
    // Navigate to product's category
    navigate(`/category/${product.categorySlug}`);
  };

  return (
    <div>
      {/* Product content */}
      <button onClick={handleViewCategory}>
        More in {product.categoryName}
      </button>
    </div>
  );
}
```

## Dynamic Breadcrumbs

```tsx
import { useParams } from 'react-router-dom';
import { getCategoryBySlug } from '@/data/categories';
import { BreadcrumbNavigation } from '@/components/layout/BreadcrumbNavigation';

function ProductPage() {
  const { categorySlug, productId } = useParams();
  const category = getCategoryBySlug(categorySlug || '');

  return (
    <div>
      <BreadcrumbNavigation
        items={[
          { label: 'Shop', href: '/shop' },
          { label: category?.name || 'Category', href: `/category/${categorySlug}` },
          { label: 'Product Name' }
        ]}
      />
      {/* Product content */}
    </div>
  );
}
```

## Testing Navigation

```tsx
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CategoryGrid } from './CategoryGrid';

test('renders category links correctly', () => {
  render(
    <BrowserRouter>
      <CategoryGrid />
    </BrowserRouter>
  );

  // Check if category links are present
  expect(screen.getByText("Men's Fashion")).toBeInTheDocument();
  expect(screen.getByText("Electronics")).toBeInTheDocument();
});
```

---

These examples demonstrate the flexibility and power of the CategoriesPage component. You can adapt these patterns to fit your specific application needs.
