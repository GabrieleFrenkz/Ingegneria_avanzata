import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth-service';
import { AuthResponse, User } from '../models/user';

const API = 'http://localhost:3000/api';

const mockUser: User = {
  id: 1,
  email: 'mario@example.com',
  firstName: 'Mario',
  lastName: 'Rossi',
  role: 'user',
  createdAt: '2026-01-01T00:00:00Z',
};

const mockAuthResponse: AuthResponse = {
  message: 'ok',
  user: mockUser,
  token: 'jwt-token-123',
};

function setup(): { service: AuthService; httpMock: HttpTestingController } {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting()],
  });
  return {
    service: TestBed.inject(AuthService),
    httpMock: TestBed.inject(HttpTestingController),
  };
}

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    ({ service, httpMock } = setup());
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('register invia una POST a /register e salva token, currentUser e isLoggedIn', () => {
    service
      .register({
        email: 'mario@example.com',
        password: 'password123',
        password_confirmation: 'password123',
        first_name: 'Mario',
        last_name: 'Rossi',
      })
      .subscribe();

    const req = httpMock.expectOne(`${API}/register`);
    expect(req.request.method).toBe('POST');
    req.flush(mockAuthResponse);

    expect(service.getToken()).toBe('jwt-token-123');
    expect(service.currentUser()).toEqual(mockUser);
    expect(service.isLoggedIn()).toBe(true);
  });

  it('login invia una POST a /login e salva token, currentUser e isLoggedIn', () => {
    service.login({ email: 'mario@example.com', password: 'password123' }).subscribe();

    const req = httpMock.expectOne(`${API}/login`);
    expect(req.request.method).toBe('POST');
    req.flush(mockAuthResponse);

    expect(service.getToken()).toBe('jwt-token-123');
    expect(service.currentUser()).toEqual(mockUser);
    expect(service.isLoggedIn()).toBe(true);
  });

  it('logout rimuove il token e resetta currentUser e isLoggedIn', () => {
    service.login({ email: 'mario@example.com', password: 'password123' }).subscribe();
    httpMock.expectOne(`${API}/login`).flush(mockAuthResponse);

    service.logout();

    expect(service.getToken()).toBeNull();
    expect(service.currentUser()).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
  });

  it('getCurrentUser invia una GET a /me', () => {
    service.getCurrentUser().subscribe();

    const req = httpMock.expectOne(`${API}/me`);
    expect(req.request.method).toBe('GET');
    req.flush(mockUser);
  });

  it("isAdmin restituisce true se l'utente corrente ha ruolo admin", () => {
    service.login({ email: 'admin@example.com', password: 'password123' }).subscribe();
    httpMock
      .expectOne(`${API}/login`)
      .flush({ ...mockAuthResponse, user: { ...mockUser, role: 'admin' } });

    expect(service.isAdmin()).toBe(true);
  });

  it("isAdmin restituisce false se non c'è un utente autenticato", () => {
    expect(service.isAdmin()).toBe(false);
  });

  it('getToken restituisce il token salvato in localStorage', () => {
    service.login({ email: 'mario@example.com', password: 'password123' }).subscribe();
    httpMock.expectOne(`${API}/login`).flush(mockAuthResponse);

    expect(localStorage.getItem('auth_token')).toBe('jwt-token-123');
    expect(service.getToken()).toBe('jwt-token-123');
  });

  it('getAuthHeaders include Authorization con il token se presente', () => {
    service.login({ email: 'mario@example.com', password: 'password123' }).subscribe();
    httpMock.expectOne(`${API}/login`).flush(mockAuthResponse);

    expect(service.getAuthHeaders().get('Authorization')).toBe('Bearer jwt-token-123');
  });

  it("getAuthHeaders ha Authorization vuoto se non c'è un token", () => {
    expect(service.getAuthHeaders().get('Authorization')).toBe('');
  });

  it("isLoggedIn si inizializza a true se un token è già presente in localStorage alla creazione del servizio", () => {
    localStorage.setItem('auth_token', 'existing-token');
    ({ service, httpMock } = setup());

    expect(service.isLoggedIn()).toBe(true);
  });
});
