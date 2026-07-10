import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let snackBar: MatSnackBar;
  let openSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
    snackBar = TestBed.inject(MatSnackBar);
    openSpy = vi.spyOn(snackBar, 'open').mockReturnValue({} as any);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('showError apre la snackbar con panelClass error-snackbar e durata 5000ms di default', () => {
    service.showError('Errore');

    expect(openSpy).toHaveBeenCalledWith(
      'Errore',
      'Chiudi',
      expect.objectContaining({ duration: 5000, panelClass: ['error-snackbar'] })
    );
  });

  it('showSuccess apre la snackbar con panelClass success-snackbar e durata 3000ms di default', () => {
    service.showSuccess('Fatto');

    expect(openSpy).toHaveBeenCalledWith(
      'Fatto',
      'Chiudi',
      expect.objectContaining({ duration: 3000, panelClass: ['success-snackbar'] })
    );
  });

  it('showInfo apre la snackbar con panelClass info-snackbar e durata 3000ms di default', () => {
    service.showInfo('Info');

    expect(openSpy).toHaveBeenCalledWith(
      'Info',
      'Chiudi',
      expect.objectContaining({ duration: 3000, panelClass: ['info-snackbar'] })
    );
  });

  it('showWarning apre la snackbar con panelClass warning-snackbar e durata 4000ms di default', () => {
    service.showWarning('Attenzione');

    expect(openSpy).toHaveBeenCalledWith(
      'Attenzione',
      'Chiudi',
      expect.objectContaining({ duration: 4000, panelClass: ['warning-snackbar'] })
    );
  });

  it('accetta una durata custom sovrascrivendo il default', () => {
    service.showError('Errore', 1000);

    expect(openSpy).toHaveBeenCalledWith(
      'Errore',
      'Chiudi',
      expect.objectContaining({ duration: 1000 })
    );
  });
});
