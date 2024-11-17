import { Component } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-horarios',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './form-horarios.component.html',
  styleUrl: './form-horarios.component.scss'
})
export class FormHorariosComponent {
  registerForm!:FormGroup
}
