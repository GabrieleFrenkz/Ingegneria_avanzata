import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CartService } from '../../../core/services/cart.service';
import { CartItem } from '../../../core/models/cart';

@Component({
  selector: 'app-cart-page',
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
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.scss',
})
export class CartPage implements OnInit {
  protected cartService = inject(CartService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  // Expose cart service signals to template
  cart = this.cartService.cart;
  loading = this.cartService.loading;
  error = this.cartService.error;
  items = this.cartService.items;
  total = this.cartService.total;
  itemCount = this.cartService.itemCount;
  isEmpty = this.cartService.isEmpty;

  ngOnInit(): void {
    // Reload cart data when page is visited
    this.cartService.loadCart();
  }

  incrementQuantity(item: CartItem): void {
    this.cartService.incrementQuantity(item.id, item.quantity).subscribe({
      next: () => {
        this.showMessage('Quantità aggiornata');
      },
      error: (err) => {
        this.showMessage(err.error?.details?.[0] || 'Errore nell\'aggiornamento della quantità', true);
      }
    });
  }

  decrementQuantity(item: CartItem): void {
    this.cartService.decrementQuantity(item.id, item.quantity).subscribe({
      next: () => {
        this.showMessage(item.quantity === 1 ? 'Articolo rimosso' : 'Quantità aggiornata');
      },
      error: () => {
        this.showMessage('Errore nell\'aggiornamento della quantità', true);
      }
    });
  }

  removeItem(item: CartItem): void {
    this.cartService.removeItem(item.id).subscribe({
      next: () => {
        this.showMessage('Articolo rimosso dal carrello');
      },
      error: () => {
        this.showMessage('Errore nella rimozione dell\'articolo', true);
      }
    });
  }

  clearCart(): void {
    if (confirm('Sei sicuro di voler svuotare l\'intero carrello?')) {
      this.cartService.clearCart().subscribe({
        next: () => {
          this.showMessage('Carrello svuotato');
        },
        error: () => {
          this.showMessage('Errore nello svuotamento del carrello', true);
        }
      });
    }
  }

  goToCheckout(): void {
    this.router.navigate(['/checkout']);
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
}
