import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import {AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { UsuarioService } from '../../servicios/usuario/usuario.service';
import { Auth, createUserWithEmailAndPassword, sendEmailVerification, signInWithCredential, signInWithCustomToken, signInWithEmailAndPassword, signOut, updateCurrentUser, User } from '@angular/fire/auth';
import { RecaptchaModule, RecaptchaFormsModule  } from 'ng-recaptcha';
import Swal from 'sweetalert2';
import { addDoc, collection, doc, Firestore, getDoc } from '@angular/fire/firestore';
@Component({
  selector: 'app-registro-especialista',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RecaptchaFormsModule, RecaptchaModule],
  templateUrl: './registro-especialista.component.html',
  styleUrl: './registro-especialista.component.scss'
})
export class RegistroEspecialistaComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;
  registerForm!: FormGroup;
  especialidadesList = ['','Medicina', 'Enfermería', 'Odontología', 'Psicología'];
  formularioEnviado: boolean = false;
  tags: string[] = [];
  showDropdown: boolean = false;
  recaptchaResponse: string | null = null;

  constructor(private usuarioService: UsuarioService, private auth: Auth, private firestore: Firestore) {}

  ngOnInit(){
    this.registerForm = new FormGroup({
      nombre: new FormControl("", [Validators.pattern('^[a-zA-Z]+$'),Validators.required]),
      apellido: new FormControl("", [Validators.pattern('^[a-zA-Z]+$'),Validators.required]),
      edad: new FormControl("",[Validators.min(18),Validators.max(99),Validators.required]),
      dni: new FormControl("",[Validators.required,Validators.minLength(8),Validators.maxLength(8)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      especialidades: new FormControl(''),
      password: new FormControl('', [Validators.required,Validators.minLength(6)]),
      imagen: new FormControl('', [Validators.required, this.validarImagen]),
      recaptcha: new FormControl('', Validators.required)
    });
  }

  resolved(captchaResponse: string|null): void {
    this.recaptchaResponse = captchaResponse;
  }

  addTag() {
    const trimmedText = (this.registerForm.value.especialidades).trim();
    if (trimmedText && !this.tags.includes(trimmedText)) {
      this.tags.push(trimmedText);
      this.registerForm.value.especialidades = '';
    }
  }

  removeTag(index: number) {
    this.tags.splice(index, 1);
  }

  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault(); 
      this.addTag();
      this.showDropdown = false;
      this.especialidades?.reset();
    }
  }

  addTagFromSelect(selectedOption: string) {
    if (selectedOption && !this.tags.includes(selectedOption)) {
      this.tags.push(selectedOption);
    }
  }

  validarImagen(control: AbstractControl) {
    const value = control.value;
    if (!value || !Array.isArray(value) || value.length !== 1) {
      return { invalidImageCount: true };
    }
    return null;
  }

  handleInputFocus() {
    this.showDropdown = true;
  }

  handleInputBlur() {
    setTimeout(() => {
      this.showDropdown = false;
    }, 200);
  }

  async onSubmit() {

    this.formularioEnviado = true;

    if (this.registerForm.valid) {
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
        nombre: this.registerForm.value.nombre,
        apellido: this.registerForm.value.apellido,
        edad: this.registerForm.value.edad,
        dni: this.registerForm.value.dni,
        email: this.registerForm.value.email,
        imagen: this.registerForm.value.imagen,
        especialidades: this.tags,
        verificado: false,
        rol:'especialista'
      };

      const userDocRef = doc(this.firestore, `usuarios/${this.auth.currentUser?.uid}`);
      const userDoc = await getDoc(userDocRef);
      const usuarioAdministrador = userDoc.data();
      const usuarioAdministradorCredentials = this.auth.currentUser
      
        createUserWithEmailAndPassword(this.auth,userData.email,this.registerForm.value.password).then(async(res)=>{
          if(res.user.email!=null)
            await this.usuarioService.registrarUsuarios(this.auth.currentUser?.uid as string,userData);
            await this.CargarHorariosPorDefecto();
            sendEmailVerification(this.auth.currentUser as User)
            console.log(usuarioAdministrador?.['rol'])
            if(usuarioAdministrador?.['rol'] == 'administrador'){
              updateCurrentUser(this.auth, usuarioAdministradorCredentials)
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
            this.registerForm.reset();
            this.fileInput.nativeElement.value = '';
            this.tags = [];
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

  convertBase64ToBlob(base64Image: string, contentType: string = 'image/*'): Blob {
    base64Image = base64Image.replace(/^data:image\/\w+;base64,/, '');
    base64Image = base64Image.replace(/\s/g, '');
    console.log(base64Image)
    const byteCharacters = atob(base64Image);
    const byteNumbers = new Array(byteCharacters.length);
  
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
  
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
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

  async CargarHorariosPorDefecto(){
    const userId = this.auth.currentUser?.uid;
    const userDocRef = doc(this.firestore, `usuarios/${userId}`);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data();
    userData?.['especialidades'].forEach(async (especialidad: any) => {
      const horarioData = {
        especialistaId: this.auth.currentUser?.uid,
        especialidad: especialidad,
        horarios:[
          {dia:'lunes',horaInicio:"08:00",horaFin:"19:00"},
          {dia:'martes',horaInicio:"08:00",horaFin:"19:00"},
          {dia:'miercoles',horaInicio:"08:00",horaFin:"19:00"},
          {dia:'jueves',horaInicio:"08:00",horaFin:"19:00"},
          {dia:'viernes',horaInicio:"08:00",horaFin:"19:00"},
          {dia:'sabado',horaInicio:"08:00",horaFin:"14:00"}
        ],
        minutosTurno: 30
      }
      try {
        const horarioDocRef = collection(this.firestore, `horariosAtencion`);
        await addDoc(horarioDocRef, horarioData);
        console.log('Los horarios del usuario se registraron con exito');
      } catch (error) {
        console.error('Error al registrar los horarios del usuario:', error);
      }
    });
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
  get especialidades() {
    return this.registerForm.get('especialidades');
  }
  get password() {
    return this.registerForm.get('password');
  }
  get imagen() {
    return this.registerForm.get('imagen');
  }
  get recaptcha() {
    return this.registerForm.get('recaptcha');
  }
}
