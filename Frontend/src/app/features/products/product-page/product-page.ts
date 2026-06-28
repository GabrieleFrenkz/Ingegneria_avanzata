import { Component, inject } from '@angular/core';
import { ProductCard } from '../product-card/product-card';
import { Product } from '../../../core/models/product';
import { ProductApi } from '../../../core/services/product-api';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { AsyncPipe } from '@angular/common';
import { BehaviorSubject, map, debounceTime, distinctUntilChanged, switchMap, combineLatest } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';
import { PageEvent, MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CartService } from '../../../core/services/cart.service';
import { Router } from '@angular/router';

type Sort = 'priceAsc' | 'priceDesc' | 'dateAsc' | 'dateDesc';

@Component({
  selector: 'app-product-page',
  imports: [ProductCard, FormsModule, MatPaginatorModule, MatFormFieldModule, MatInput, MatLabel, MatSelectModule, AsyncPipe, MatSnackBarModule],
  templateUrl: './product-page.html',
  styleUrl: './product-page.scss',
})
export class ProductPage {
  private service = inject(ProductApi);
  private cartService = inject(CartService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  protected filters$ = new BehaviorSubject({
    title: '',
    sort: 'dateDesc' as Sort,
    priceMin: '',
    priceMax: '',
  });

  // Observable for current sort value
  protected currentSort$ = this.filters$.pipe(map(f => f.sort));

  // Convert frontend sort format to backend format
  private mapSortToBackend(sort: Sort): 'price_asc' | 'price_desc' | 'date_asc' | 'date_desc' {
    const sortMap = {
      'priceAsc': 'price_asc',
      'priceDesc': 'price_desc',
      'dateAsc': 'date_asc',
      'dateDesc': 'date_desc'
    } as const;
    return sortMap[sort];
  }

  // Products filtered by backend
  filteredProducts$ = this.filters$.pipe(
    debounceTime(300),
    distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
    switchMap(filters => {
      return this.service.list({
        title: filters.title || undefined,
        minPrice: filters.priceMin ? Number(filters.priceMin) : undefined,
        maxPrice: filters.priceMax ? Number(filters.priceMax) : undefined,
        sort: this.mapSortToBackend(filters.sort)
      });
    })
  );

  page$ = new BehaviorSubject(1);
  pageSize = 10;
  paged$ = combineLatest([this.filteredProducts$, this.page$]).pipe(
    map(([items, page]) => {
      const start = (page - 1) * this.pageSize;
      const end = start + this.pageSize;
      return items.slice(start, end);
    })
  );
  updateTitle(title: string) {
    this.page$.next(1); // Reset to first page when filters change
    this.filters$.next({ ...this.filters$.value, title: title });
  }

  updateMin(min: string) {
    this.page$.next(1); // Reset to first page when filters change
    this.filters$.next({ ...this.filters$.value, priceMin: min });
  }

  updateMax(max: string) {
    this.page$.next(1); // Reset to first page when filters change
    this.filters$.next({ ...this.filters$.value, priceMax: max });
  }

  onAddToCart(product: Product) {
    // Check stock availability
    if (!product.inStock || product.quantity === 0) {
      this.snackBar.open('This product is out of stock', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.cartService.addToCart(product.id).subscribe({
      next: () => {
        this.snackBar.open(`${product.title} added to cart`, 'View Cart', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        }).onAction().subscribe(() => {
          // Navigate to cart when "View Cart" is clicked
          this.router.navigate(['/cart']);
        });
      },
      error: (err) => {
        if (err.status === 401) {
          this.snackBar.open('Please login to add items to cart', 'Login', {
            duration: 5000
          }).onAction().subscribe(() => {
            this.router.navigate(['/login'], {
              queryParams: { returnUrl: this.router.url }
            });
          });
        } else {
          this.snackBar.open(
            err.error?.error || 'Failed to add to cart',
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
  updateSort(sort: Sort) {
    this.page$.next(1); // Reset to first page when sort changes
    this.filters$.next({ ...this.filters$.value, sort: sort });
  }
  onPage(e: PageEvent) {
    this.page$.next(e.pageIndex + 1);
  }

}

