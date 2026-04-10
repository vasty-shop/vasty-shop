export type Size = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';

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
  category: string;
  description?: string;
  characteristics?: Record<string, string>;
  colors?: string[];
}

export interface CartItem {
  product: Product;
  size: Size;
  quantity: number;
  color?: string;
}
