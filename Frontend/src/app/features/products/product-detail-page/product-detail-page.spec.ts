import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductDetailPage } from './product-detail-page';
import { ProductApi } from '../../../core/services/product-api';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { Product } from '../../../core/models/product';

describe('ProductDetailPage', () => {
  let component: ProductDetailPage;
  let productApi: { getById: ReturnType<typeof vi.fn> };
  let cartService: { addToCart: ReturnType<typeof vi.fn> };
  let wishlistService: { toggleProduct: ReturnType<typeof vi.fn>; isInWishlist: ReturnType<typeof vi.fn> };

  const mockProduct: Product = {
    discountPercentage: 0,
    id: 'prod-1',
    title: 'Maglietta',
    description: 'Blu',
    price: 20,
    originalPrice: 25,
    sale: true,
    quantity: 5,
    inStock: true,
    createdAt: '2026-01-01T00:00:00Z',
  };

  beforeEach(() => {
    productApi = { getById: vi.fn(() => of(mockProduct)) };
    cartService = { addToCart: vi.fn(() => of({})) };
    wishlistService = { toggleProduct: vi.fn(() => of({})), isInWishlist: vi.fn(() => false) };

    TestBed.configureTestingModule({
      imports: [ProductDetailPage],
      providers: [
        provideRouter([]),
        { provide: ProductApi, useValue: productApi },
        { provide: CartService, useValue: cartService },
        { provide: WishlistService, useValue: wishlistService },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ id: 'prod-1' })) },
        },
      ],
    });

    const fixture = TestBed.createComponent(ProductDetailPage);
    component = fixture.componentInstance;
    vi.spyOn(TestBed.inject(MatSnackBar), 'open').mockReturnValue({
      onAction: () => of(undefined),
    } as any);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it("product$ chiama productApi.getById con l'id preso dai paramMap della route", async () => {
    const product = await firstValueFrom(component.product$);

    expect(productApi.getById).toHaveBeenCalledWith('prod-1');
    expect(product).toEqual(mockProduct);
  });

  it('isInWishlist delega a wishlistService.isInWishlist', () => {
    wishlistService.isInWishlist.mockReturnValue(true);
    expect(component.isInWishlist('prod-1')).toBe(true);
  });

  it("toggleWishlist chiama wishlistService.toggleProduct con l'id del prodotto", () => {
    component.toggleWishlist(mockProduct);
    expect(wishlistService.toggleProduct).toHaveBeenCalledWith('prod-1');
  });

  it('onAddToCart non chiama cartService.addToCart se il prodotto non è in stock', () => {
    component.onAddToCart({ ...mockProduct, inStock: false });
    expect(cartService.addToCart).not.toHaveBeenCalled();
  });

  it('onAddToCart non chiama cartService.addToCart se la quantity è 0', () => {
    component.onAddToCart({ ...mockProduct, quantity: 0 });
    expect(cartService.addToCart).not.toHaveBeenCalled();
  });

  it('onAddToCart chiama cartService.addToCart se il prodotto è disponibile', () => {
    component.onAddToCart(mockProduct);
    expect(cartService.addToCart).toHaveBeenCalledWith('prod-1');
  });
});
