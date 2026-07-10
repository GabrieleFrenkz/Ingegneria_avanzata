import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { WishlistService } from './wishlist.service';
import { Wishlist } from '../models/wishlist';

const API = 'http://localhost:3000/api';

const mockWishlist: Wishlist = {
  id: 1,
  userId: 1,
  items: [],
  itemCount: 0,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

function setup(): { service: WishlistService; httpMock: HttpTestingController } {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting()],
  });
  return {
    service: TestBed.inject(WishlistService),
    httpMock: TestBed.inject(HttpTestingController),
  };
}

describe('WishlistService', () => {
  let service: WishlistService;
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

  it("non carica la wishlist alla creazione se l'utente non è autenticato", () => {
    httpMock.expectNone(`${API}/wishlist`);
  });

  it("carica automaticamente la wishlist se l'utente è già autenticato alla creazione", () => {
    localStorage.setItem('auth_token', 'fake-token');
    ({ service, httpMock } = setup());

    const req = httpMock.expectOne(`${API}/wishlist`);
    expect(req.request.method).toBe('GET');
    req.flush(mockWishlist);

    expect(service.wishlist()).toEqual(mockWishlist);
  });

  it('addToWishlist invia una POST con il productId e aggiorna la wishlist', () => {
    service.addToWishlist('prod-1').subscribe();

    const req = httpMock.expectOne(`${API}/wishlist/items`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ product_id: 'prod-1' });

    req.flush({ wishlist: mockWishlist });
    expect(service.wishlist()).toEqual(mockWishlist);
  });

  it('removeItem invia una DELETE per id e aggiorna la wishlist', () => {
    service.removeItem(7).subscribe();

    const req = httpMock.expectOne(`${API}/wishlist/items/7`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ wishlist: mockWishlist });

    expect(service.wishlist()).toEqual(mockWishlist);
  });

  it('removeItemByProduct invia una DELETE per productId e aggiorna la wishlist', () => {
    service.removeItemByProduct('prod-1').subscribe();

    const req = httpMock.expectOne(`${API}/wishlist/items/product/prod-1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ wishlist: mockWishlist });

    expect(service.wishlist()).toEqual(mockWishlist);
  });

  it('clearWishlist invia una DELETE a /wishlist e aggiorna lo stato', () => {
    service.clearWishlist().subscribe();

    const req = httpMock.expectOne(`${API}/wishlist`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ wishlist: mockWishlist });

    expect(service.wishlist()).toEqual(mockWishlist);
  });

  it("isInWishlist restituisce true solo se il prodotto è già nella wishlist caricata", () => {
    service.addToWishlist('prod-1').subscribe();
    httpMock.expectOne(`${API}/wishlist/items`).flush({
      wishlist: {
        ...mockWishlist,
        items: [{ id: 1, wishlistId: 1, productId: 'prod-1' } as unknown as Wishlist['items'][number]],
      },
    });

    expect(service.isInWishlist('prod-1')).toBe(true);
    expect(service.isInWishlist('prod-2')).toBe(false);
  });

  it('toggleProduct aggiunge il prodotto se non è nella wishlist', () => {
    service.toggleProduct('prod-1').subscribe();

    const req = httpMock.expectOne(`${API}/wishlist/items`);
    expect(req.request.method).toBe('POST');
    req.flush({ wishlist: mockWishlist });
  });

  it("toggleProduct rimuove il prodotto se è già nella wishlist", () => {
    service.addToWishlist('prod-1').subscribe();
    httpMock.expectOne(`${API}/wishlist/items`).flush({
      wishlist: {
        ...mockWishlist,
        items: [{ id: 1, wishlistId: 1, productId: 'prod-1' } as unknown as Wishlist['items'][number]],
      },
    });

    service.toggleProduct('prod-1').subscribe();

    const req = httpMock.expectOne(`${API}/wishlist/items/product/prod-1`);
    expect(req.request.method).toBe('DELETE');
  });

  it('resetWishlist azzera la wishlist e l\'errore', () => {
    service.addToWishlist('prod-1').subscribe({ error: () => {} });
    httpMock
      .expectOne(`${API}/wishlist/items`)
      .flush({ error: 'boom' }, { status: 500, statusText: 'Server Error' });
    expect(service.error()).toBeTruthy();

    service.resetWishlist();

    expect(service.wishlist()).toBeNull();
    expect(service.error()).toBeNull();
  });
});
