# CategoriesPage Quick Start Guide

Get up and running with the CategoriesPage component in 5 minutes.

## 1. Installation ✅

The component is already integrated into your project! All required files are in place:

- `/features/categories/CategoriesPage.tsx` - Main component
- `/types/category.ts` - Type definitions
- `/data/categories.ts` - Category data
- Route configured in `App.tsx`

## 2. Test the Component

### Navigate to a Category Page

Open your browser and visit any of these URLs:

```
http://localhost:5173/category/mens-fashion
http://localhost:5173/category/womens-fashion
http://localhost:5173/category/electronics
http://localhost:5173/category/home-living
http://localhost:5173/category/sports
http://localhost:5173/category/beauty
http://localhost:5173/category/books
```

### Try with Subcategories

```
http://localhost:5173/category/mens-fashion?subcategory=shirts
http://localhost:5173/category/womens-fashion?subcategory=dresses
http://localhost:5173/category/electronics?subcategory=phones
```

## 3. Add Category Links to Your Navigation

### Option A: Simple Link

```tsx
import { Link } from 'react-router-dom';

<Link to="/category/mens-fashion">
  Men's Fashion
</Link>
```

### Option B: Category Navigation Menu

```tsx
import { categories } from '@/data/categories';
import { Link } from 'react-router-dom';

function CategoryMenu() {
  return (
    <nav className="flex gap-4">
      {categories.map((category) => (
        <Link
          key={category.id}
          to={`/category/${category.slug}`}
          className="hover:text-primary-lime"
        >
          {category.name}
        </Link>
      ))}
    </nav>
  );
}
```

## 4. Customize Categories

Edit `/data/categories.ts` to customize category data:

```typescript
{
  id: 'your-category',
  slug: 'your-category',
  name: 'Your Category',
  icon: 'IconName', // From lucide-react
  description: 'Category description for SEO',
  bannerImage: 'https://your-image-url.com/image.jpg',
  priceRange: { min: 10, max: 500 },
  relevantFilters: ['size', 'color', 'price'],
  subcategories: [
    { id: 'sub1', name: 'Subcategory 1', slug: 'subcategory-1' },
    { id: 'sub2', name: 'Subcategory 2', slug: 'subcategory-2' },
  ],
}
```

## 5. Key Features to Try

### ✅ Subcategory Filtering
Click on subcategory tabs to filter products

### ✅ Price Range Filter
Use the price inputs in the sidebar to filter by price

### ✅ Rating Filter
Select a minimum rating to filter products

### ✅ Size Filter
(Fashion categories only) Click size chips to filter

### ✅ Sorting
Change the sort dropdown to:
- Popular
- Newest
- Price: Low to High
- Price: High to Low
- Top Rated

### ✅ View Modes
Toggle between Grid and List views

### ✅ Mobile Filters
On mobile, tap "Filters" to open the filter drawer

## 6. Integrating with Your Product API

Replace the mock data in `CategoriesPage.tsx`:

```typescript
// Replace this:
React.useEffect(() => {
  if (categorySlug) {
    const cat = getCategoryBySlug(categorySlug);
    if (cat) {
      setCategory(cat);
      const categoryProducts = mockProducts.filter(() => Math.random() > 0.3);
      setAllProducts(categoryProducts);
      setFeaturedProducts(categoryProducts.slice(0, 6));
    }
  }
}, [categorySlug]);

// With this:
React.useEffect(() => {
  if (categorySlug) {
    const cat = getCategoryBySlug(categorySlug);
    if (cat) {
      setCategory(cat);

      // Fetch products from API
      fetchProductsByCategory(categorySlug)
        .then(products => {
          setAllProducts(products);
          setFeaturedProducts(products.slice(0, 6));
        })
        .catch(error => {
          console.error('Failed to load products:', error);
        });
    }
  }
}, [categorySlug]);
```

## 7. Adding to Your Header/Navigation

### Example Header Integration

