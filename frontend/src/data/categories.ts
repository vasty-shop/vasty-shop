import { Category } from '@/types/category';
import { Shirt, Zap, Home, Dumbbell, Sparkles, Book, ShoppingBag } from 'lucide-react';

export const categories: Category[] = [
  {
    id: 'mens-fashion',
    slug: 'mens-fashion',
    name: "Men's Fashion",
    icon: 'Shirt',
    description: 'Discover the latest trends in men\'s clothing, from casual wear to formal attire',
    bannerImage: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=1200',
    priceRange: { min: 29.99, max: 999.99 },
    relevantFilters: ['size', 'color', 'brand', 'price', 'material', 'style'],
    subcategories: [
      { id: 'mens-shirts', name: 'Shirts', slug: 'shirts' },
      { id: 'mens-pants', name: 'Pants', slug: 'pants' },
      { id: 'mens-shoes', name: 'Shoes', slug: 'shoes' },
      { id: 'mens-accessories', name: 'Accessories', slug: 'accessories' },
    ],
  },
  {
    id: 'womens-fashion',
    slug: 'womens-fashion',
    name: "Women's Fashion",
    icon: 'ShoppingBag',
    description: 'Explore elegant and stylish women\'s fashion for every occasion',
    bannerImage: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200',
    priceRange: { min: 34.99, max: 1299.99 },
    relevantFilters: ['size', 'color', 'brand', 'price', 'material', 'style', 'occasion'],
    subcategories: [
      { id: 'womens-dresses', name: 'Dresses', slug: 'dresses' },
      { id: 'womens-tops', name: 'Tops', slug: 'tops' },
      { id: 'womens-bottoms', name: 'Bottoms', slug: 'bottoms' },
      { id: 'womens-shoes', name: 'Shoes', slug: 'shoes' },
      { id: 'womens-accessories', name: 'Accessories', slug: 'accessories' },
    ],
  },
  {
    id: 'electronics',
    slug: 'electronics',
    name: 'Electronics',
    icon: 'Zap',
    description: 'Cutting-edge technology and electronics for modern living',
    bannerImage: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200',
    priceRange: { min: 99.99, max: 3999.99 },
    relevantFilters: ['brand', 'price', 'rating', 'features'],
    subcategories: [
      { id: 'phones', name: 'Phones', slug: 'phones' },
      { id: 'laptops', name: 'Laptops', slug: 'laptops' },
      { id: 'cameras', name: 'Cameras', slug: 'cameras' },
      { id: 'audio', name: 'Audio', slug: 'audio' },
    ],
  },
  {
    id: 'home-living',
    slug: 'home-living',
    name: 'Home & Living',
    icon: 'Home',
    description: 'Transform your space with our curated home decor and living essentials',
    bannerImage: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=1200',
    priceRange: { min: 19.99, max: 2499.99 },
    relevantFilters: ['color', 'brand', 'price', 'material', 'room'],
    subcategories: [
      { id: 'furniture', name: 'Furniture', slug: 'furniture' },
      { id: 'decor', name: 'Decor', slug: 'decor' },
      { id: 'bedding', name: 'Bedding', slug: 'bedding' },
      { id: 'kitchen', name: 'Kitchen', slug: 'kitchen' },
    ],
  },
  {
    id: 'sports',
    slug: 'sports',
    name: 'Sports & Fitness',
    icon: 'Dumbbell',
    description: 'Gear up for your active lifestyle with premium sports equipment',
    bannerImage: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200',
    priceRange: { min: 24.99, max: 1499.99 },
    relevantFilters: ['size', 'color', 'brand', 'price', 'activity'],
    subcategories: [
      { id: 'activewear', name: 'Activewear', slug: 'activewear' },
      { id: 'equipment', name: 'Equipment', slug: 'equipment' },
      { id: 'footwear', name: 'Footwear', slug: 'footwear' },
      { id: 'accessories', name: 'Accessories', slug: 'accessories' },
    ],
  },
  {
    id: 'beauty',
    slug: 'beauty',
    name: 'Beauty & Personal Care',
    icon: 'Sparkles',
    description: 'Premium beauty and personal care products for your daily routine',
    bannerImage: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200',
    priceRange: { min: 14.99, max: 499.99 },
    relevantFilters: ['brand', 'price', 'skinType', 'category'],
    subcategories: [
      { id: 'skincare', name: 'Skincare', slug: 'skincare' },
      { id: 'makeup', name: 'Makeup', slug: 'makeup' },
      { id: 'haircare', name: 'Haircare', slug: 'haircare' },
      { id: 'fragrance', name: 'Fragrance', slug: 'fragrance' },
    ],
  },
  {
    id: 'books',
    slug: 'books',
    name: 'Books & Media',
    icon: 'Book',
    description: 'Explore our vast collection of books, e-books, and media',
    bannerImage: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=1200',
    priceRange: { min: 9.99, max: 89.99 },
    relevantFilters: ['genre', 'author', 'price', 'format', 'rating'],
    subcategories: [
      { id: 'fiction', name: 'Fiction', slug: 'fiction' },
      { id: 'non-fiction', name: 'Non-Fiction', slug: 'non-fiction' },
      { id: 'educational', name: 'Educational', slug: 'educational' },
      { id: 'magazines', name: 'Magazines', slug: 'magazines' },
    ],
  },
];

export const getCategoryBySlug = (slug: string): Category | undefined => {
  return categories.find((cat) => cat.slug === slug);
};

export const getCategoryIcon = (iconName: string) => {
  const icons: Record<string, any> = {
    Shirt,
    ShoppingBag,
    Zap,
    Home,
    Dumbbell,
    Sparkles,
    Book,
  };
  return icons[iconName] || Shirt;
};
