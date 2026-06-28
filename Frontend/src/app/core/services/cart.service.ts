import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { Cart, CartItem, AddToCartRequest, UpdateCartItemRequest } from '../models/cart';
import { AuthService } from './auth-service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly baseUrl = 'http://localhost:3000/api';

  // Signal-based state management
  private cartSignal = signal<Cart | null>(null);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  // Public computed signals
  cart = this.cartSignal.asReadonly();
  loading = this.loadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();

  // Computed values
  itemCount = computed(() => this.cartSignal()?.itemCount ?? 0);
  total = computed(() => this.cartSignal()?.total ?? 0);
  items = computed(() => this.cartSignal()?.items ?? []);
  isEmpty = computed(() => (this.cartSignal()?.items?.length ?? 0) === 0);

  constructor(private http: HttpClient, private authService: AuthService) {
    // Load cart only if user is authenticated
    if (this.authService.isLoggedIn()) {
      this.loadCart();
    }
  }

  /**
   * Load user's cart from backend
   */
  loadCart(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.http.get<Cart>(`${this.baseUrl}/cart`).pipe(
      tap(cart => {
        this.cartSignal.set(cart);
        this.loadingSignal.set(false);
      }),
      catchError(error => {
        // Don't show error for 401 (not authenticated) - it's expected behavior
        if (error.status !== 401) {
          console.error('Failed to load cart:', error);
          this.errorSignal.set('Failed to load cart');
        }
        this.loadingSignal.set(false);
        // Return empty cart structure on error
        return of(null);
      })
    ).subscribe();
  }

  /**
   * Add product to cart
   */
  addToCart(productId: string, quantity: number = 1): Observable<any> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    const request: AddToCartRequest = {
      product_id: productId,
      quantity: quantity
    };

    return this.http.post<any>(`${this.baseUrl}/cart/items`, request).pipe(
      tap(response => {
        this.cartSignal.set(response.cart);
        this.loadingSignal.set(false);
      }),
      catchError(error => {
        console.error('Failed to add to cart:', error);
        this.errorSignal.set(error.error?.error || 'Failed to add item to cart');
        this.loadingSignal.set(false);
        throw error;
      })
    );
  }

  /**
   * Update cart item quantity
   */
  updateQuantity(itemId: number, quantity: number): Observable<any> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    const request: UpdateCartItemRequest = { quantity };

    return this.http.patch<any>(`${this.baseUrl}/cart/items/${itemId}`, request).pipe(
      tap(response => {
        this.cartSignal.set(response.cart);
        this.loadingSignal.set(false);
      }),
      catchError(error => {
        console.error('Failed to update quantity:', error);
        this.errorSignal.set(error.error?.error || 'Failed to update quantity');
        this.loadingSignal.set(false);
        throw error;
      })
    );
  }

  /**
   * Increase item quantity by 1
   */
  incrementQuantity(itemId: number, currentQuantity: number): Observable<any> {
    return this.updateQuantity(itemId, currentQuantity + 1);
  }

  /**
   * Decrease item quantity by 1
   */
  decrementQuantity(itemId: number, currentQuantity: number): Observable<any> {
    if (currentQuantity <= 1) {
      return this.removeItem(itemId);
    }
    return this.updateQuantity(itemId, currentQuantity - 1);
  }

  /**
   * Remove item from cart
   */
  removeItem(itemId: number): Observable<any> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.delete<any>(`${this.baseUrl}/cart/items/${itemId}`).pipe(
      tap(response => {
        this.cartSignal.set(response.cart);
        this.loadingSignal.set(false);
      }),
      catchError(error => {
        console.error('Failed to remove item:', error);
        this.errorSignal.set(error.error?.error || 'Failed to remove item');
        this.loadingSignal.set(false);
        throw error;
      })
    );
  }

  /**
   * Clear entire cart
   */
  clearCart(): Observable<any> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.delete<any>(`${this.baseUrl}/cart`).pipe(
      tap(response => {
        this.cartSignal.set(response.cart);
        this.loadingSignal.set(false);
      }),
      catchError(error => {
        console.error('Failed to clear cart:', error);
        this.errorSignal.set(error.error?.error || 'Failed to clear cart');
        this.loadingSignal.set(false);
        throw error;
      })
    );
  }

  /**
   * Reset cart state (useful for logout)
   */
  resetCart(): void {
    this.cartSignal.set(null);
    this.errorSignal.set(null);
  }
}
