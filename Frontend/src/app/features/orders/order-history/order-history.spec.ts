import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { OrderHistoryPage } from './order-history';
import { OrderService } from '../../../core/services/order-service';
import { Order } from '../../../core/models/order';

describe('OrderHistoryPage', () => {
  let component: OrderHistoryPage;
  let fixture: ComponentFixture<OrderHistoryPage>;
  let orderService: { getOrders: ReturnType<typeof vi.fn> };

  const mockOrders: Order[] = [
    {
      id: 1,
      customer: { firstName: 'Mario', lastName: 'Rossi', email: 'mario@example.com' },
      address: { street: 'Via Roma 1', city: 'Milano', zip: '20100' },
      total: 50,
      createdAt: '2026-01-01T00:00:00Z',
      orderItems: [
        { id: 1, orderId: 1, productId: 'p1', quantity: 2, unitPrice: 10, createdAt: '', updatedAt: '' },
        { id: 2, orderId: 1, productId: 'p2', quantity: 3, unitPrice: 10, createdAt: '', updatedAt: '' },
      ],
    },
  ];

  beforeEach(() => {
    orderService = { getOrders: vi.fn(() => of(mockOrders)) };

    TestBed.configureTestingModule({
      imports: [OrderHistoryPage],
      providers: [{ provide: OrderService, useValue: orderService }],
    });

    fixture = TestBed.createComponent(OrderHistoryPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit carica gli ordini', () => {
    component.ngOnInit();
    expect(orderService.getOrders).toHaveBeenCalled();
    expect(component.orders()).toEqual(mockOrders);
  });

  it('loadOrders senza filtri chiama getOrders con un oggetto filtri vuoto', () => {
    component.loadOrders();
    expect(orderService.getOrders).toHaveBeenCalledWith({});
  });

  it('loadOrders con date le formatta come YYYY-MM-DD', () => {
    component.startDate = new Date('2026-01-05T10:00:00Z');
    component.endDate = new Date('2026-01-31T10:00:00Z');

    component.loadOrders();

    expect(orderService.getOrders).toHaveBeenCalledWith({
      startDate: '2026-01-05',
      endDate: '2026-01-31',
    });
  });

  it('loadOrders ignora minTotal/maxTotal se sono 0', () => {
    component.minTotal = 0;
    component.maxTotal = 0;

    component.loadOrders();

    expect(orderService.getOrders).toHaveBeenCalledWith({});
  });

  it('loadOrders include minTotal/maxTotal se maggiori di 0', () => {
    component.minTotal = 10;
    component.maxTotal = 100;

    component.loadOrders();

    expect(orderService.getOrders).toHaveBeenCalledWith({ minTotal: 10, maxTotal: 100 });
  });

  it("loadOrders in caso di errore imposta error e riporta loading a false", () => {
    orderService.getOrders.mockReturnValue(throwError(() => ({ error: { error: 'Boom' } })));

    component.loadOrders();

    expect(component.error()).toBe('Boom');
    expect(component.loading()).toBe(false);
  });

  it('clearFilters azzera tutti i filtri e ricarica gli ordini', () => {
    component.startDate = new Date();
    component.endDate = new Date();
    component.minTotal = 10;
    component.maxTotal = 100;

    component.clearFilters();

    expect(component.startDate).toBeNull();
    expect(component.endDate).toBeNull();
    expect(component.minTotal).toBeNull();
    expect(component.maxTotal).toBeNull();
    expect(orderService.getOrders).toHaveBeenCalledWith({});
  });

  it('getOrderItemsCount somma le quantità di tutti gli orderItems', () => {
    expect(component.getOrderItemsCount(mockOrders[0])).toBe(5);
  });

  it('getOrderItemsCount restituisce 0 se orderItems è assente', () => {
    expect(component.getOrderItemsCount({ ...mockOrders[0], orderItems: undefined })).toBe(0);
  });

  describe('rendering del template', () => {
    it('mostra la lista ordini nell\'accordion con cliente, indirizzo e articoli', () => {
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.empty-state')).toBeFalsy();
      expect(el.querySelectorAll('mat-expansion-panel').length).toBe(1);
      expect(el.textContent).toContain('Mario Rossi');
      expect(el.textContent).toContain('Via Roma 1');
      expect(el.querySelectorAll('.order-item').length).toBe(2);
      // orderItems senza `product`: deve usare il fallback "Prodotto #<id>"
      expect(el.textContent).toContain('Prodotto #p1');
    });

    it('mostra i fallback "N/D" quando cliente/indirizzo hanno campi nulli, e il titolo prodotto quando presente', () => {
      orderService.getOrders.mockReturnValue(
        of([
          {
            ...mockOrders[0],
            customer: { firstName: null, lastName: null, email: null },
            address: { street: null, city: null, zip: null },
            orderItems: [
              {
                id: 1,
                orderId: 1,
                productId: 'p1',
                quantity: 1,
                unitPrice: 10,
                createdAt: '',
                updatedAt: '',
                product: { id: 'p1', title: 'Zaino', description: '', price: 10, originalPrice: 10, sale: false, discountPercentage: 0, createdAt: '' },
              },
            ],
          },
        ]),
      );

      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain('N/D');
      expect(el.textContent).toContain('Zaino');
    });

    it('mostra lo spinner mentre carica, senza mostrare la lista ordini', () => {
      orderService.getOrders.mockReturnValue(new Subject());

      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.loading-container')).toBeTruthy();
      expect(el.querySelector('.orders-list')).toBeFalsy();
    });

    it('mostra il messaggio di errore quando il caricamento fallisce', () => {
      orderService.getOrders.mockReturnValue(throwError(() => ({ error: { error: 'Boom' } })));

      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.error-card')).toBeTruthy();
      expect(el.textContent).toContain('Boom');
      expect(el.querySelector('.orders-list')).toBeFalsy();
    });

    it('mostra lo stato vuoto quando non ci sono ordini', () => {
      orderService.getOrders.mockReturnValue(of([]));

      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.empty-state')).toBeTruthy();
      expect(el.querySelector('mat-accordion')).toBeFalsy();
    });
  });
});
