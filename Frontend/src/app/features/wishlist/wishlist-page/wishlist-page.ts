import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { WishlistService } from '../../../core/services/wishlist.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistItem } from '../../../core/models/wishlist';

@Component({
  selector: 'app-wishlist-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './wishlist-page.html',
  styleUrl: './wishlist-page.scss',
})
export class WishlistPage implements OnInit {
  protected wishlistService = inject(WishlistService);
  private cartService = inject(CartService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  // Expose wishlist service signals to template
  wishlist = this.wishlistService.wishlist;
  loading = this.wishlistService.loading;
  error = this.wishlistService.error;
  items = this.wishlistService.items;
  itemCount = this.wishlistService.itemCount;
  isEmpty = this.wishlistService.isEmpty;

  ngOnInit(): void {
    // Reload wishlist data when page is visited
    this.wishlistService.loadWishlist();
  }

  removeItem(item: WishlistItem): void {
    this.wishlistService.removeItem(item.id).subscribe({
      next: () => {
        this.showMessage('Articolo rimosso dalla lista');
      },
      error: () => {
        this.showMessage('Errore nella rimozione dell\'articolo', true);
      }
    });
  }

  addToCart(item: WishlistItem): void {
    this.cartService.addToCart(item.productId, 1).subscribe({
      next: () => {
        this.showMessage('Aggiunto al carrello');
      },
      error: (err) => {
        this.showMessage(err.error?.error || 'Errore nell\'aggiunta al carrello', true);
      }
    });
  }

  addAllToCart(): void {
    if (this.items().length === 0) return;

    let successCount = 0;
    let failCount = 0;

    this.items().forEach((item, index) => {
      this.cartService.addToCart(item.productId, 1).subscribe({
        next: () => {
          successCount++;
          if (index === this.items().length - 1) {
            this.showCompletionMessage(successCount, failCount);
          }
        },
        error: () => {
          failCount++;
          if (index === this.items().length - 1) {
            this.showCompletionMessage(successCount, failCount);
          }
        }
      });
    });
  }

  clearWishlist(): void {
    if (confirm('Sei sicuro di voler svuotare l\'intera lista desideri?')) {
      this.wishlistService.clearWishlist().subscribe({
        next: () => {
          this.showMessage('Lista desideri svuotata');
        },
        error: () => {
          this.showMessage('Errore nello svuotamento della lista', true);
        }
      });
    }
  }

  viewProduct(productId: string): void {
    this.router.navigate(['/products', productId]);
  }

  continueShopping(): void {
    this.router.navigate(['/products']);
  }

  private showMessage(message: string, isError: boolean = false): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: isError ? ['error-snackbar'] : ['success-snackbar']
    });
  }

  private showCompletionMessage(successCount: number, failCount: number): void {
    if (failCount === 0) {
      this.showMessage(`Tutti i ${successCount} articoli sono stati aggiunti al carrello`);
    } else if (successCount === 0) {
      this.showMessage('Errore nell\'aggiunta degli articoli al carrello', true);
    } else {
      this.showMessage(`${successCount} articoli aggiunti, ${failCount} falliti`);
    }
  }
}
