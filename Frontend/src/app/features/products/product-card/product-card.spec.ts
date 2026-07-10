import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { ProductCard } from './product-card';
import { WishlistService } from '../../../core/services/wishlist.service';
import { Product } from '../../../core/models/product';

describe('ProductCard', () => {
  let component: ProductCard;
  let fixture: ComponentFixture<ProductCard>;
  let wishlistService: { toggleProduct: ReturnType<typeof vi.fn>; isInWishlist: ReturnType<typeof vi.fn> };

  const mockProduct: Product = {
    discountPercentage: 0,
    id: 'prod-1',
    title: 'Maglietta',
    description: 'Blu',
    price: 20,
    originalPrice: 25,
    sale: true,
    createdAt: '2026-01-01T00:00:00Z',
  };

  beforeEach(async () => {
    wishlistService = {
      toggleProduct: vi.fn(() => of({})),
      isInWishlist: vi.fn(() => false),
    };

    await TestBed.configureTestingModule({
      imports: [ProductCard],
      providers: [provideRouter([]), { provide: WishlistService, useValue: wishlistService }],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductCard);
    component = fixture.componentInstance;
    component.product = mockProduct;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it("addToCart emette l'evento add con il prodotto", () => {
    const emitted: Product[] = [];
    component.add.subscribe((p) => emitted.push(p));

    component.addToCart(mockProduct);

    expect(emitted).toEqual([mockProduct]);
  });

  it('toggleWishlist ferma la propagazione dell\'evento', () => {
    const event = { stopPropagation: vi.fn() } as unknown as Event;

    component.toggleWishlist(mockProduct, event);

    expect(event.stopPropagation).toHaveBeenCalled();
  });

  it("toggleWishlist chiama wishlistService.toggleProduct con l'id del prodotto", () => {
    const event = { stopPropagation: vi.fn() } as unknown as Event;

    component.toggleWishlist(mockProduct, event);

    expect(wishlistService.toggleProduct).toHaveBeenCalledWith('prod-1');
  });

  it('isInWishlist delega a wishlistService.isInWishlist', () => {
    wishlistService.isInWishlist.mockReturnValue(true);

    expect(component.isInWishlist('prod-1')).toBe(true);
    expect(wishlistService.isInWishlist).toHaveBeenCalledWith('prod-1');
  });

  it('getDiscountPercentage calcola correttamente la percentuale di sconto', () => {
    component.product = { ...mockProduct, price: 75, originalPrice: 100 };
    expect(component.getDiscountPercentage()).toBe(25);
  });

  it("getDiscountPercentage restituisce 0 se non c'è sconto reale", () => {
    component.product = { ...mockProduct, price: 100, originalPrice: 100 };
    expect(component.getDiscountPercentage()).toBe(0);
  });

  it('getDiscountPercentage restituisce 0 se originalPrice o price sono assenti', () => {
    component.product = { ...mockProduct, price: 0, originalPrice: 100 };
    expect(component.getDiscountPercentage()).toBe(0);
  });
});
