export type Size = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';

export interface ProductShop {
  id: string;
  name: string;
  slug?: string;
  logo?: string;
  isVerified?: boolean;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  salePrice?: number;
  discountPercent?: number;
  images: string[];
  model3d?: string;
  sizes: Size[];
  rating: number;
  reviewCount?: number;
  soldCount?: number;
  category: string;
  description?: string;
  characteristics?: Record<string, string>;
  colors?: string[];
  stock?: number;
  sku?: string;
  shopId?: string;
  shop_id?: string;
  shopName?: string;
  shop_name?: string;
  shop?: ProductShop;
  isNew?: boolean;
  isFeatured?: boolean;
  createdAt?: string;
  taxRate?: number;
}

export interface CartItem {
  product: Product;
  size: Size;
  quantity: number;
  color?: string;
}
