import { Product } from './product';

export interface CartItem {
  id: number;
  cartId: number;
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  product: Product;
  createdAt: string;
  updatedAt: string;
}

export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
  total: number;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AddToCartRequest {
  product_id: string;
  quantity?: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}
