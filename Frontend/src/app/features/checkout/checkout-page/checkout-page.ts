import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { inject } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import { MatOption, MatSelect } from '@angular/material/select';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order-service';
import { Order } from '../../../core/models/order';

@Component({
  selector: 'app-checkout-page',
  imports: [CommonModule, ReactiveFormsModule, MatSelect, MatFormFieldModule, MatInputModule, MatCheckboxModule, MatOption],
  templateUrl: './checkout-page.html',
  styleUrl: './checkout-page.scss',
})
export class CheckoutPage {
  private fb = inject(FormBuilder);

  readonly form = this.fb.group({
    customer: this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
    }),
    address: this.fb.group({
      street: ['', [Validators.required]],
      city: ['', [Validators.required]],
      zip: ['', [Validators.required, Validators.pattern('^[0-9]{5}$')]],

    }),
    shippingMethod: ['standard', Validators.required],
    privacy: [false, Validators.requiredTrue]
  });


  getControl(path: string) {
    return this.form.get(path);
  }
  hasError(path: string, errorCode: string) {
    const control = this.getControl(path);
    return !!control && control.hasError(errorCode) && control.touched;
  }

  showSummary = false;
  private cart = inject(CartService);
  private orderService = inject(OrderService);
  readonly items = this.cart.items;
  readonly total = this.cart.total;
  readonly isEmpty = this.cart.isEmpty;
  loading = false;
  orderSuccess = false;
  orderError = false;
  errorMessage = '';

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.showSummary = true;
      this.focusFirstInvalid();
      return;
    }

    // Check if cart is empty
    if (this.isEmpty()) {
      this.orderError = true;
      this.errorMessage = 'Il carrello è vuoto. Aggiungi dei prodotti prima di procedere.';
      return;
    }

    this.loading = true;
    this.orderSuccess = false;
    this.orderError = false;
    this.errorMessage = '';
    const value = this.form.getRawValue();

    // Convert cart items to order format
    const orderItems = this.items().map(item => ({
      ...item.product,
      quantity: item.quantity
    }));

    const order: Order = {
      customer: value.customer!,
      address: value.address!,
      items: orderItems,
      total: this.total(),
      createdAt: new Date().toISOString()
    };

    this.orderService.create(order).subscribe({
      next: () => {
        this.loading = false;
        this.orderSuccess = true;
        this.orderError = false;
        this.errorMessage = '';
        this.form.reset();
        // Clear cart after successful order
        this.cart.clearCart().subscribe();
      },
      error: (error) => {
        this.loading = false;
        this.orderSuccess = false;
        this.orderError = true;
        // Extract error message from backend response
        this.errorMessage = error.error?.error || error.error?.errors?.[0] || 'Si è verificato un errore durante la creazione dell\'ordine. Riprova.';
      }
    });
  }

  private focusFirstInvalid(): void {
    const firstInvalid = document.querySelector(
      'form.ng-invalid [formcontrolname]'
    ) as HTMLElement | null;
    firstInvalid?.focus();
  }
}
