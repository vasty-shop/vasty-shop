/**
 * ProductsPage Integration Example
 *
 * This file demonstrates how to integrate the ProductsPage component into your React Router setup.
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProductsPage } from './ProductsPage';
import { ProductDetailPage } from './ProductDetailPage';

// Example: App.tsx integration
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Products listing page */}
        <Route path="/products" element={<ProductsPage />} />

        {/* Product detail page */}
        <Route path="/product/:id" element={<ProductDetailPage />} />

        {/* Category-specific products (optional) */}
        <Route path="/products/category/:category" element={<ProductsPage />} />

        {/* Sale products (optional) */}
        <Route path="/products/sale" element={<ProductsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

// Example: Direct usage in a component
function ProductsCatalog() {
  return (
    <div className="min-h-screen">
      <header>
        {/* Your header component */}
      </header>

      <ProductsPage />

      <footer>
        {/* Your footer component */}
      </footer>
    </div>
  );
}

// Example: With category pre-filtering
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

function CategoryProductsPage({ category }: { category: string }) {
  const [, setSearchParams] = useSearchParams();

  useEffect(() => {
    // Pre-filter by category
    setSearchParams({ categories: category });
  }, [category, setSearchParams]);

  return <ProductsPage />;
}

// Example: Sale products page
function SaleProductsPage() {
  const [, setSearchParams] = useSearchParams();

  useEffect(() => {
    // Show only products with discounts by filtering price range
    // Or you could add a dedicated "onSale" filter
    setSearchParams({ sort: 'price-low-high' });
  }, [setSearchParams]);

  return (
    <div>
      <div className="bg-red-500 text-white py-4 text-center">
        <h1 className="text-2xl font-bold">SALE - Up to 50% OFF</h1>
      </div>
      <ProductsPage />
    </div>
  );
}

// Example: Navigation to products page with filters
import { Link } from 'react-router-dom';

function CategoryMenu() {
  return (
    <nav>
      <Link to="/products?categories=Jackets">Jackets</Link>
      <Link to="/products?categories=Dresses">Dresses</Link>
      <Link to="/products?categories=Activewear">Activewear</Link>

      {/* With multiple filters */}
      <Link to="/products?categories=Jackets&brands=UrbanStyle&sort=price-low-high">
        Urban Jackets
      </Link>

      {/* Price range */}
      <Link to="/products?priceMin=0&priceMax=500">
        Under $500
      </Link>

      {/* Sale items */}
      <Link to="/products?priceMax=1000&sort=price-low-high">
        Sale Items
      </Link>
    </nav>
  );
}

// Example: Programmatic navigation with filters
import { useNavigate } from 'react-router-dom';

function SearchResults() {
  const navigate = useNavigate();

  const handleCategoryClick = (category: string) => {
    navigate(`/products?categories=${category}`);
  };

  const handleBrandClick = (brand: string) => {
    navigate(`/products?brands=${brand}`);
  };

  const handlePriceRangeClick = (min: number, max: number) => {
    navigate(`/products?priceMin=${min}&priceMax=${max}`);
  };

  return (
    <div>
      <button onClick={() => handleCategoryClick('Jackets')}>
        Browse Jackets
      </button>
      <button onClick={() => handleBrandClick('WinterElegance')}>
        WinterElegance Products
      </button>
      <button onClick={() => handlePriceRangeClick(0, 500)}>
        Under $500
      </button>
    </div>
  );
}

export {
  App,
  ProductsCatalog,
  CategoryProductsPage,
  SaleProductsPage,
  CategoryMenu,
  SearchResults,
};
