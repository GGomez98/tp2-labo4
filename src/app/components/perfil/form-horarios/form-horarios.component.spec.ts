import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormHorariosComponent } from './form-horarios.component';

describe('FormHorariosComponent', () => {
  let component: FormHorariosComponent;
  let fixture: ComponentFixture<FormHorariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormHorariosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormHorariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
