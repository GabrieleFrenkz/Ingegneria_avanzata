import { Component, computed, inject } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatToolbar, MatToolbarRow } from '@angular/material/toolbar';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth-service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';

@Component({
  selector: 'app-header',
  imports: [MatIcon, MatToolbar, MatButton, MatIconButton, MatToolbarRow, MatMenu, MatMenuItem, MatMenuTrigger, MatBadgeModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private router = inject(Router);
  authService = inject(AuthService);
  cartService = inject(CartService);
  wishlistService = inject(WishlistService);

  currentUser = this.authService.currentUser;
  isLoggedIn = this.authService.isLoggedIn;
  isAdmin = computed(() => this.authService.currentUser()?.role === 'admin');

  // Cart and Wishlist badges
  cartItemCount = this.cartService.itemCount;
  wishlistItemCount = this.wishlistService.itemCount;

  goToCart(): void {
    this.router.navigate(['/cart']);
  }

  goToWishlist(): void {
    this.router.navigate(['/wishlist']);
  }

  goToCheckout(): void {
    this.router.navigate(['/checkout']);
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  goToAdmin(): void {
    this.router.navigate(['/admin']);
  }

  goToOrders(): void {
    this.router.navigate(['/orders']);
  }

  logout(): void {
    this.authService.logout();
    this.cartService.resetCart();
    this.wishlistService.resetWishlist();
    this.router.navigate(['/products']);
  }
}
