import { TestBed } from '@angular/core/testing';

import { Sidebar } from '../../services/sidebar.serviceebar/sidebar.service';

describe('Sidebar', () => {
  let service: Sidebar;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Sidebar);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
