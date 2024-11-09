import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioService } from '../../servicios/usuario/usuario.service';
import { Auth, createUserWithEmailAndPassword, sendEmailVerification, signOut, User } from '@angular/fire/auth';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registro-paciente',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './registro-paciente.component.html',
  styleUrl: './registro-paciente.component.scss'
})

export class RegistroPacienteComponent {
  @ViewChild('fileInput1') fileInput1!: ElementRef;
  @ViewChild('fileInput2') fileInput2!: ElementRef;
  registroForm!: FormGroup;
  formularioEnviado: boolean = false;

  constructor(private usuarioService: UsuarioService, private auth: Auth) {}

  ngOnInit(){
    this.registroForm = new FormGroup({
      nombre: new FormControl("", [Validators.pattern('^[a-zA-Z]+$'),Validators.required]),
      apellido: new FormControl("", [Validators.pattern('^[a-zA-Z]+$'),Validators.required]),
      edad: new FormControl("",[Validators.min(0),Validators.max(99),Validators.required]),
      dni: new FormControl("",[Validators.required,Validators.minLength(8),Validators.maxLength(8)]),
      obraSocial: new FormControl("", Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required,Validators.minLength(6)]),
      imagen1: new FormControl('', [Validators.required, this.validarImagen]),
      imagen2: new FormControl('', [Validators.required, this.validarImagen])
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

    if (this.registroForm.valid) {
      Swal.fire({
        title: 'Cargando...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        background: '#fff',
        color: '#000',
        didOpen: () => {
          Swal.showLoading();
        }
      });

      let userData = {
        nombre: this.registroForm.value.nombre,
        apellido: this.registroForm.value.apellido,
        edad: this.registroForm.value.edad,
        dni: this.registroForm.value.dni,
        obraSocial: this.registroForm.value.obraSocial,
        email: this.registroForm.value.email,
        imagen1: this.registroForm.value.imagen1,
        imagen2: this.registroForm.value.imagen2
      };
        createUserWithEmailAndPassword(this.auth,userData.email,this.registroForm.value.password).then(async ()=>{
            await this.usuarioService.registrarUsuarios(userData, 'pacientes');
            sendEmailVerification(this.auth.currentUser as User)
            signOut(this.auth);
            Swal.fire({
              title: `El usuario fue creado exitosamente, enviamos un mail a su correo electronico para la verificacion`,
              background: '#fff',
              color: '#000',
              confirmButtonColor: '#ff5722'
            })
            console.log('Usuario registrado exitosamente');
            this.registroForm.reset();
            this.fileInput1.nativeElement.value = '';
            this.fileInput2.nativeElement.value = '';
            this.formularioEnviado = false;
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
        this.registroForm.get(controlName)?.setValue([base64]);
        this.registroForm.get(controlName)?.updateValueAndValidity();
      };
      reader.readAsDataURL(file);
    } else {
      this.registroForm.get(controlName)?.setValue([]);
      this.registroForm.get(controlName)?.updateValueAndValidity();
    }
  }

  get nombre() {
    return this.registroForm.get('nombre');
  }
  get apellido() {
    return this.registroForm.get('apellido');
  }
  get edad() {
    return this.registroForm.get('edad');
  }
  get dni() {
    return this.registroForm.get('dni');
  }
  get obraSocial() {
    return this.registroForm.get('obraSocial');
  }
  get email() {
    return this.registroForm.get('email');
  }
  get password() {
    return this.registroForm.get('password');
  }
  get imagen1() {
    return this.registroForm.get('imagen1');
  }
  get imagen2() {
    return this.registroForm.get('imagen2');
  }
}
