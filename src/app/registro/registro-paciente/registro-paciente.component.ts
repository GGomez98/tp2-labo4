import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioService } from '../../servicios/usuario/usuario.service';
import { Auth, createUserWithEmailAndPassword, sendEmailVerification, signOut, updateCurrentUser, User } from '@angular/fire/auth';
import Swal from 'sweetalert2';
import { RecaptchaModule, RecaptchaFormsModule  } from 'ng-recaptcha';
import { doc, Firestore, getDoc } from '@angular/fire/firestore';


@Component({
  selector: 'app-registro-paciente',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule, RecaptchaModule, RecaptchaFormsModule],
  templateUrl: './registro-paciente.component.html',
  styleUrl: './registro-paciente.component.scss'
}) 

export class RegistroPacienteComponent {
  @ViewChild('fileInput1') fileInput1!: ElementRef;
  @ViewChild('fileInput2') fileInput2!: ElementRef;
  registroForm!: FormGroup;
  formularioEnviado: boolean = false;
  recaptchaResponse: string | null = null;

  constructor(private usuarioService: UsuarioService, private auth: Auth, private firestore: Firestore) {}

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
      imagen2: new FormControl('', [Validators.required, this.validarImagen]),
      recaptcha: new FormControl('', Validators.required)
    });
  }

  resolved(captchaResponse: string|null): void {
    this.recaptchaResponse = captchaResponse;
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
        imagen2: this.registroForm.value.imagen2,
        rol:'paciente'
      };
      const userDocRef = doc(this.firestore, `usuarios/${this.auth.currentUser?.uid}`);
      const userDoc = await getDoc(userDocRef);
      const usuarioAdministrador = userDoc.data();
      const usuarioAdministradorCredentials = this.auth.currentUser
      
        createUserWithEmailAndPassword(this.auth,userData.email,this.registroForm.value.password).then(async(res)=>{
          if(res.user.email!=null)
            await this.usuarioService.registrarUsuarios(this.auth.currentUser?.uid as string,userData);
            sendEmailVerification(this.auth.currentUser as User)
            console.log(usuarioAdministrador?.['rol'])
            if(usuarioAdministrador?.['rol'] == 'administrador'){
              updateCurrentUser(this.auth, usuarioAdministradorCredentials)
              console.log('El usuario permanece logueado')
            }
            else{
              signOut(this.auth);
            }
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
        .catch((e)=> {
          Swal.close();
          switch (e.code) {
            case "auth/email-already-in-use":
              Swal.fire({
                title: `El mail ya esta en uso`,
                background: '#fff',
                color: '#000',
                confirmButtonColor: '#ff5722'
                })
              break;
            default:
              Swal.fire({
                title: `Ocurrio un error inesperado`,
                background: '#fff',
                color: '#000',
                confirmButtonColor: '#ff5722'
                })
              break;
          }
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
  get recaptcha() {
    return this.registroForm.get('recaptcha');
  }
}

