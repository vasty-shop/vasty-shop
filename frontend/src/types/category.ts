export interface Subcategory {
  id: string;
  name: string;
  slug: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  icon: string;
  description: string;
  subcategories?: Subcategory[];
  bannerImage?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  relevantFilters?: string[];
}

export interface CategoryFilter {
  id: string;
  name: string;
  type: 'checkbox' | 'range' | 'color';
  options?: Array<{ label: string; value: string }>;
  range?: { min: number; max: number };
}
