import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { checkoutGuardGuard } from './checkout-guard-guard';

describe('checkoutGuardGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => checkoutGuardGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
