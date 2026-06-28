import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    // Not logged in, redirect to login
    router.navigate(['/login']);
    return false;
  }

  if (!authService.isAdmin()) {
    // Logged in but not admin, redirect to products
    router.navigate(['/products']);
    return false;
  }

  // Is admin, allow access
  return true;
};
