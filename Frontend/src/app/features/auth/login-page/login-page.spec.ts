import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { provideRouter, Router } from '@angular/router';
import { LoginPage } from './login-page';
import { AuthService } from '../../../core/services/auth-service';
import { CartService } from '../../../core/services/cart.service';
import { AuthResponse } from '../../../core/models/user';

describe('LoginPage', () => {
  let component: LoginPage;
  let authService: { login: ReturnType<typeof vi.fn> };
  let cartService: { loadCart: ReturnType<typeof vi.fn> };
  let router: Router;

  const mockResponse = (role: 'user' | 'admin'): AuthResponse => ({
    message: 'ok',
    token: 'jwt',
    user: {
      id: 1,
      email: 'mario@example.com',
      firstName: 'Mario',
      lastName: 'Rossi',
      role,
      createdAt: '2026-01-01T00:00:00Z',
    },
  });

  beforeEach(() => {
    authService = { login: vi.fn() };
    cartService = { loadCart: vi.fn() };

    TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
        { provide: CartService, useValue: cartService },
      ],
    });

    const fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('il form è invalido se i campi sono vuoti', () => {
    expect(component.loginForm.valid).toBe(false);
  });

  it('il form è invalido con una email non valida', () => {
    component.loginForm.setValue({ email: 'non-una-email', password: 'password123' });
    expect(component.loginForm.valid).toBe(false);
  });

  it('il form è invalido con una password più corta di 6 caratteri', () => {
    component.loginForm.setValue({ email: 'mario@example.com', password: 'abc' });
    expect(component.loginForm.valid).toBe(false);
  });

  it('onSubmit con form invalido non chiama authService.login', () => {
    component.onSubmit();
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('onSubmit con form valido chiama authService.login con i valori del form', () => {
    authService.login.mockReturnValue(of(mockResponse('user')));
    component.loginForm.setValue({ email: 'mario@example.com', password: 'password123' });

    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith({
      email: 'mario@example.com',
      password: 'password123',
    });
  });

  it('su login riuscito con ruolo user carica il carrello e naviga a /products', () => {
    authService.login.mockReturnValue(of(mockResponse('user')));
    component.loginForm.setValue({ email: 'mario@example.com', password: 'password123' });

    component.onSubmit();

    expect(cartService.loadCart).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/products']);
    expect(component.loading()).toBe(false);
  });

  it('su login riuscito con ruolo admin naviga a /admin', () => {
    authService.login.mockReturnValue(of(mockResponse('admin')));
    component.loginForm.setValue({ email: 'admin@example.com', password: 'password123' });

    component.onSubmit();

    expect(router.navigate).toHaveBeenCalledWith(['/admin']);
  });

  it("su login fallito imposta l'errore e riporta loading a false", () => {
    authService.login.mockReturnValue(
      throwError(() => ({ error: { error: 'Invalid credentials' } }))
    );
    component.loginForm.setValue({ email: 'mario@example.com', password: 'wrongpass' });

    component.onSubmit();

    expect(component.loading()).toBe(false);
    expect(component.error()).toBe('Invalid credentials');
  });
});
