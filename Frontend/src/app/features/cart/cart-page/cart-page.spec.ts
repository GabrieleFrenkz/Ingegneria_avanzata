import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { provideRouter, Router } from '@angular/router';
import { CartPage } from './cart-page';
import { CartService } from '../../../core/services/cart.service';
import { CartItem } from '../../../core/models/cart';

describe('CartPage', () => {
  let component: CartPage;
  let cartService: {
    cart: ReturnType<typeof vi.fn>;
    loading: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
    items: ReturnType<typeof vi.fn>;
    total: ReturnType<typeof vi.fn>;
    itemCount: ReturnType<typeof vi.fn>;
    isEmpty: ReturnType<typeof vi.fn>;
    loadCart: ReturnType<typeof vi.fn>;
    incrementQuantity: ReturnType<typeof vi.fn>;
    decrementQuantity: ReturnType<typeof vi.fn>;
    removeItem: ReturnType<typeof vi.fn>;
    clearCart: ReturnType<typeof vi.fn>;
  };
  let router: Router;

  const mockItem: CartItem = {
    id: 1,
    cartId: 1,
    productId: 'prod-1',
    quantity: 2,
    unitPrice: 10,
    subtotal: 20,
    product: {} as CartItem['product'],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };

  beforeEach(() => {
    cartService = {
      cart: vi.fn(() => null),
      loading: vi.fn(() => false),
      error: vi.fn(() => null),
      items: vi.fn(() => []),
      total: vi.fn(() => 0),
      itemCount: vi.fn(() => 0),
      isEmpty: vi.fn(() => true),
      loadCart: vi.fn(),
      incrementQuantity: vi.fn(() => of({})),
      decrementQuantity: vi.fn(() => of({})),
      removeItem: vi.fn(() => of({})),
      clearCart: vi.fn(() => of({})),
    };

    TestBed.configureTestingModule({
      imports: [CartPage],
      providers: [provideRouter([]), { provide: CartService, useValue: cartService }],
    });

    const fixture = TestBed.createComponent(CartPage);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit ricarica il carrello', () => {
    component.ngOnInit();
    expect(cartService.loadCart).toHaveBeenCalled();
  });

  it("incrementQuantity chiama cartService.incrementQuantity con id e quantity dell'item", () => {
    component.incrementQuantity(mockItem);
    expect(cartService.incrementQuantity).toHaveBeenCalledWith(1, 2);
  });

  it("decrementQuantity con quantity 1 chiama cartService.decrementQuantity", () => {
    component.decrementQuantity({ ...mockItem, quantity: 1 });
    expect(cartService.decrementQuantity).toHaveBeenCalledWith(1, 1);
  });

  it("removeItem chiama cartService.removeItem con l'id dell'item", () => {
    component.removeItem(mockItem);
    expect(cartService.removeItem).toHaveBeenCalledWith(1);
  });

  it('clearCart chiama cartService.clearCart se confermato', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    component.clearCart();

    expect(cartService.clearCart).toHaveBeenCalled();
  });

  it("clearCart non chiama cartService.clearCart se l'utente annulla", () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    component.clearCart();

    expect(cartService.clearCart).not.toHaveBeenCalled();
  });

  it('goToCheckout naviga a /checkout', () => {
    component.goToCheckout();
    expect(router.navigate).toHaveBeenCalledWith(['/checkout']);
  });

  it('continueShopping naviga a /products', () => {
    component.continueShopping();
    expect(router.navigate).toHaveBeenCalledWith(['/products']);
  });

  it('removeItem gestisce correttamente un errore senza propagarlo', () => {
    cartService.removeItem.mockReturnValue(throwError(() => ({ error: {} })));

    expect(() => component.removeItem(mockItem)).not.toThrow();
  });
});
