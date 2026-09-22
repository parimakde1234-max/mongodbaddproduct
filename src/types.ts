export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  quantity: number; // Stock count
  category: string;
  colors: ProductColor[];
  sizes: string[];
  mainImage: string;
  gallery: string[]; // Multiple photos
  sku?: string;
  tags?: string[];
  isFeatured?: boolean;
  status: 'published' | 'draft';
  createdAt: string;
  updatedAt?: string;
}

export interface CartItem {
  id: string; // unique cart item id (productId + color + size)
  productId: string;
  product: Product;
  selectedColor: ProductColor;
  selectedSize: string;
  quantity: number;
}

export interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  paymentMethod: 'card' | 'cod' | 'upi';
}

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  color: string;
  size: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

export interface DatabaseStatus {
  connected: boolean;
  type: 'mongodb' | 'local';
  databaseName?: string;
  message: string;
  error?: string;
}
