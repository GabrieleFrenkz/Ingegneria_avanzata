import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ProductApi } from './product-api';

const API = 'http://localhost:3000/api';

describe('ProductApi', () => {
  let service: ProductApi;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProductApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('list senza filtri chiama GET /products senza query params', () => {
    service.list().subscribe();

    const req = httpMock.expectOne(`${API}/products`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.keys().length).toBe(0);
    req.flush([]);
  });

  it('list con title aggiunge il param title', () => {
    service.list({ title: 'maglietta' }).subscribe();

    const req = httpMock.expectOne(
      (r) => r.url === `${API}/products` && r.params.get('title') === 'maglietta'
    );
    req.flush([]);
  });

  it('list con minPrice e maxPrice aggiunge min_price e max_price', () => {
    service.list({ minPrice: 10, maxPrice: 50 }).subscribe();

    const req = httpMock.expectOne(
      (r) =>
        r.url === `${API}/products` &&
        r.params.get('min_price') === '10' &&
        r.params.get('max_price') === '50'
    );
    req.flush([]);
  });

  it('list con sort aggiunge il param sort', () => {
    service.list({ sort: 'price_asc' }).subscribe();

    const req = httpMock.expectOne(
      (r) => r.url === `${API}/products` && r.params.get('sort') === 'price_asc'
    );
    req.flush([]);
  });

  it('getById invia una GET a /products/:id', () => {
    service.getById('prod-1').subscribe();

    const req = httpMock.expectOne(`${API}/products/prod-1`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });
});
