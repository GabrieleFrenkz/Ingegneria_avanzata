import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { errorInterceptor } from './error.interceptor';
import { AuthService } from '../services/auth-service';
import { NotificationService } from '../services/notification.service';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let router: Router;
  let authService: { logout: ReturnType<typeof vi.fn> };
  let notificationService: { showError: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authService = { logout: vi.fn() };
    notificationService = { showError: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authService },
        { provide: NotificationService, useValue: notificationService },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('su 401 fa logout e naviga a /login con i queryParams di sessione scaduta', () => {
    http.get('/api/cart').subscribe({ error: () => {} });

    httpMock.expectOne('/api/cart').flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(authService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(
      ['/login'],
      expect.objectContaining({ queryParams: expect.objectContaining({ sessionExpired: 'true' }) })
    );
  });

  it("su 401 verso /api/login non fa logout né naviga", () => {
    http.get('/api/login').subscribe({ error: () => {} });

    httpMock.expectOne('/api/login').flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(authService.logout).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('su 401 non mostra la notifica di errore (gestito dal redirect)', () => {
    http.get('/api/cart').subscribe({ error: () => {} });

    httpMock.expectOne('/api/cart').flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(notificationService.showError).not.toHaveBeenCalled();
  });

  it('su 403 mostra una notifica di accesso negato', () => {
    http.get('/api/admin/orders').subscribe({ error: () => {} });

    httpMock.expectOne('/api/admin/orders').flush({}, { status: 403, statusText: 'Forbidden' });

    expect(notificationService.showError).toHaveBeenCalledWith(
      'Non hai i permessi per accedere a questa risorsa.'
    );
  });

  it("su 404 mostra il messaggio d'errore del backend se presente", () => {
    http.get('/api/products/x').subscribe({ error: () => {} });

    httpMock
      .expectOne('/api/products/x')
      .flush({ error: 'Product not found' }, { status: 404, statusText: 'Not Found' });

    expect(notificationService.showError).toHaveBeenCalledWith('Product not found');
  });

  it('su 422 con error.error unisce e mostra quel messaggio', () => {
    http.post('/api/register', {}).subscribe({ error: () => {} });

    httpMock
      .expectOne('/api/register')
      .flush({ error: 'Email già in uso' }, { status: 422, statusText: 'Unprocessable Entity' });

    expect(notificationService.showError).toHaveBeenCalledWith('Email già in uso');
  });

  it('su 422 con error.errors unisce tutti i messaggi di validazione', () => {
    http.post('/api/register', {}).subscribe({ error: () => {} });

    httpMock.expectOne('/api/register').flush(
      { errors: { email: ["can't be blank"], password: ['is too short'] } },
      { status: 422, statusText: 'Unprocessable Entity' }
    );

    expect(notificationService.showError).toHaveBeenCalledWith("can't be blank, is too short");
  });

  it('su 500 mostra un messaggio generico di errore del server', () => {
    http.get('/api/products').subscribe({ error: () => {} });

    httpMock.expectOne('/api/products').flush({}, { status: 500, statusText: 'Server Error' });

    expect(notificationService.showError).toHaveBeenCalledWith(
      'Errore del server. Riprova tra qualche minuto.'
    );
  });

  it('propaga un errore con status e message formattato', () => {
    let captured: any;

    http.get('/api/products').subscribe({ error: (err) => (captured = err) });
    httpMock
      .expectOne('/api/products')
      .flush({ error: 'boom' }, { status: 404, statusText: 'Not Found' });

    expect(captured.status).toBe(404);
    expect(captured.message).toBe('boom');
  });
});
