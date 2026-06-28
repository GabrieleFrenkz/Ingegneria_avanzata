import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { switchMap, map } from 'rxjs';
import { ProductApi } from '../../../core/services/product-api';
import { Product } from '../../../core/models/product';
import { NgIf, AsyncPipe, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';

@Component({
  selector: 'app-product-detail-page',
  standalone: true,
  templateUrl: './product-detail-page.html',
  imports: [RouterModule, NgIf, AsyncPipe, CurrencyPipe, MatCardModule, MatButtonModule, MatIconModule, MatSnackBarModule],
})

export class ProductDetailPage {
  private route = inject(ActivatedRoute);
  private svc = inject(ProductApi);
  private cartService = inject(CartService);
  private wishlistService = inject(WishlistService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  readonly product$ = this.route.paramMap.pipe(
    map(params => params.get('id') as string),
    switchMap(id => this.svc.getById(id)),
  );

  isInWishlist(productId: string): boolean {
    return this.wishlistService.isInWishlist(productId);
  }

  toggleWishlist(product: Product) {
    this.wishlistService.toggleProduct(product.id).subscribe({
      next: () => {
        const isInWishlist = this.wishlistService.isInWishlist(product.id);
        const message = isInWishlist
          ? `${product.title} aggiunto alla wishlist`
          : `${product.title} rimosso dalla wishlist`;

        this.snackBar.open(message, 'Vai alla wishlist', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        }).onAction().subscribe(() => {
          this.router.navigate(['/wishlist']);
        });
      },
      error: (err) => {
        if (err.status === 401) {
          this.snackBar.open('Effettua il login per aggiungere prodotti alla wishlist', 'Login', {
            duration: 5000
          }).onAction().subscribe(() => {
            this.router.navigate(['/login'], {
              queryParams: { returnUrl: this.router.url }
            });
          });
        } else {
          this.snackBar.open(
            err.error?.error || 'Errore durante l\'aggiornamento della wishlist',
            'Chiudi',
            {
              duration: 3000,
              panelClass: ['error-snackbar']
            }
          );
        }
      }
    });
  }

  onAddToCart(product: Product) {
    // Check stock availability
    if (!product.inStock || product.quantity === 0) {
      this.snackBar.open('Questo prodotto non è disponibile', 'Chiudi', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.cartService.addToCart(product.id).subscribe({
      next: () => {
        this.snackBar.open(`${product.title} aggiunto al carrello`, 'Vai al carrello', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        }).onAction().subscribe(() => {
          // Navigate to cart when "Vai al carrello" is clicked
          this.router.navigate(['/cart']);
        });
      },
      error: (err) => {
        if (err.status === 401) {
          this.snackBar.open('Effettua il login per aggiungere prodotti al carrello', 'Login', {
            duration: 5000
          }).onAction().subscribe(() => {
            this.router.navigate(['/login'], {
              queryParams: { returnUrl: this.router.url }
            });
          });
        } else {
          this.snackBar.open(
            err.error?.error || 'Errore durante l\'aggiunta al carrello',
            'Chiudi',
            {
              duration: 3000,
              panelClass: ['error-snackbar']
            }
          );
        }
      }
    });
  }
}