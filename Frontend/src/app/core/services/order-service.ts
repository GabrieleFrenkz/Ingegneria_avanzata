import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../models/order';

export interface OrderFilters {
  startDate?: string;
  endDate?: string;
  minTotal?: number;
  maxTotal?: number;
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/api';

  create(order: Order): Observable<Order> {
    // Rails expects the data wrapped in an 'order' object
    return this.http.post<Order>(`${this.baseUrl}/orders`, { order });
  }

  getOrders(filters?: OrderFilters): Observable<Order[]> {
    let params = new HttpParams();

    if (filters) {
      if (filters.startDate) {
        params = params.set('start_date', filters.startDate);
      }
      if (filters.endDate) {
        params = params.set('end_date', filters.endDate);
      }
      if (filters.minTotal !== undefined) {
        params = params.set('min_total', filters.minTotal.toString());
      }
      if (filters.maxTotal !== undefined) {
        params = params.set('max_total', filters.maxTotal.toString());
      }
    }

    return this.http.get<Order[]>(`${this.baseUrl}/orders`, { params });
  }
}
