import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroAdminsComponent } from './registro-admins.component';

describe('RegistroAdminsComponent', () => {
  let component: RegistroAdminsComponent;
  let fixture: ComponentFixture<RegistroAdminsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroAdminsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroAdminsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
