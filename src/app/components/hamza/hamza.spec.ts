import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hamza } from './hamza';

describe('Hamza', () => {
  let component: Hamza;
  let fixture: ComponentFixture<Hamza>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Hamza]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Hamza);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
