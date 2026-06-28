import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product';

export interface AdminStats {
  total_orders: number;
  total_revenue: number;
  total_users: number;
  total_products: number;
  low_stock_products: number;
  recent_orders: any[];
}

export interface OrdersResponse {
  orders: any[];
  stats: {
    total_orders: number;
    total_revenue: number;
    orders_by_status: {
      with_user: number;
      guest: number;
    };
  };
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly baseUrl = 'http://localhost:3000/api/admin';

  constructor(private readonly http: HttpClient) {}

  // Products Management
  createProduct(product: Partial<Product>): Observable<{ message: string; product: Product }> {
    return this.http.post<{ message: string; product: Product }>(
      `${this.baseUrl}/products`,
      { product }
    );
  }

  updateProduct(id: string, product: Partial<Product>): Observable<{ message: string; product: Product }> {
    return this.http.put<{ message: string; product: Product }>(
      `${this.baseUrl}/products/${id}`,
      { product }
    );
  }

  deleteProduct(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/products/${id}`);
  }

  adjustQuantity(id: string, adjustment: number): Observable<{ message: string; product: Product }> {
    return this.http.patch<{ message: string; product: Product }>(
      `${this.baseUrl}/products/${id}/adjust_quantity`,
      { adjustment }
    );
  }

  // Orders Management
  getOrders(userId?: number): Observable<OrdersResponse> {
    const url = userId ? `${this.baseUrl}/orders?user_id=${userId}` : `${this.baseUrl}/orders`;
    return this.http.get<OrdersResponse>(url);
  }

  getOrderById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/orders/${id}`);
  }

  deleteOrder(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/orders/${id}`);
  }

  // Stats
  getStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.baseUrl}/stats`);
  }
}