```tsx
// components/layout/Header.tsx
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';

export const Header = () => {
  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-screen-xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">Fluxez</Link>

          <nav className="hidden md:flex gap-6">
            <Link to="/category/mens-fashion" className="hover:text-primary-lime">
              Men's Fashion
            </Link>
            <Link to="/category/womens-fashion" className="hover:text-primary-lime">
              Women's Fashion
            </Link>
            <Link to="/category/electronics" className="hover:text-primary-lime">
              Electronics
            </Link>
            <Link to="/category/home-living" className="hover:text-primary-lime">
              Home & Living
            </Link>
          </nav>

          <button className="md:hidden">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
};
```

## 8. Common Customizations

### Change Grid Columns

Edit the grid classes in `CategoriesPage.tsx`:

```tsx
// Find this line:
className={cn(
  'grid gap-4',
  viewMode === 'grid'
    ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4'
    : 'grid-cols-1'
)}

// Change to your preferred layout, e.g., 5 columns on XL screens:
className={cn(
  'grid gap-4',
  viewMode === 'grid'
    ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
    : 'grid-cols-1'
)}
```

### Add More Filters

Add a new filter in the `FilterSidebar` component:

```tsx
{/* Brand Filter */}
<div>
  <h4 className="font-semibold text-sm text-text-primary mb-3">
    Brand
  </h4>
  <div className="space-y-2">
    {['Nike', 'Adidas', 'Puma'].map((brand) => (
      <label key={brand} className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={filters.brands?.includes(brand)}
          onChange={(e) => {
            const brands = filters.brands || [];
            const newBrands = e.target.checked
              ? [...brands, brand]
              : brands.filter(b => b !== brand);
            onFilterChange({ ...filters, brands: newBrands });
          }}
        />
        <span>{brand}</span>
      </label>
    ))}
  </div>
</div>
```

### Customize Featured Section

Change the number of featured products:

```tsx
// Find this line:
setFeaturedProducts(categoryProducts.slice(0, 6));

// Change to show more or fewer:
setFeaturedProducts(categoryProducts.slice(0, 8));
```

## 9. Troubleshooting

### Category Not Found
- Check that the category slug in the URL matches one in `/data/categories.ts`
- Make sure the slug uses hyphens (e.g., `mens-fashion`, not `mens_fashion`)

### Products Not Showing
- Check browser console for errors
- Verify `mockProducts` in `/data/mockData.ts` has data
- Check that filters aren't excluding all products

### Filters Not Working
- Make sure `Product` type has the required fields (price, rating, etc.)
- Check that `filteredProducts` state is updating
- Verify filter state is being passed correctly

### Mobile Drawer Not Opening
- Check that `showMobileFilters` state is toggling
- Verify `MobileFiltersDrawer` component is rendering
- Check for z-index conflicts with other components

## 10. Next Steps

Now that you have CategoriesPage running:

1. **Connect to your API**: Replace mock data with real API calls
2. **Add analytics**: Track category views, filter usage, etc.
3. **Implement wishlist**: Add wishlist functionality to ProductCard
4. **Add quick view**: Preview products without leaving the page
5. **Optimize images**: Use proper image optimization
6. **Add pagination**: Implement pagination or infinite scroll
7. **Personalization**: Show recommended products based on user history

## Need Help?

- Check the full documentation in `README.md`
- Review usage examples in `USAGE_EXAMPLES.md`
- See component architecture in `COMPONENT_GUIDE.md`
- Review existing similar components (ProductCard, FilterSidebar)

## Quick Reference: Category Slugs

| Category Name | Slug | URL |
|---------------|------|-----|
| Men's Fashion | `mens-fashion` | `/category/mens-fashion` |
| Women's Fashion | `womens-fashion` | `/category/womens-fashion` |
| Electronics | `electronics` | `/category/electronics` |
| Home & Living | `home-living` | `/category/home-living` |
| Sports & Fitness | `sports` | `/category/sports` |
| Beauty & Personal Care | `beauty` | `/category/beauty` |
| Books & Media | `books` | `/category/books` |

---

Happy coding! 🚀
