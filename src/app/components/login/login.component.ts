import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { Auth, sendEmailVerification, signInWithEmailAndPassword, signOut, User } from '@angular/fire/auth';
import { addDoc, collection, doc, Firestore, getDoc, setDoc } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  @ViewChild('favbutton') favButton!: ElementRef;
  @ViewChild('favbuttondiv') favButtonDiv!: ElementRef;
  userMail: string = "";
  userPWD: string = "";
  loggedUser: string = "";
  flagError: boolean = false;
  msjError: string = "";
  fabOptions: any = [
    {email: "quebraffuyottu-7479@yopmail.com", pass:"123456", imagen:"/assets/images/paciente.jpg", pos:'80px'},
    {email: "gruruttevauppeu-6330@yopmail.com", pass:"123456", imagen:"/assets/images/paciente.jpg", pos:'140px'},
    {email: "xifroyaprouhoi-2328@yopmail.com", pass:"123456", imagen:"/assets/images/paciente.jpg", pos:'200px'},
    {email: "veuqueuddauddamu-5932@yopmail.com", pass:"123456", imagen:"/assets/images/doctor.jpg", pos:'260px'},
    {email: "gaukacreugrouxou-9905@yopmail.com", pass:"123456", imagen:"/assets/images/doctor.jpg", pos:'320px'},
    {email: "admin@mail.com", pass:"123456", imagen:"/assets/images/admin.jpeg", pos:'380px'}
  ]
  isExpanded = false;
  animacion = true;

  constructor(public auth: Auth, private router: Router, private firestore: Firestore) {}

  ngOnInit(){
    this.auth.signOut();
  }

  convertBase64ToURL(base64Image: string, contentType: string = 'image/*'): string {
    base64Image = base64Image.replace(/^data:image\/\w+;base64,/, '');
    base64Image = base64Image.replace(/\s/g, '');
    console.log(base64Image)
    const byteCharacters = atob(base64Image);
    const byteNumbers = new Array(byteCharacters.length);
  
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
  
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: contentType });
    return URL.createObjectURL(blob);
  }

  toggleFab() {
    if(!this.isExpanded){
      this.favButtonDiv.nativeElement.classList.add('active')
      this.favButton.nativeElement.innerText = '-'
    }
    else{
      this.favButtonDiv.nativeElement.classList.remove('active')
      this.favButton.nativeElement.innerText = '+'
    }
    this.isExpanded = !this.isExpanded;
  }

  onOptionClick(option: any) {
    console.log('Clicked option:', option);
    this.CompletarInputs(option['email'],option['pass'])
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

  async Login() {
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
    
    await signInWithEmailAndPassword(this.auth, this.userMail, this.userPWD).then(async (userCredential)=>{
      if (userCredential.user.email !== null){
        const userId = userCredential.user.uid;
        const userDocRef = doc(this.firestore, `usuarios/${userId}`);
        const userDoc = await getDoc(userDocRef);
        const userData = userDoc.data();
        Swal.close();
        if((userData?.['rol'] == 'paciente' && userCredential.user.emailVerified) || (userData?.['rol'] == 'especialista' && userData?.['verificado'] && userCredential.user.emailVerified)||userData?.['rol'] == 'administrador'){
          this.loggedUser = userCredential.user.email;
          let col = collection(this.firestore, "logins");
          addDoc(col,{fecha: new Date(), "user": this.loggedUser});
          Swal.fire({
          title: `Bienvenido ${userData?.['nombre']}\nFecha de ingreso: ${this.obtenerFechaActual()}`,
          background: '#fff',
          color: '#000',
          confirmButtonColor: '#ff5722'
          })
          switch(userData?.['rol']){
            case 'paciente':
              console.log('Ingreso un paciente')
              this.flagError = false;
              this.router.navigate(['home']);
            break;
            case 'especialista':
              console.log('Ingreso un especialista')
              this.flagError = false;
              this.router.navigate(['home']);
            break;
            default:
              console.log('Ingreso un administrador')
              this.flagError = false;
              this.router.navigate(['home']);
              break
          }
        }
        else if(userData?.['rol'] == 'especialista'){
          signOut(this.auth)
          if(!userCredential.user.emailVerified){
            Swal.fire({
              title: `Email no verificado, revise su correo`,
              background: '#fff',
              color: '#000',
              confirmButtonColor: '#ff5722'
              })
          }
          else{
            signOut(this.auth)
            Swal.fire({
              title: `El administrador aun no valido su cuenta`,
              background: '#fff',
              color: '#000',
              confirmButtonColor: '#ff5722'
            })
          }
        }
        else{
          signOut(this.auth)
          Swal.fire({
            title: `Email no verificado, revise su correo`,
            background: '#fff',
            color: '#000',
            confirmButtonColor: '#ff5722'
            })
        }
    }
    })
    .catch((e)=>{
      signOut(this.auth)
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
    })
  }

  CompletarInputs(mail:string,pass:string) {
    this.userMail=mail;
    this.userPWD=pass;
    this.auth.signOut();
  }
}
