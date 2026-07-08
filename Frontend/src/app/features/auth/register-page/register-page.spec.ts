import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { provideRouter, Router } from '@angular/router';
import { RegisterPage } from './register-page';
import { AuthService } from '../../../core/services/auth-service';
import { CartService } from '../../../core/services/cart.service';
import { AuthResponse } from '../../../core/models/user';

describe('RegisterPage', () => {
  let component: RegisterPage;
  let authService: { register: ReturnType<typeof vi.fn> };
  let cartService: { loadCart: ReturnType<typeof vi.fn> };
  let router: Router;

  const validFields = {
    first_name: 'Mario',
    last_name: 'Rossi',
    email: 'mario@example.com',
    address: '',
    password: 'password123',
    password_confirmation: 'password123',
  };

  const mockResponse: AuthResponse = {
    message: 'ok',
    token: 'jwt',
    user: {
      id: 1,
      email: 'mario@example.com',
      firstName: 'Mario',
      lastName: 'Rossi',
      role: 'user',
      createdAt: '2026-01-01T00:00:00Z',
    },
  };

  beforeEach(() => {
    authService = { register: vi.fn() };
    cartService = { loadCart: vi.fn() };

    TestBed.configureTestingModule({
      imports: [RegisterPage],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
        { provide: CartService, useValue: cartService },
      ],
    });

    const fixture = TestBed.createComponent(RegisterPage);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('il form è invalido se i campi obbligatori sono vuoti', () => {
    expect(component.registerForm.valid).toBe(false);
  });

  it('il form è invalido se le password non corrispondono', () => {
    component.registerForm.setValue({ ...validFields, password_confirmation: 'altrapassword' });
    expect(component.registerForm.valid).toBe(false);
    expect(component.registerForm.errors?.['passwordMismatch']).toBe(true);
  });

  it('il form è valido se tutti i campi sono corretti e le password corrispondono', () => {
    component.registerForm.setValue(validFields);
    expect(component.registerForm.valid).toBe(true);
  });

  it('onSubmit con form invalido non chiama authService.register', () => {
    component.onSubmit();
    expect(authService.register).not.toHaveBeenCalled();
  });

  it('onSubmit con form valido, su successo carica il carrello e naviga a /products', () => {
    authService.register.mockReturnValue(of(mockResponse));
    component.registerForm.setValue(validFields);

    component.onSubmit();

    expect(authService.register).toHaveBeenCalledWith(validFields);
    expect(cartService.loadCart).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/products']);
    expect(component.loading()).toBe(false);
  });

  it('su fallimento con error.errors (array) unisce tutti i messaggi', () => {
    authService.register.mockReturnValue(
      throwError(() => ({ error: { errors: ["Email è già in uso", 'Password troppo debole'] } }))
    );
    component.registerForm.setValue(validFields);

    component.onSubmit();

    expect(component.loading()).toBe(false);
    expect(component.error()).toBe('Email è già in uso, Password troppo debole');
  });

  it('su fallimento con error.error (stringa singola) mostra quel messaggio', () => {
    authService.register.mockReturnValue(
      throwError(() => ({ error: { error: 'Registration failed' } }))
    );
    component.registerForm.setValue(validFields);

    component.onSubmit();

    expect(component.error()).toBe('Registration failed');
  });
});
