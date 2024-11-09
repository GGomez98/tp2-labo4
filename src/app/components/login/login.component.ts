import { Component } from '@angular/core';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { addDoc, collection, Firestore } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  userMail: string = "";
  userPWD: string = "";
  loggedUser: string = "";
  flagError: boolean = false;
  msjError: string = "";

  constructor(public auth: Auth, private router: Router, private firestore: Firestore) {
  }

  obtenerFechaActual = () => {
    const fecha = new Date();
  
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Los meses empiezan desde 0
    const año = fecha.getFullYear();
  
    const horas = String(fecha.getHours()).padStart(2, '0');
    const minutos = String(fecha.getMinutes()).padStart(2, '0');
  
    return `${dia}/${mes}/${año} ${horas}:${minutos}`;
  };

  Login() {
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
    
    signInWithEmailAndPassword(this.auth, this.userMail, this.userPWD)
    .then((res) => {
      Swal.close();
      if (res.user.email !== null)
        if(res.user.emailVerified){
          this.loggedUser = res.user.email;
          let col = collection(this.firestore, "logins");
          addDoc(col,{fecha: new Date(), "user": this.loggedUser});
          Swal.fire({
          title: `Bienvenido ${res.user.displayName}\nFecha de ingreso: ${this.obtenerFechaActual()}`,
          background: '#fff',
          color: '#000',
          confirmButtonColor: '#ff5722'
          })
          this.router.navigate(['home']);
          this.flagError = false;
        }
        else{
          Swal.fire({
            title: `Email no verificado, revise su correo`,
            background: '#fff',
            color: '#000',
            confirmButtonColor: '#ff5722'
            })
        } 
    })
    .catch((e) => {
      Swal.close();
      this.flagError = true;

      console.log(e.code);
      switch (e.code) {
        case "auth/invalid-email":
          if(this.userMail==''){
            this.msjError = 'Por favor ingrese un mail'
          }
          else{
            this.msjError = 'El mail ingresado es invalido'
          }
          break;
        case "auth/invalid-credential":
          this.msjError = "Contraseña incorrecta";
          break;
        case "auth/missing-password":
          this.msjError = "Falta ingresar la contraseña";
          break;
        default:
          this.msjError = "Ocurrio un error inesperado"
          break;
      }

      Swal.fire({
        title: `${this.msjError}`,
        background: '#fff',
        color: '#000',
        confirmButtonColor: '#ff5722'
        })
    });
  }

  CompletarInputs(mail:string,pass:string) {
    this.userMail=mail;
    this.userPWD=pass;
  }
}
