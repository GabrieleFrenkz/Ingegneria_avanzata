import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { FormsModule } from '@angular/forms';
import { OrderService, OrderFilters } from '../../../core/services/order-service';
import { Order } from '../../../core/models/order';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatExpansionModule
  ],
  templateUrl: './order-history.html',
  styleUrl: './order-history.scss',
})
export class OrderHistoryPage implements OnInit {
  private orderService = inject(OrderService);

  orders = signal<Order[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Filtri
  startDate: Date | null = null;
  endDate: Date | null = null;
  minTotal: number | null = null;
  maxTotal: number | null = null;

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.error.set(null);

    const filters: OrderFilters = {};

    if (this.startDate) {
      filters.startDate = this.formatDate(this.startDate);
    }
    if (this.endDate) {
      filters.endDate = this.formatDate(this.endDate);
    }
    if (this.minTotal !== null && this.minTotal > 0) {
      filters.minTotal = this.minTotal;
    }
    if (this.maxTotal !== null && this.maxTotal > 0) {
      filters.maxTotal = this.maxTotal;
    }

    this.orderService.getOrders(filters).subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.error || 'Errore nel caricamento degli ordini');
        this.loading.set(false);
      }
    });
  }

  applyFilters(): void {
    this.loadOrders();
  }

  clearFilters(): void {
    this.startDate = null;
    this.endDate = null;
    this.minTotal = null;
    this.maxTotal = null;
    this.loadOrders();
  }

  getOrderItemsCount(order: Order): number {
    return order.orderItems?.reduce((total, item) => total + item.quantity, 0) || 0;
  }

  formatOrderDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
