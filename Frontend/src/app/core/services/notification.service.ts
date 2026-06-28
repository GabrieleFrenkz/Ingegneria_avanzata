import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Servizio per mostrare notifiche all'utente
 * Usa Material Snackbar per messaggi di successo, errore, info
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private snackBar = inject(MatSnackBar);

  /**
   * Mostra un messaggio di errore
   */
  showError(message: string, duration = 5000): void {
    this.snackBar.open(message, 'Chiudi', {
      duration,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }

  /**
   * Mostra un messaggio di successo
   */
  showSuccess(message: string, duration = 3000): void {
    this.snackBar.open(message, 'Chiudi', {
      duration,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  /**
   * Mostra un messaggio informativo
   */
  showInfo(message: string, duration = 3000): void {
    this.snackBar.open(message, 'Chiudi', {
      duration,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['info-snackbar']
    });
  }

  /**
   * Mostra un messaggio di avviso
   */
  showWarning(message: string, duration = 4000): void {
    this.snackBar.open(message, 'Chiudi', {
      duration,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['warning-snackbar']
    });
  }
}