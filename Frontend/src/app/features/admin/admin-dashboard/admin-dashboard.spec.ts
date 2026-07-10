import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AdminDashboard } from './admin-dashboard';
import { AdminService } from '../../../core/services/admin.service';
import { ProductApi } from '../../../core/services/product-api';
import { Product } from '../../../core/models/product';
import { Order } from '../../../core/models/order';

describe('AdminDashboard', () => {
  let component: AdminDashboard;
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

    const fixture = TestBed.createComponent(AdminDashboard);
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
});
