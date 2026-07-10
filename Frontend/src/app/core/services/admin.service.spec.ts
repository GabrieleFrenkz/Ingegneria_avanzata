import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AdminService } from './admin.service';

const API = 'http://localhost:3000/api/admin';

describe('AdminService', () => {
  let service: AdminService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('createProduct invia una POST con il prodotto avvolto in { product }', () => {
    service.createProduct({ title: 'Nuovo' }).subscribe();

    const req = httpMock.expectOne(`${API}/products`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ product: { title: 'Nuovo' } });
    req.flush({ message: 'ok', product: {} });
  });

  it('updateProduct invia una PUT con id e prodotto avvolto in { product }', () => {
    service.updateProduct('prod-1', { price: 10 }).subscribe();

    const req = httpMock.expectOne(`${API}/products/prod-1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ product: { price: 10 } });
    req.flush({ message: 'ok', product: {} });
  });

  it('deleteProduct invia una DELETE per id', () => {
    service.deleteProduct('prod-1').subscribe();

    const req = httpMock.expectOne(`${API}/products/prod-1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: 'ok' });
  });

  it('adjustQuantity invia una PATCH con l\'adjustment', () => {
    service.adjustQuantity('prod-1', -3).subscribe();

    const req = httpMock.expectOne(`${API}/products/prod-1/adjust_quantity`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ adjustment: -3 });
    req.flush({ message: 'ok', product: {} });
  });

  it('getOrders senza userId chiama /orders senza query string', () => {
    service.getOrders().subscribe();

    const req = httpMock.expectOne(`${API}/orders`);
    expect(req.request.method).toBe('GET');
    req.flush({ orders: [], stats: {} });
  });

  it('getOrders con userId aggiunge il filtro nella query string', () => {
    service.getOrders(42).subscribe();

    const req = httpMock.expectOne(`${API}/orders?user_id=42`);
    expect(req.request.method).toBe('GET');
    req.flush({ orders: [], stats: {} });
  });

  it('getOrderById invia una GET per id', () => {
    service.getOrderById(5).subscribe();

    const req = httpMock.expectOne(`${API}/orders/5`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('deleteOrder invia una DELETE per id', () => {
    service.deleteOrder(5).subscribe();

    const req = httpMock.expectOne(`${API}/orders/5`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: 'ok' });
  });

  it('getStats invia una GET a /stats', () => {
    service.getStats().subscribe();

    const req = httpMock.expectOne(`${API}/stats`);
    expect(req.request.method).toBe('GET');
    req.flush({
      total_orders: 0,
      total_revenue: 0,
      total_users: 0,
      total_products: 0,
      low_stock_products: 0,
      recent_orders: [],
    });
  });
});
