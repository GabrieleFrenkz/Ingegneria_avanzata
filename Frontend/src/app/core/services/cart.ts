import { Injectable } from '@angular/core';
import { inject } from '@angular/core';
import { ProductApi } from './product-api';
import { map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root',
})
export class CartService {
  products$ = inject(ProductApi);

  list() {
    return this.products$.list().pipe(
      map(products => products.slice(0, 5)), // Example: limit to 5 products
    );
  }
}
