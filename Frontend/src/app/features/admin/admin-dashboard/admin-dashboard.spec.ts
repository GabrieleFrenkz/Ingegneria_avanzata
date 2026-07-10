import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { AdminDashboard } from './admin-dashboard';
import { AdminService, AdminStats, OrdersResponse } from '../../../core/services/admin.service';
import { ProductApi } from '../../../core/services/product-api';
import { Product } from '../../../core/models/product';
import { Order } from '../../../core/models/order';

describe('AdminDashboard', () => {
  let component: AdminDashboard;
  let fixture: ComponentFixture<AdminDashboard>;
  let adminService: {
    getStats: ReturnType<typeof vi.fn>;
    getOrders: ReturnType<typeof vi.fn>;
    createProduct: ReturnType<typeof vi.fn>;
    updateProduct: ReturnType<typeof vi.fn>;
    deleteProduct: ReturnType<typeof vi.fn>;
    adjustQuantity: ReturnType<typeof vi.fn>;
    deleteOrder: ReturnType<typeof vi.fn>;
  };
  let productApi: { list: ReturnType<typeof vi.fn> };

  const mockProduct: Product = {
    discountPercentage: 0,
    id: 'prod-1',
    title: 'Maglietta',
    description: 'Blu',
    price: 20,
    originalPrice: 25,
    sale: true,
    quantity: 5,
    createdAt: '2026-01-01T00:00:00Z',
  };

  beforeEach(() => {
    adminService = {
      getStats: vi.fn(() => of({})),
      getOrders: vi.fn(() => of({ orders: [], stats: {} })),
      createProduct: vi.fn(() => of({ message: 'ok', product: mockProduct })),
      updateProduct: vi.fn(() => of({ message: 'ok', product: mockProduct })),
      deleteProduct: vi.fn(() => of({ message: 'ok' })),
      adjustQuantity: vi.fn(() => of({ message: 'ok', product: mockProduct })),
      deleteOrder: vi.fn(() => of({ message: 'ok' })),
    };
    productApi = { list: vi.fn(() => of([mockProduct])) };

    TestBed.configureTestingModule({
      imports: [AdminDashboard],
      providers: [
        { provide: AdminService, useValue: adminService },
        { provide: ProductApi, useValue: productApi },
      ],
    });

    fixture = TestBed.createComponent(AdminDashboard);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit carica statistiche, prodotti e ordini', () => {
    component.ngOnInit();

    expect(adminService.getStats).toHaveBeenCalled();
    expect(productApi.list).toHaveBeenCalled();
    expect(adminService.getOrders).toHaveBeenCalled();
  });

  it('setActiveSection cambia la sezione attiva', () => {
    component.setActiveSection('products');
    expect(component.activeSection()).toBe('products');
  });

  it('onEditProduct popola editingProduct e il form con i valori del prodotto', () => {
    component.onEditProduct(mockProduct);

    expect(component.editingProduct()).toEqual(mockProduct);
    expect(component.productForm.value.id).toBe('prod-1');
    expect(component.productForm.value.title).toBe('Maglietta');
    expect(component.productForm.value.original_price).toBe(25);
  });

  it('onSaveProduct con form valido e nessun editingProduct chiama createProduct', () => {
    component.productForm.setValue({
      id: 'prod-2', title: 'Nuovo', description: '', price: 10, original_price: 10,
      sale: false, quantity: 5, thumbnail: '', tags: [],
    });

    component.onSaveProduct();

    expect(adminService.createProduct).toHaveBeenCalled();
    expect(adminService.updateProduct).not.toHaveBeenCalled();
  });

  it('onSaveProduct con editingProduct impostato chiama updateProduct', () => {
    component.onEditProduct(mockProduct);

    component.onSaveProduct();

    expect(adminService.updateProduct).toHaveBeenCalledWith('prod-1', expect.any(Object));
    expect(adminService.createProduct).not.toHaveBeenCalled();
  });

  it('onSaveProduct con form invalido non chiama createProduct né updateProduct', () => {
    component.productForm.patchValue({ id: '', title: '' });

    component.onSaveProduct();

    expect(adminService.createProduct).not.toHaveBeenCalled();
    expect(adminService.updateProduct).not.toHaveBeenCalled();
  });

  it('onSaveProduct riuscito ricarica prodotti/stats e resetta il form', () => {
    component.productForm.setValue({
      id: 'prod-2', title: 'Nuovo', description: '', price: 10, original_price: 10,
      sale: false, quantity: 5, thumbnail: '', tags: [],
    });
    vi.clearAllMocks();

    component.onSaveProduct();

    expect(productApi.list).toHaveBeenCalled();
    expect(adminService.getStats).toHaveBeenCalled();
    expect(component.editingProduct()).toBeNull();
  });

  it('onDeleteProduct chiama deleteProduct se confermato', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    component.onDeleteProduct('prod-1');

    expect(adminService.deleteProduct).toHaveBeenCalledWith('prod-1');
  });

  it("onDeleteProduct non chiama nulla se l'utente annulla", () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    component.onDeleteProduct('prod-1');

    expect(adminService.deleteProduct).not.toHaveBeenCalled();
  });

  it('onAdjustQuantity chiama adjustQuantity e ricarica prodotti e statistiche', () => {
    vi.clearAllMocks();

    component.onAdjustQuantity('prod-1', 5);

    expect(adminService.adjustQuantity).toHaveBeenCalledWith('prod-1', 5);
    expect(productApi.list).toHaveBeenCalled();
    expect(adminService.getStats).toHaveBeenCalled();
  });

  it('resetForm ripristina i valori di default e azzera editingProduct', () => {
    component.onEditProduct(mockProduct);

    component.resetForm();

    expect(component.editingProduct()).toBeNull();
    expect(component.productForm.value.sale).toBe(false);
    expect(component.productForm.value.price).toBe(0);
  });

  it('onDeleteOrder chiama deleteOrder se confermato e ricarica ordini, stats e prodotti', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.clearAllMocks();

    component.onDeleteOrder(1);

    expect(adminService.deleteOrder).toHaveBeenCalledWith(1);
    expect(adminService.getOrders).toHaveBeenCalled();
    expect(adminService.getStats).toHaveBeenCalled();
    expect(productApi.list).toHaveBeenCalled();
  });

  it('getOrderItemsCount somma le quantità di tutti gli orderItems', () => {
    const order: Order = {
      customer: { firstName: '', lastName: '', email: '' },
      address: { street: '', city: '', zip: '' },
      total: 10,
      createdAt: '',
      orderItems: [
        { id: 1, orderId: 1, productId: 'p1', quantity: 2, unitPrice: 5, createdAt: '', updatedAt: '' },
        { id: 2, orderId: 1, productId: 'p2', quantity: 4, unitPrice: 5, createdAt: '', updatedAt: '' },
      ],
    };

    expect(component.getOrderItemsCount(order)).toBe(6);
  });

  describe('rendering del template', () => {
    const mockStats: AdminStats = {
      total_orders: 12,
      total_revenue: 340.5,
      total_users: 8,
      total_products: 20,
      low_stock_products: 2,
      recent_orders: [
        { id: 1, customer: { firstName: 'Mario', lastName: 'Rossi' }, total: 50, createdAt: '2026-01-01T00:00:00Z' },
      ],
    };

    const mockOrdersResponse: OrdersResponse = {
      orders: [],
      stats: { total_orders: 1, total_revenue: 50, orders_by_status: { with_user: 1, guest: 0 } },
    };

    describe('sezione Statistiche (default)', () => {
      it('mostra lo spinner mentre stats è null', () => {
        adminService.getStats.mockReturnValue(new Subject());

        fixture.detectChanges();

        const el = fixture.nativeElement as HTMLElement;
        expect(el.querySelector('.loading-container')).toBeTruthy();
        expect(el.querySelector('.stats-grid')).toBeFalsy();
      });

      it('mostra le card statistiche e la tabella ordini recenti quando ce ne sono', () => {
        adminService.getStats.mockReturnValue(of(mockStats));

        fixture.detectChanges();

        const el = fixture.nativeElement as HTMLElement;
        expect(el.querySelectorAll('.stat-card').length).toBe(5);
        expect(el.querySelector('.recent-orders-card')).toBeTruthy();
        expect(el.textContent).toContain('Mario');
      });

      it('non mostra la tabella ordini recenti quando è vuota', () => {
        adminService.getStats.mockReturnValue(of({ ...mockStats, recent_orders: [] }));

        fixture.detectChanges();

        const el = fixture.nativeElement as HTMLElement;
        expect(el.querySelector('.recent-orders-card')).toBeFalsy();
      });
    });

    describe('sezione Gestione Prodotti', () => {
      it('mostra lo spinner mentre i prodotti caricano', () => {
        productApi.list.mockReturnValue(new Subject());
        component.setActiveSection('products');

        fixture.detectChanges();

        const el = fixture.nativeElement as HTMLElement;
        expect(el.querySelector('.loading-container')).toBeTruthy();
        expect(el.querySelector('.products-table-card')).toBeFalsy();
      });

      it('mostra "Aggiungi Nuovo Prodotto" e la tabella senza pulsante Annulla quando non si sta modificando', () => {
        component.setActiveSection('products');

        fixture.detectChanges();

        const el = fixture.nativeElement as HTMLElement;
        expect(el.textContent).toContain('Aggiungi Nuovo Prodotto');
        expect(Array.from(el.querySelectorAll('button')).some((b) => b.textContent?.includes('Annulla'))).toBe(false);
      });

      it('mostra "Modifica Prodotto" e il pulsante Annulla quando si sta modificando un prodotto', () => {
        component.setActiveSection('products');
        component.onEditProduct(mockProduct);

        fixture.detectChanges();

        const el = fixture.nativeElement as HTMLElement;
        expect(el.textContent).toContain('Modifica Prodotto');
        expect(Array.from(el.querySelectorAll('button')).some((b) => b.textContent?.includes('Annulla'))).toBe(true);
      });

      it('segna come "low-stock" i prodotti con quantità sotto 10', () => {
        productApi.list.mockReturnValue(
          of([
            { ...mockProduct, id: 'p1', quantity: 5 },
            { ...mockProduct, id: 'p2', quantity: 15 },
          ]),
        );
        component.setActiveSection('products');

        fixture.detectChanges();

        const el = fixture.nativeElement as HTMLElement;
        const quantityCells = el.querySelectorAll('td.mat-column-quantity span');
        expect(quantityCells[0].classList.contains('low-stock')).toBe(true);
        expect(quantityCells[1].classList.contains('low-stock')).toBe(false);
      });
    });

    describe('sezione Storico Ordini', () => {
      it('mostra lo spinner mentre orders è null', () => {
        adminService.getOrders.mockReturnValue(new Subject());
        component.setActiveSection('orders');

        fixture.detectChanges();

        const el = fixture.nativeElement as HTMLElement;
        expect(el.querySelector('.loading-container')).toBeTruthy();
      });

      it('mostra lo stato vuoto quando non ci sono ordini', () => {
        adminService.getOrders.mockReturnValue(of(mockOrdersResponse));
        component.setActiveSection('orders');

        fixture.detectChanges();

        const el = fixture.nativeElement as HTMLElement;
        expect(el.querySelector('.empty-state')).toBeTruthy();
        expect(el.querySelector('mat-accordion')).toBeFalsy();
      });

      it('mostra un ordine di un utente registrato con indirizzo e articoli completi', () => {
        adminService.getOrders.mockReturnValue(
          of({
            ...mockOrdersResponse,
            orders: [
              {
                id: 1,
                user: { firstName: 'Luca', lastName: 'Bianchi', email: 'luca@example.com' },
                address: { street: 'Via Verdi 5', city: 'Roma', zip: '00100' },
                total: 30,
                createdAt: '2026-01-01T00:00:00Z',
                orderItems: [
                  { id: 1, orderId: 1, productId: 'p1', quantity: 2, unitPrice: 15, createdAt: '', updatedAt: '', product: { ...mockProduct, title: 'Cappello' } },
                ],
              },
            ],
          }),
        );
        component.setActiveSection('orders');

        fixture.detectChanges();

        const el = fixture.nativeElement as HTMLElement;
        expect(el.querySelectorAll('mat-expansion-panel').length).toBe(1);
        expect(el.textContent).toContain('Luca');
        expect(el.textContent).toContain('Utente Registrato');
        expect(el.textContent).toContain('Via Verdi 5');
        expect(el.textContent).toContain('Cappello');
      });

      it('mostra un ordine ospite con fallback "N/D" e articolo senza prodotto collegato', () => {
        adminService.getOrders.mockReturnValue(
          of({
            ...mockOrdersResponse,
            orders: [
              {
                id: 2,
                customer: { firstName: null, lastName: null, email: null },
                address: { street: null, city: null, zip: null },
                total: 10,
                createdAt: '2026-01-01T00:00:00Z',
                orderItems: [
                  { id: 2, orderId: 2, productId: 'p2', quantity: 1, unitPrice: 10, createdAt: '', updatedAt: '' },
                ],
              },
            ],
          }),
        );
        component.setActiveSection('orders');

        fixture.detectChanges();

        const el = fixture.nativeElement as HTMLElement;
        expect(el.textContent).toContain('Ospite');
        expect(el.textContent).toContain('N/D');
        expect(el.textContent).toContain('Prodotto #p2');
      });
    });
  });
});
