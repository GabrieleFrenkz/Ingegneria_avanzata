import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideRouter, Router } from '@angular/router';
import { WishlistPage } from './wishlist-page';
import { WishlistService } from '../../../core/services/wishlist.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistItem } from '../../../core/models/wishlist';

describe('WishlistPage', () => {
  let component: WishlistPage;
  let wishlistService: {
    wishlist: ReturnType<typeof vi.fn>;
    loading: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
    items: ReturnType<typeof vi.fn>;
    itemCount: ReturnType<typeof vi.fn>;
    isEmpty: ReturnType<typeof vi.fn>;
    loadWishlist: ReturnType<typeof vi.fn>;
    removeItem: ReturnType<typeof vi.fn>;
    clearWishlist: ReturnType<typeof vi.fn>;
  };
  let cartService: { addToCart: ReturnType<typeof vi.fn> };
  let router: Router;

  const mockItem: WishlistItem = {
    id: 1,
    wishlistId: 1,
    productId: 'prod-1',
    product: {} as WishlistItem['product'],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };

  beforeEach(() => {
    wishlistService = {
      wishlist: vi.fn(() => null),
      loading: vi.fn(() => false),
      error: vi.fn(() => null),
      items: vi.fn(() => []),
      itemCount: vi.fn(() => 0),
      isEmpty: vi.fn(() => true),
      loadWishlist: vi.fn(),
      removeItem: vi.fn(() => of({})),
      clearWishlist: vi.fn(() => of({})),
    };
    cartService = { addToCart: vi.fn(() => of({})) };

    TestBed.configureTestingModule({
      imports: [WishlistPage],
      providers: [
        provideRouter([]),
        { provide: WishlistService, useValue: wishlistService },
        { provide: CartService, useValue: cartService },
      ],
    });

    const fixture = TestBed.createComponent(WishlistPage);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit ricarica la wishlist', () => {
    component.ngOnInit();
    expect(wishlistService.loadWishlist).toHaveBeenCalled();
  });

  it("removeItem chiama wishlistService.removeItem con l'id dell'item", () => {
    component.removeItem(mockItem);
    expect(wishlistService.removeItem).toHaveBeenCalledWith(1);
  });

  it('addToCart chiama cartService.addToCart con productId e quantity 1', () => {
    component.addToCart(mockItem);
    expect(cartService.addToCart).toHaveBeenCalledWith('prod-1', 1);
  });

  it('addAllToCart non fa nulla se la wishlist è vuota', () => {
    wishlistService.items.mockReturnValue([]);

    component.addAllToCart();

    expect(cartService.addToCart).not.toHaveBeenCalled();
  });

  it('addAllToCart chiama cartService.addToCart per ogni item della wishlist', () => {
    const item2 = { ...mockItem, id: 2, productId: 'prod-2' };
    wishlistService.items.mockReturnValue([mockItem, item2]);

    component.addAllToCart();

    expect(cartService.addToCart).toHaveBeenCalledTimes(2);
    expect(cartService.addToCart).toHaveBeenCalledWith('prod-1', 1);
    expect(cartService.addToCart).toHaveBeenCalledWith('prod-2', 1);
  });

  it('clearWishlist chiama wishlistService.clearWishlist se confermato', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    component.clearWishlist();

    expect(wishlistService.clearWishlist).toHaveBeenCalled();
  });

  it("clearWishlist non chiama nulla se l'utente annulla", () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    component.clearWishlist();

    expect(wishlistService.clearWishlist).not.toHaveBeenCalled();
  });

  it('viewProduct naviga a /products/:id', () => {
    component.viewProduct('prod-1');
    expect(router.navigate).toHaveBeenCalledWith(['/products', 'prod-1']);
  });

  it('continueShopping naviga a /products', () => {
    component.continueShopping();
    expect(router.navigate).toHaveBeenCalledWith(['/products']);
  });
});
