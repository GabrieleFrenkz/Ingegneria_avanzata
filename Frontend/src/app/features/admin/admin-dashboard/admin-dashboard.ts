import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService, AdminStats, OrdersResponse } from '../../../core/services/admin.service';
import { ProductApi } from '../../../core/services/product-api';
import { Product } from '../../../core/models/product';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { Order } from '../../../core/models/order';

@Component({
  selector: 'app-admin-dashboard',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatButton,
    MatIconButton,
    MatIcon,
    MatProgressSpinner,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatFormField,
    MatLabel,
    MatInput,
    MatExpansionModule,
    MatDividerModule,
  ],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboard implements OnInit {
  private adminService = inject(AdminService);
  private productApi = inject(ProductApi);
  private fb = inject(FormBuilder);

  stats = signal<AdminStats | null>(null);
  products = signal<Product[]>([]);
  orders = signal<OrdersResponse | null>(null);
  loading = signal(true);

  productForm: FormGroup;
  editingProduct = signal<Product | null>(null);

  // Menu laterale
  activeSection = signal<'statistics' | 'products' | 'orders'>('statistics');

  productsColumns = ['id', 'title', 'price', 'quantity', 'actions'];
  ordersColumns = ['id', 'customer', 'total', 'createdAt', 'actions'];
  recentOrdersColumns = ['id', 'customer', 'total', 'createdAt'];

  setActiveSection(section: 'statistics' | 'products' | 'orders'): void {
    this.activeSection.set(section);
  }

  constructor() {
    this.productForm = this.fb.group({
      id: ['', [Validators.required]],
      title: ['', [Validators.required]],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      original_price: [0, [Validators.required, Validators.min(0)]],
      sale: [false],
      quantity: [0, [Validators.required, Validators.min(0)]],
      thumbnail: [''],
      tags: [[]]
    });
  }

  ngOnInit(): void {
    this.loadStats();
    this.loadProducts();
    this.loadOrders();
  }

  loadStats(): void {
    this.adminService.getStats().subscribe({
      next: (stats) => this.stats.set(stats),
      error: (err) => console.error('Error loading stats:', err),
    });
  }

  loadProducts(): void {
    this.loading.set(true);
    this.productApi.list().subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.loading.set(false);
      },
    });
  }

  loadOrders(): void {
    this.adminService.getOrders().subscribe({
      next: (orders) => this.orders.set(orders),
      error: (err) => console.error('Error loading orders:', err),
    });
  }

  // Products Management
  onEditProduct(product: Product): void {
    this.editingProduct.set(product);
    this.productForm.patchValue({
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      original_price: product.originalPrice,
      sale: product.sale,
      quantity: product.quantity || 0,
      thumbnail: product.thumbnail || '',
      tags: product.tags || []
    });
  }

  onSaveProduct(): void {
    if (this.productForm.valid) {
      const formValue = this.productForm.value;
      const productData = {
        id: formValue.id,
        title: formValue.title,
        description: formValue.description,
        price: formValue.price,
        original_price: formValue.original_price,
        sale: formValue.sale,
        quantity: formValue.quantity,
        thumbnail: formValue.thumbnail,
        tags: formValue.tags
      };

      if (this.editingProduct()) {
        // Update existing product
        this.adminService.updateProduct(formValue.id, productData).subscribe({
          next: () => {
            this.loadProducts();
            this.loadStats();
            this.resetForm();
          },
          error: (err) => console.error('Error updating product:', err),
        });
      } else {
        // Create new product
        this.adminService.createProduct(productData).subscribe({
          next: () => {
            this.loadProducts();
            this.loadStats();
            this.resetForm();
          },
          error: (err) => console.error('Error creating product:', err),
        });
      }
    }
  }

  onDeleteProduct(id: string): void {
    if (confirm('Sei sicuro di voler eliminare questo prodotto?')) {
      this.adminService.deleteProduct(id).subscribe({
        next: () => {
          this.loadProducts();
          this.loadStats();
        },
        error: (err) => console.error('Error deleting product:', err),
      });
    }
  }

  onAdjustQuantity(id: string, adjustment: number): void {
    this.adminService.adjustQuantity(id, adjustment).subscribe({
      next: () => {
        this.loadProducts();
        this.loadStats();
      },
      error: (err) => console.error('Error adjusting quantity:', err),
    });
  }

  resetForm(): void {
    this.productForm.reset({
      sale: false,
      price: 0,
      original_price: 0,
      quantity: 0,
      tags: []
    });
    this.editingProduct.set(null);
  }

  // Orders Management
  onDeleteOrder(id: number): void {
    if (confirm('Sei sicuro di voler eliminare questo ordine?')) {
      this.adminService.deleteOrder(id).subscribe({
        next: () => {
          this.loadOrders();
          this.loadStats();
          this.loadProducts(); // Ricarica i prodotti per mostrare le quantità ripristinate
        },
        error: (err) => console.error('Error deleting order:', err),
      });
    }
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
}
