import { TestBed } from '@angular/core/testing';

import { ProductApi } from './product-api';

describe('ProductApi', () => {
  let service: ProductApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
