import { Product } from './product';

export interface WishlistItem {
  id: number;
  wishlistId: number;
  productId: string;
  product: Product;
  createdAt: string;
  updatedAt: string;
}

export interface Wishlist {
  id: number;
  userId: number;
  items: WishlistItem[];
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AddToWishlistRequest {
  product_id: string;
}
