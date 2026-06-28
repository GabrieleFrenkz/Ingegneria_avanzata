import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { Wishlist, WishlistItem, AddToWishlistRequest } from '../models/wishlist';
import { AuthService } from './auth-service';

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  private readonly baseUrl = 'http://localhost:3000/api';

  // Signal-based state management
  private wishlistSignal = signal<Wishlist | null>(null);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  // Public computed signals
  wishlist = this.wishlistSignal.asReadonly();
  loading = this.loadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();

  // Computed values
  itemCount = computed(() => this.wishlistSignal()?.itemCount ?? 0);
  items = computed(() => this.wishlistSignal()?.items ?? []);
  isEmpty = computed(() => (this.wishlistSignal()?.items?.length ?? 0) === 0);
  productIds = computed(() =>
    new Set(this.wishlistSignal()?.items?.map(item => item.productId) ?? [])
  );

  constructor(private http: HttpClient, private authService: AuthService) {
    // Load wishlist only if user is authenticated
    if (this.authService.isLoggedIn()) {
      this.loadWishlist();
    }
  }

  /**
   * Load user's wishlist from backend
   */
  loadWishlist(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.http.get<Wishlist>(`${this.baseUrl}/wishlist`).pipe(
      tap(wishlist => {
        this.wishlistSignal.set(wishlist);
        this.loadingSignal.set(false);
      }),
      catchError(error => {
        // Don't show error for 401 (not authenticated) - it's expected behavior
        if (error.status !== 401) {
          console.error('Failed to load wishlist:', error);
          this.errorSignal.set('Failed to load wishlist');
        }
        this.loadingSignal.set(false);
        // Return empty wishlist structure on error
        return of(null);
      })
    ).subscribe();
  }

  /**
   * Add product to wishlist
   */
  addToWishlist(productId: string): Observable<any> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    const request: AddToWishlistRequest = {
      product_id: productId
    };

    return this.http.post<any>(`${this.baseUrl}/wishlist/items`, request).pipe(
      tap(response => {
        this.wishlistSignal.set(response.wishlist);
        this.loadingSignal.set(false);
      }),
      catchError(error => {
        console.error('Failed to add to wishlist:', error);
        this.errorSignal.set(error.error?.error || 'Failed to add item to wishlist');
        this.loadingSignal.set(false);
        throw error;
      })
    );
  }

  /**
   * Remove item from wishlist by item id
   */
  removeItem(itemId: number): Observable<any> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.delete<any>(`${this.baseUrl}/wishlist/items/${itemId}`).pipe(
      tap(response => {
        this.wishlistSignal.set(response.wishlist);
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
   * Remove item from wishlist by product id
   */
  removeItemByProduct(productId: string): Observable<any> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.delete<any>(`${this.baseUrl}/wishlist/items/product/${productId}`).pipe(
      tap(response => {
        this.wishlistSignal.set(response.wishlist);
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
   * Toggle product in wishlist (add if not present, remove if present)
   */
  toggleProduct(productId: string): Observable<any> {
    const inWishlist = this.isInWishlist(productId);

    if (inWishlist) {
      return this.removeItemByProduct(productId);
    } else {
      return this.addToWishlist(productId);
    }
  }

  /**
   * Check if product is in wishlist
   */
  isInWishlist(productId: string): boolean {
    return this.productIds().has(productId);
  }

  /**
   * Clear entire wishlist
   */
  clearWishlist(): Observable<any> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.delete<any>(`${this.baseUrl}/wishlist`).pipe(
      tap(response => {
        this.wishlistSignal.set(response.wishlist);
        this.loadingSignal.set(false);
      }),
      catchError(error => {
        console.error('Failed to clear wishlist:', error);
        this.errorSignal.set(error.error?.error || 'Failed to clear wishlist');
        this.loadingSignal.set(false);
        throw error;
      })
    );
  }

  /**
   * Reset wishlist state (useful for logout)
   */
  resetWishlist(): void {
    this.wishlistSignal.set(null);
    this.errorSignal.set(null);
  }
}
