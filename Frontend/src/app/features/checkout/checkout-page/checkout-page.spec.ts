import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { CheckoutPage } from './checkout-page';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order-service';
import { CartItem } from '../../../core/models/cart';

describe('CheckoutPage', () => {
  let component: CheckoutPage;
  let cartService: {
    items: ReturnType<typeof vi.fn>;
    total: ReturnType<typeof vi.fn>;
    isEmpty: ReturnType<typeof vi.fn>;
    clearCart: ReturnType<typeof vi.fn>;
  };
  let orderService: { create: ReturnType<typeof vi.fn> };

  const mockItem: CartItem = {
    id: 1,
    cartId: 1,
    productId: 'prod-1',
    quantity: 2,
    unitPrice: 10,
    subtotal: 20,
    product: { id: 'prod-1', title: 'Maglietta' } as CartItem['product'],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };

  const validCustomer = { firstName: 'Mario', lastName: 'Rossi', email: 'mario@example.com' };
  const validAddress = { street: 'Via Roma 1', city: 'Milano', zip: '20100' };

  beforeEach(() => {
    cartService = {
      items: vi.fn(() => [mockItem]),
      total: vi.fn(() => 20),
      isEmpty: vi.fn(() => false),
      clearCart: vi.fn(() => of({})),
    };
    orderService = { create: vi.fn(() => of({})) };

    TestBed.configureTestingModule({
      imports: [CheckoutPage],
      providers: [
        { provide: CartService, useValue: cartService },
        { provide: OrderService, useValue: orderService },
      ],
    });

    const fixture = TestBed.createComponent(CheckoutPage);
    component = fixture.componentInstance;
  });

  function fillValidForm(): void {
    component.form.setValue({
      customer: validCustomer,
      address: validAddress,
      shippingMethod: 'standard',
      privacy: true,
    });
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getControl restituisce il control corretto dato il path', () => {
    expect(component.getControl('customer.firstName')).toBe(
      component.form.get('customer.firstName')
    );
  });

  it("hasError restituisce true solo se il control ha l'errore ed è touched", () => {
    const control = component.getControl('customer.firstName')!;
    expect(component.hasError('customer.firstName', 'required')).toBe(false);

    control.markAsTouched();
    expect(component.hasError('customer.firstName', 'required')).toBe(true);
  });

  it('onSubmit con form invalido marca tutti i campi come touched e non invia l\'ordine', () => {
    component.onSubmit();

    expect(component.form.touched).toBe(true);
    expect(component.showSummary).toBe(true);
    expect(orderService.create).not.toHaveBeenCalled();
  });

  it("onSubmit con carrello vuoto imposta orderError e non invia l'ordine", () => {
    fillValidForm();
    cartService.isEmpty.mockReturnValue(true);

    component.onSubmit();

    expect(component.orderError).toBe(true);
    expect(component.errorMessage).toContain('carrello è vuoto');
    expect(orderService.create).not.toHaveBeenCalled();
  });

  it('onSubmit con form valido e carrello pieno chiama orderService.create con i dati del form e del carrello', () => {
    fillValidForm();

    component.onSubmit();

    expect(orderService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        customer: validCustomer,
        address: validAddress,
        total: 20,
      })
    );
  });

  it('onSubmit riuscito resetta il form, svuota il carrello e imposta orderSuccess', () => {
    fillValidForm();

    component.onSubmit();

    expect(component.orderSuccess).toBe(true);
    expect(component.orderError).toBe(false);
    expect(component.loading).toBe(false);
    expect(cartService.clearCart).toHaveBeenCalled();
  });

  it("onSubmit fallito imposta orderError e il messaggio d'errore del backend", () => {
    orderService.create.mockReturnValue(
      throwError(() => ({ error: { error: 'Stock insufficiente' } }))
    );
    fillValidForm();

    component.onSubmit();

    expect(component.orderError).toBe(true);
    expect(component.orderSuccess).toBe(false);
    expect(component.errorMessage).toBe('Stock insufficiente');
  });
});
