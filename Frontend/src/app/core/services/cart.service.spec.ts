import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CartService } from './cart.service';
import { Cart } from '../models/cart';

const API = 'http://localhost:3000/api';

const mockCart: Cart = {
  id: 1,
  userId: 1,
  items: [],
  total: 0,
  itemCount: 0,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

function setup(): { service: CartService; httpMock: HttpTestingController } {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting()],
  });
  return {
    service: TestBed.inject(CartService),
    httpMock: TestBed.inject(HttpTestingController),
  };
}

describe('CartService', () => {
  let service: CartService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    ({ service, httpMock } = setup());
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it("non carica il carrello alla creazione se l'utente non è autenticato", () => {
    httpMock.expectNone(`${API}/cart`);
  });

  describe("quando l'utente è già autenticato alla creazione del servizio", () => {
    beforeEach(() => {
      localStorage.setItem('auth_token', 'fake-token');
      ({ service, httpMock } = setup());
    });

    it('carica automaticamente il carrello', () => {
      const req = httpMock.expectOne(`${API}/cart`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCart);

      expect(service.cart()).toEqual(mockCart);
    });

    it('ignora silenziosamente un errore 401 nel caricamento automatico del carrello', () => {
      const req = httpMock.expectOne(`${API}/cart`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      expect(service.error()).toBeNull();
    });
  });

  it('addToCart invia una POST con productId e quantity e aggiorna il carrello', () => {
    service.addToCart('prod-1', 2).subscribe();

    const req = httpMock.expectOne(`${API}/cart/items`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ product_id: 'prod-1', quantity: 2 });

    req.flush({ cart: mockCart, item: {} });

    expect(service.cart()).toEqual(mockCart);
    expect(service.loading()).toBe(false);
  });

  it('addToCart imposta un messaggio di errore in caso di fallimento', () => {
    service.addToCart('prod-1').subscribe({ error: () => {} });

    const req = httpMock.expectOne(`${API}/cart/items`);
    req.flush({ error: 'Product not found' }, { status: 404, statusText: 'Not Found' });

    expect(service.error()).toBe('Product not found');
    expect(service.loading()).toBe(false);
  });

  it('updateQuantity invia una PATCH con la nuova quantity', () => {
    service.updateQuantity(5, 3).subscribe();

    const req = httpMock.expectOne(`${API}/cart/items/5`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ quantity: 3 });

    req.flush({ cart: mockCart });
    expect(service.cart()).toEqual(mockCart);
  });

  it('incrementQuantity chiama updateQuantity con quantity + 1', () => {
    service.incrementQuantity(5, 3).subscribe();

    const req = httpMock.expectOne(`${API}/cart/items/5`);
    expect(req.request.body).toEqual({ quantity: 4 });
    req.flush({ cart: mockCart });
  });

  it('decrementQuantity chiama updateQuantity con quantity - 1 se quantity > 1', () => {
    service.decrementQuantity(5, 3).subscribe();

    const req = httpMock.expectOne(`${API}/cart/items/5`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ quantity: 2 });
    req.flush({ cart: mockCart });
  });

  it("decrementQuantity rimuove l'item se la quantity è 1", () => {
    service.decrementQuantity(5, 1).subscribe();

    const req = httpMock.expectOne(`${API}/cart/items/5`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ cart: mockCart });
  });

  it("removeItem invia una DELETE e aggiorna il carrello", () => {
    service.removeItem(5).subscribe();

    const req = httpMock.expectOne(`${API}/cart/items/5`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ cart: mockCart });

    expect(service.cart()).toEqual(mockCart);
  });

  it('clearCart invia una DELETE a /cart e aggiorna il carrello', () => {
    service.clearCart().subscribe();

    const req = httpMock.expectOne(`${API}/cart`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ cart: mockCart });

    expect(service.cart()).toEqual(mockCart);
  });

  it("resetCart azzera il carrello e l'errore", () => {
    service.addToCart('prod-1').subscribe({ error: () => {} });
    httpMock
      .expectOne(`${API}/cart/items`)
      .flush({ error: 'boom' }, { status: 500, statusText: 'Server Error' });
    expect(service.error()).toBeTruthy();

    service.resetCart();

    expect(service.cart()).toBeNull();
    expect(service.error()).toBeNull();
  });

  describe('computed signals su un carrello vuoto', () => {
    it("itemCount e total sono 0, items è vuoto, isEmpty è true", () => {
      expect(service.itemCount()).toBe(0);
      expect(service.total()).toBe(0);
      expect(service.items()).toEqual([]);
      expect(service.isEmpty()).toBe(true);
    });
  });

  describe('computed signals su un carrello popolato', () => {
    it('riflettono i valori del carrello caricato', () => {
      const populatedCart: Cart = {
        ...mockCart,
        itemCount: 3,
        total: 45.5,
        items: [{ id: 1 } as unknown as Cart['items'][number]],
      };
      service.addToCart('prod-1').subscribe();
      httpMock.expectOne(`${API}/cart/items`).flush({ cart: populatedCart });

      expect(service.itemCount()).toBe(3);
      expect(service.total()).toBe(45.5);
      expect(service.items().length).toBe(1);
      expect(service.isEmpty()).toBe(false);
    });
  });
});
