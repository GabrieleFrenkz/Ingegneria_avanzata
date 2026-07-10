import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Header } from './header';
import { AuthService } from '../../core/services/auth-service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { User } from '../../core/models/user';

describe('Header', () => {
  let component: Header;
  let router: Router;
  let authService: {
    currentUser: ReturnType<typeof vi.fn>;
    isLoggedIn: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
  };
  let cartService: { itemCount: ReturnType<typeof vi.fn>; resetCart: ReturnType<typeof vi.fn> };
  let wishlistService: { itemCount: ReturnType<typeof vi.fn>; resetWishlist: ReturnType<typeof vi.fn> };

  const mockUser: User = {
    id: 1,
    email: 'mario@example.com',
    firstName: 'Mario',
    lastName: 'Rossi',
    role: 'user',
    createdAt: '2026-01-01T00:00:00Z',
  };

  beforeEach(() => {
    authService = {
      currentUser: vi.fn(() => mockUser),
      isLoggedIn: vi.fn(() => true),
      logout: vi.fn(),
    };
    cartService = { itemCount: vi.fn(() => 0), resetCart: vi.fn() };
    wishlistService = { itemCount: vi.fn(() => 0), resetWishlist: vi.fn() };

    TestBed.configureTestingModule({
      imports: [Header],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
        { provide: CartService, useValue: cartService },
        { provide: WishlistService, useValue: wishlistService },
      ],
    });

    const fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it("isAdmin è true se l'utente corrente ha ruolo admin", () => {
    authService.currentUser.mockReturnValue({ ...mockUser, role: 'admin' });
    expect(component.isAdmin()).toBe(true);
  });

  it('isAdmin è false se non è admin', () => {
    expect(component.isAdmin()).toBe(false);
  });

  it.each([
    ['goToCart', '/cart'],
    ['goToWishlist', '/wishlist'],
    ['goToCheckout', '/checkout'],
    ['goToHome', '/'],
    ['goToLogin', '/login'],
    ['goToRegister', '/register'],
    ['goToAdmin', '/admin'],
    ['goToOrders', '/orders'],
  ] as const)('%s naviga a %s', (method, path) => {
    (component[method] as () => void)();
    expect(router.navigate).toHaveBeenCalledWith([path]);
  });

  it('logout fa logout, resetta carrello e wishlist, e naviga a /products', () => {
    component.logout();

    expect(authService.logout).toHaveBeenCalled();
    expect(cartService.resetCart).toHaveBeenCalled();
    expect(wishlistService.resetWishlist).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/products']);
  });
});
