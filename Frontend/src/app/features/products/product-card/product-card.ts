import { CurrencyPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Product } from '../../../core/models/product';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Router } from '@angular/router';
import { WishlistService } from '../../../core/services/wishlist.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';


@Component({
  selector: 'app-product-card',
  imports: [CurrencyPipe, MatCardModule, MatButtonModule, MatIconModule, RouterModule, MatSnackBarModule],
  standalone: true,
  templateUrl: `./product-card.html`,
  styleUrls: [`./product-card.scss`],
})

export class ProductCard {
  @Input({ required: true }) product!: Product;
  @Output() add = new EventEmitter<Product>();

  private wishlistService = inject(WishlistService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  // Expose wishlist signals to template
  productIds = this.wishlistService.productIds;

  addToCart(p: Product) {
    this.add.emit(p);
  }

  toggleWishlist(product: Product, event: Event) {
    event.stopPropagation();

    this.wishlistService.toggleProduct(product.id).subscribe({
      next: () => {
        const isInWishlist = this.wishlistService.isInWishlist(product.id);
        const message = isInWishlist
          ? `${product.title} added to wishlist`
          : `${product.title} removed from wishlist`;

        this.snackBar.open(message, 'View Wishlist', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        }).onAction().subscribe(() => {
          this.router.navigate(['/wishlist']);
        });
      },
      error: (err) => {
        if (err.status === 401) {
          this.snackBar.open('Please login to add items to wishlist', 'Login', {
            duration: 5000
          }).onAction().subscribe(() => {
            this.router.navigate(['/login'], {
              queryParams: { returnUrl: this.router.url }
            });
          });
        } else {
          this.snackBar.open(
            err.error?.error || 'Failed to update wishlist',
            'Close',
            {
              duration: 3000,
              panelClass: ['error-snackbar']
            }
          );
        }
      }
    });
  }

  isInWishlist(productId: string): boolean {
    return this.wishlistService.isInWishlist(productId);
  }

  getDiscountPercentage(): number {
    if (this.product.originalPrice && this.product.price && this.product.originalPrice > this.product.price) {
      return Math.round(((this.product.originalPrice - this.product.price) / this.product.originalPrice) * 100);
    }
    return 0;
  }
}
