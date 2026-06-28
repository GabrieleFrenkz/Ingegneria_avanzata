import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth-service';
import { NotificationService } from '../services/notification.service';

/**
 * Interceptor per gestione centralizzata degli errori HTTP
 *
 * Gestisce:
 * - 401 Unauthorized: Logout automatico e redirect al login
 * - 403 Forbidden: Accesso negato
 * - 404 Not Found: Risorsa non trovata
 * - 422 Unprocessable Entity: Errori di validazione
 * - 500+ Server Error: Errori del server
 *
 * Mostra notifiche visive all'utente usando NotificationService
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Si è verificato un errore. Riprova più tardi.';

      // Gestione errori specifici per status code
      switch (error.status) {
        case 0:
          // Errore di rete o CORS
          errorMessage = 'Impossibile connettersi al server. Verifica la connessione.';
          console.error('[ErrorInterceptor] Network error:', error);
          break;

        case 401:
          // Non autorizzato - logout e redirect al login
          errorMessage = 'Sessione scaduta. Effettua nuovamente il login.';
          console.error('[ErrorInterceptor] Unauthorized (401):', error);

          // Logout solo se non siamo già nella pagina di login
          if (!req.url.includes('/auth/login') && !req.url.includes('/auth/register')) {
            authService.logout();
            router.navigate(['/login'], {
              queryParams: { returnUrl: router.url, sessionExpired: 'true' }
            });
          }
          break;

        case 403:
          // Accesso negato
          errorMessage = 'Non hai i permessi per accedere a questa risorsa.';
          console.error('[ErrorInterceptor] Forbidden (403):', error);
          break;

        case 404:
          // Risorsa non trovata
          errorMessage = error.error?.error || 'Risorsa non trovata.';
          console.error('[ErrorInterceptor] Not Found (404):', error);
          break;

        case 422:
          // Errori di validazione
          if (error.error?.error) {
            errorMessage = error.error.error;
          } else if (error.error?.errors) {
            // Se il backend restituisce un oggetto errors
            const errors = error.error.errors;
            errorMessage = Object.values(errors).flat().join(', ');
          } else {
            errorMessage = 'I dati inseriti non sono validi.';
          }
          console.error('[ErrorInterceptor] Validation Error (422):', error);
          break;

        case 500:
        case 502:
        case 503:
        case 504:
          // Errori del server
          errorMessage = 'Errore del server. Riprova tra qualche minuto.';
          console.error('[ErrorInterceptor] Server Error (5xx):', error);
          break;

        default:
          // Altri errori
          if (error.error?.error) {
            errorMessage = error.error.error;
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          }
          console.error('[ErrorInterceptor] HTTP Error:', error);
      }

      // Logga l'errore completo per debugging
      console.error('[ErrorInterceptor] Error details:', {
        status: error.status,
        statusText: error.statusText,
        url: error.url,
        message: errorMessage,
        error: error.error
      });

      // Mostra notifica visiva all'utente (tranne per 401 che gestisce il redirect)
      if (error.status !== 401) {
        notificationService.showError(errorMessage);
      }

      // Restituisci un errore con il messaggio formattato
      return throwError(() => ({
        status: error.status,
        statusText: error.statusText,
        message: errorMessage,
        originalError: error
      }));
    })
  );
};