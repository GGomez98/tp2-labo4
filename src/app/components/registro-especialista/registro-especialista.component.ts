import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import {AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { UsuarioService } from '../../servicios/usuario/usuario.service';
import { Auth, createUserWithEmailAndPassword, signOut } from '@angular/fire/auth';
@Component({
  selector: 'app-registro-especialista',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registro-especialista.component.html',
  styleUrl: './registro-especialista.component.scss'
})
export class RegistroEspecialistaComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;
  registerForm!: FormGroup;
  especialidades = ['','Medicina', 'Enfermería', 'Odontología', 'Psicología'];
  formularioEnviado: boolean = false;

  constructor(private usuarioService: UsuarioService, private auth: Auth) {}

  ngOnInit(){
    this.registerForm = new FormGroup({
      nombre: new FormControl("", [Validators.pattern('^[a-zA-Z]+$'),Validators.required]),
      apellido: new FormControl("", [Validators.pattern('^[a-zA-Z]+$'),Validators.required]),
      edad: new FormControl("",[Validators.min(18),Validators.max(99),Validators.required]),
      dni: new FormControl("",[Validators.required,Validators.minLength(8),Validators.maxLength(8)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required,Validators.minLength(6)]),
      imagen: new FormControl('', [Validators.required, this.validarImagen]),
    });
  }

  validarImagen(control: AbstractControl) {
    const value = control.value;
    if (!value || !Array.isArray(value) || value.length !== 1) {
      return { invalidImageCount: true };
    }
    return null;
  }

  async onSubmit() {

    this.formularioEnviado = true;

    if (this.registerForm.valid) {

      let userData = {
        nombre: this.registerForm.value.nombre,
        apellido: this.registerForm.value.apellido,
        edad: this.registerForm.value.edad,
        dni: this.registerForm.value.dni,
        email: this.registerForm.value.email,
        imagen: this.registerForm.value.imagen,
      };
        this.usuarioService.registrarUsuarios(userData, 'especialistas');
        this.formularioEnviado = false;
        createUserWithEmailAndPassword(this.auth,userData.email,this.registerForm.value.password).then(()=>{
          signOut(this.auth);
          console.log('Usuario registrado exitosamente');
          this.registerForm.reset();
          this.fileInput.nativeElement.value = '';
        })
    } else {
      console.log('Formulario inválido');
    }
  }

  onFileChange(event: any, controlName: string) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        this.registerForm.get(controlName)?.setValue([base64]);
        this.registerForm.get(controlName)?.updateValueAndValidity();
      };
      reader.readAsDataURL(file);
    } else {
      this.registerForm.get(controlName)?.setValue([]);
      this.registerForm.get(controlName)?.updateValueAndValidity();
    }
  }

  get nombre() {
    return this.registerForm.get('nombre');
  }
  get apellido() {
    return this.registerForm.get('apellido');
  }
  get edad() {
    return this.registerForm.get('edad');
  }
  get dni() {
    return this.registerForm.get('dni');
  }
  get email() {
    return this.registerForm.get('email');
  }
  get password() {
    return this.registerForm.get('password');
  }
  get imagen() {
    return this.registerForm.get('imagen');
  }
}
