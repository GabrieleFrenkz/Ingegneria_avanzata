import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { User, AuthResponse, LoginRequest, RegisterRequest } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly baseUrl = 'http://localhost:3000/api';
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';

  // Signal per stato reattivo
  currentUser = signal<User | null>(this.getUserFromStorage());
  isLoggedIn = signal<boolean>(!!this.getToken());

  constructor(private readonly http: HttpClient) {}

  // Registrazione
  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, { user: request }).pipe(
      tap((response) => this.handleAuthResponse(response))
    );
  }

  // Login
  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, { user: request }).pipe(
      tap((response) => this.handleAuthResponse(response))
    );
  }

  // Logout
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
  }

  // Ottieni profilo utente corrente dal server
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/me`);
  }

  // Verifica se l'utente è admin
  isAdmin(): boolean {
    return this.currentUser()?.role === 'admin';
  }

  // Ottieni token JWT
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Ottieni headers con autenticazione
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });
  }

  // Gestisce la risposta di autenticazione
  private handleAuthResponse(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
    this.currentUser.set(response.user);
    this.isLoggedIn.set(true);
  }

  // Recupera utente dal localStorage
  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }
}
