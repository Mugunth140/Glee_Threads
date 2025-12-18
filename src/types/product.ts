export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: number;
  category_name?: string;
  material?: string;
  care_instructions?: string;
  is_visible?: boolean;
  is_active: boolean;
  created_at?: string;
  sizes?: ProductSize[];
  images?: ProductImage[];
  colors?: string[];
}

export interface ProductSize {
  size_id: number;
  size_name: string;
  quantity: number;
  sku: string;
}

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  display_order: number;
  is_primary: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
}

export interface Size {
  id: number;
  name: string;
  display_order: number;
}

export interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  product_name: string;
  product_image: string;
  price: number;
  size_id: number;
  size_name: string;
  quantity: number;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'user' | 'admin';
}
