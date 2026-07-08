import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { provideRouter } from '@angular/router';
import { ProductPage } from './product-page';
import { ProductApi } from '../../../core/services/product-api';
import { CartService } from '../../../core/services/cart.service';
import { Product } from '../../../core/models/product';

describe('ProductPage', () => {
  let component: ProductPage;
  let productApi: { list: ReturnType<typeof vi.fn> };
  let cartService: { addToCart: ReturnType<typeof vi.fn> };

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
    productApi = { list: vi.fn(() => of([mockProduct])) };
    cartService = { addToCart: vi.fn(() => of({})) };

    TestBed.configureTestingModule({
      imports: [ProductPage],
      providers: [
        provideRouter([]),
        { provide: ProductApi, useValue: productApi },
        { provide: CartService, useValue: cartService },
      ],
    });

    const fixture = TestBed.createComponent(ProductPage);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('updateTitle aggiorna il filtro title e resetta la pagina a 1', () => {
    component.page$.next(3);

    component.updateTitle('maglietta');

    expect((component as any).filters$.value.title).toBe('maglietta');
    expect(component.page$.value).toBe(1);
  });

  it('updateMin aggiorna priceMin e resetta la pagina a 1', () => {
    component.page$.next(3);

    component.updateMin('10');

    expect((component as any).filters$.value.priceMin).toBe('10');
    expect(component.page$.value).toBe(1);
  });

  it('updateMax aggiorna priceMax e resetta la pagina a 1', () => {
    component.page$.next(3);

    component.updateMax('50');

    expect((component as any).filters$.value.priceMax).toBe('50');
    expect(component.page$.value).toBe(1);
  });

  it('updateSort aggiorna il sort e resetta la pagina a 1', () => {
    component.page$.next(3);

    component.updateSort('priceAsc');

    expect((component as any).filters$.value.sort).toBe('priceAsc');
    expect(component.page$.value).toBe(1);
  });

  it('onPage aggiorna page$ con pageIndex + 1', () => {
    component.onPage({ pageIndex: 2, pageSize: 10, length: 30 } as PageEvent);
    expect(component.page$.value).toBe(3);
  });

  it('filteredProducts$ chiama service.list con i filtri mappati al formato backend dopo il debounce', async () => {
    vi.useFakeTimers();
    const emissions: Product[][] = [];
    component.filteredProducts$.subscribe((items) => emissions.push(items));

    component.updateTitle('maglietta');
    component.updateMin('10');
    component.updateMax('50');
    component.updateSort('priceAsc');

    await vi.advanceTimersByTimeAsync(300);

    expect(productApi.list).toHaveBeenCalledWith({
      title: 'maglietta',
      minPrice: 10,
      maxPrice: 50,
      sort: 'price_asc',
    });
    expect(emissions.at(-1)).toEqual([mockProduct]);
  });

  it("onAddToCart non chiama cartService.addToCart se il prodotto non è disponibile", () => {
    component.onAddToCart({ ...mockProduct, inStock: false });
    expect(cartService.addToCart).not.toHaveBeenCalled();
  });

  it('onAddToCart chiama cartService.addToCart se il prodotto è disponibile', () => {
    component.onAddToCart(mockProduct);
    expect(cartService.addToCart).toHaveBeenCalledWith('prod-1');
  });
});
