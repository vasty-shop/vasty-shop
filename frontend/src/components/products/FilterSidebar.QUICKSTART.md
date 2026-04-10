# FilterSidebar Quick Start Guide

Get the FilterSidebar component up and running in your product listing page in 5 minutes.

## Step 1: Import the Component

```tsx
import { FilterSidebar } from '@/components/products/FilterSidebar';
import { useState } from 'react';
```

## Step 2: Set Up State

```tsx
function ProductListingPage() {
  // Filter state
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);

  // Clear all handler
  const handleClearAll = () => {
    setSelectedCategories([]);
    setSelectedPriceRange([0, 1000]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedBrands([]);
    setMinRating(0);
  };

  // ... rest of component
}
```

## Step 3: Add the Component (Desktop)

```tsx
return (
  <div className="container mx-auto px-4 py-8">
    <div className="grid grid-cols-[280px_1fr] gap-8">
      {/* Sidebar */}
      <div className="sticky top-8 self-start">
        <FilterSidebar
          selectedCategories={selectedCategories}
          selectedPriceRange={selectedPriceRange}
          selectedSizes={selectedSizes}
          selectedColors={selectedColors}
          selectedBrands={selectedBrands}
          minRating={minRating}
          onCategoryChange={setSelectedCategories}
          onPriceRangeChange={setSelectedPriceRange}
          onSizeChange={setSelectedSizes}
          onColorChange={setSelectedColors}
          onBrandChange={setSelectedBrands}
          onRatingChange={setMinRating}
          onClearAll={handleClearAll}
        />
      </div>

      {/* Products */}
      <div>
        <ProductGrid products={filteredProducts} />
      </div>
    </div>
  </div>
);
```

## Step 4: Filter Your Products

```tsx
const filteredProducts = products.filter((product) => {
  // Categories
  if (selectedCategories.length > 0 &&
      !selectedCategories.includes(product.category)) {
    return false;
  }

  // Price
  if (product.price < selectedPriceRange[0] ||
      product.price > selectedPriceRange[1]) {
    return false;
  }

  // Sizes
  if (selectedSizes.length > 0 &&
      product.size &&
      !selectedSizes.includes(product.size)) {
    return false;
  }

  // Colors
  if (selectedColors.length > 0 &&
      !selectedColors.includes(product.color)) {
    return false;
  }

  // Brands
  if (selectedBrands.length > 0 &&
      !selectedBrands.includes(product.brand)) {
    return false;
  }

  // Rating
  if (minRating > 0 && product.rating < minRating) {
    return false;
  }

  return true;
});
```

## Step 5: Add Product Counts (Optional)

```tsx
const categoryProductCounts = products.reduce((acc, product) => {
  acc[product.category] = (acc[product.category] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

<FilterSidebar
  {...otherProps}
  categoryProductCounts={categoryProductCounts}
/>
```

## Mobile Version (Bonus)

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal } from 'lucide-react';

function MobileFilters() {
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filters</DialogTitle>
        </DialogHeader>
        <FilterSidebar
          {...filterProps}
          isMobile
          className="shadow-none"
        />
        <Button
          className="w-full"
          onClick={() => setFilterOpen(false)}
        >
          Show {filteredProducts.length} Products
        </Button>
      </DialogContent>
    </Dialog>
  );
}
```

## Complete Example

```tsx
import { FilterSidebar } from '@/components/products/FilterSidebar';
import { ProductGrid } from '@/components/products/ProductGrid';
import { useState } from 'react';

export function ProductListingPage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);

  // Your products data
  const products = useProducts(); // or however you fetch products

  // Filter products
  const filteredProducts = products.filter((product) => {
    if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) {
      return false;
    }
    if (product.price < selectedPriceRange[0] || product.price > selectedPriceRange[1]) {
      return false;
    }
    if (selectedSizes.length > 0 && product.size && !selectedSizes.includes(product.size)) {
      return false;
    }
    if (selectedColors.length > 0 && !selectedColors.includes(product.color)) {
      return false;
    }
    if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) {
      return false;
    }
    if (minRating > 0 && product.rating < minRating) {
      return false;
    }
    return true;
  });

  const handleClearAll = () => {
    setSelectedCategories([]);
    setSelectedPriceRange([0, 1000]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedBrands([]);
    setMinRating(0);
  };

  return (
    <div className="min-h-screen bg-cloud-gradient">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-h1 font-bold mb-8">Products</h1>

        <div className="grid grid-cols-[280px_1fr] gap-8">
          <div className="sticky top-8 self-start">
            <FilterSidebar
              selectedCategories={selectedCategories}
              selectedPriceRange={selectedPriceRange}
              selectedSizes={selectedSizes}
              selectedColors={selectedColors}
              selectedBrands={selectedBrands}
              minRating={minRating}
              onCategoryChange={setSelectedCategories}
              onPriceRangeChange={setSelectedPriceRange}
              onSizeChange={setSelectedSizes}
              onColorChange={setSelectedColors}
              onBrandChange={setSelectedBrands}
              onRatingChange={setMinRating}
              onClearAll={handleClearAll}
            />
          </div>

          <div>
            {filteredProducts.length > 0 ? (
              <ProductGrid products={filteredProducts} />
            ) : (
              <div className="text-center py-12">
                <p className="text-h3 mb-4">No products found</p>
                <Button onClick={handleClearAll}>Clear Filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Category IDs Reference

Use these IDs for the category filter:
- `mens-fashion` - Men's Fashion
- `womens-fashion` - Women's Fashion
- `electronics` - Electronics
- `home-living` - Home & Living
- `sports` - Sports
- `beauty` - Beauty
- `books` - Books

## Color IDs Reference

Use these IDs for the color filter:
- `black`, `white`, `gray`, `navy`
- `red`, `pink`, `green`, `blue`
- `yellow`, `purple`, `brown`, `beige`

## Tips

1. **Performance**: If you have many products, consider memoizing the filter function with `useMemo`
2. **URL Sync**: Sync filter state with URL params for shareable filtered views
3. **Persistence**: Save filter preferences in localStorage for better UX
4. **Analytics**: Track which filters users use most frequently
5. **Loading State**: Show skeleton/loading state while products are being filtered

## Next Steps

- See `FilterSidebar.README.md` for detailed documentation
- Check `FilterSidebar.example.tsx` for complete working examples
- Customize colors and brands to match your product catalog
- Add URL parameter synchronization for shareable filtered views
