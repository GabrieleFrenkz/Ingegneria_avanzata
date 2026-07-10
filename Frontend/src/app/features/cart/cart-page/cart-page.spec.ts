import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { provideRouter, Router } from '@angular/router';
import { CartPage } from './cart-page';
import { CartService } from '../../../core/services/cart.service';
import { CartItem } from '../../../core/models/cart';
import { Product } from '../../../core/models/product';

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
  let fixture: ComponentFixture<CartPage>;

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

  const mockProduct: Product = {
    discountPercentage: 0,
    id: 'prod-1',
    title: 'Zaino da trekking',
    description: 'Descrizione prodotto',
    price: 10,
    originalPrice: 10,
    sale: false,
    thumbnail: 'zaino.jpg',
    createdAt: '2026-01-01T00:00:00Z',
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

    fixture = TestBed.createComponent(CartPage);
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

  describe('rendering del template', () => {
    it('mostra lo stato "carrello vuoto" quando isEmpty è true e non sta caricando', () => {
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.empty-cart')).toBeTruthy();
      expect(el.querySelector('.cart-content')).toBeFalsy();
      expect(el.textContent).toContain('Il tuo carrello è vuoto');
    });

    it('mostra lo spinner di caricamento quando loading è true, nascondendo lo stato vuoto', () => {
      cartService.loading.mockReturnValue(true);

      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.loading-container')).toBeTruthy();
      expect(el.querySelector('.empty-cart')).toBeFalsy();
    });

    it('mostra il messaggio di errore e permette di ricaricare cliccando "Riprova"', () => {
      cartService.error.mockReturnValue('Errore di rete');

      fixture.detectChanges();
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.error-card')).toBeTruthy();
      expect(el.textContent).toContain('Errore di rete');

      const callsBefore = cartService.loadCart.mock.calls.length;
      (el.querySelector('.error-card button') as HTMLButtonElement).click();
      expect(cartService.loadCart.mock.calls.length).toBeGreaterThan(callsBefore);
    });

    it('mostra la lista degli articoli con thumbnail e nota sul prezzo bloccato quando il prezzo è cambiato', () => {
      cartService.isEmpty.mockReturnValue(false);
      cartService.items.mockReturnValue([
        { ...mockItem, unitPrice: 8, product: { ...mockProduct, price: 10 } },
      ]);
      cartService.itemCount.mockReturnValue(1);
      cartService.total.mockReturnValue(8);

      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelectorAll('.cart-item').length).toBe(1);
      expect(el.querySelector('.item-image')).toBeTruthy();
      expect(el.querySelector('.price-notice')).toBeTruthy();
    });

    it("non mostra l'immagine né la nota sul prezzo quando non servono", () => {
      cartService.isEmpty.mockReturnValue(false);
      cartService.items.mockReturnValue([
        {
          ...mockItem,
          unitPrice: 10,
          product: { ...mockProduct, price: 10, thumbnail: undefined },
        },
      ]);
      cartService.itemCount.mockReturnValue(1);
      cartService.total.mockReturnValue(10);

      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.item-image')).toBeFalsy();
      expect(el.querySelector('.price-notice')).toBeFalsy();
    });
  });
});
