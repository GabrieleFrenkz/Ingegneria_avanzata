import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../models/product';
import { HttpClient, HttpParams } from '@angular/common/http';

export interface ProductFilters {
  title?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'price_asc' | 'price_desc' | 'date_asc' | 'date_desc';
}

@Injectable({
  providedIn: 'root',
})
export class ProductApi {
  private readonly baseUrl = 'http://localhost:3000/api';

  constructor(private readonly http: HttpClient) { }

  list(filters?: ProductFilters): Observable<Product[]> {
    let params = new HttpParams();

    if (filters) {
      if (filters.title) {
        params = params.set('title', filters.title);
      }
      if (filters.minPrice !== undefined && filters.minPrice !== null) {
        params = params.set('min_price', filters.minPrice.toString());
      }
      if (filters.maxPrice !== undefined && filters.maxPrice !== null) {
        params = params.set('max_price', filters.maxPrice.toString());
      }
      if (filters.sort) {
        params = params.set('sort', filters.sort);
      }
    }

    console.log('API request filters:', filters);
    console.log('API request params:', params.toString());

    return this.http.get<Product[]>(`${this.baseUrl}/products`, { params });
  }

  getById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/products/${id}`);
  }
}