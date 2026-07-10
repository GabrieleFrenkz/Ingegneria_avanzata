import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { OrderService } from './order-service';
import { Order } from '../models/order';

const API = 'http://localhost:3000/api';

const mockOrder: Order = {
  customer: { firstName: 'Mario', lastName: 'Rossi', email: 'mario@example.com' },
  address: { street: 'Via Roma 1', city: 'Milano', zip: '20100' },
  total: 50.0,
  createdAt: '2026-01-01T00:00:00Z',
};

describe('OrderService', () => {
  let service: OrderService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(OrderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it("create invia una POST a /orders con l'ordine avvolto in { order }", () => {
    service.create(mockOrder).subscribe();

    const req = httpMock.expectOne(`${API}/orders`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ order: mockOrder });
    req.flush(mockOrder);
  });

  it('getOrders senza filtri chiama GET /orders senza query params', () => {
    service.getOrders().subscribe();

    const req = httpMock.expectOne(`${API}/orders`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.keys().length).toBe(0);
    req.flush([]);
  });

  it('getOrders con startDate e endDate aggiunge start_date e end_date', () => {
    service.getOrders({ startDate: '2026-01-01', endDate: '2026-01-31' }).subscribe();

    const req = httpMock.expectOne(
      (r) =>
        r.url === `${API}/orders` &&
        r.params.get('start_date') === '2026-01-01' &&
        r.params.get('end_date') === '2026-01-31'
    );
    req.flush([]);
  });

  it('getOrders con minTotal e maxTotal aggiunge min_total e max_total', () => {
    service.getOrders({ minTotal: 10, maxTotal: 100 }).subscribe();

    const req = httpMock.expectOne(
      (r) =>
        r.url === `${API}/orders` &&
        r.params.get('min_total') === '10' &&
        r.params.get('max_total') === '100'
    );
    req.flush([]);
  });
});
