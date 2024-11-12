import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { collection, doc, Firestore, onSnapshot, setDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-gestion-permisos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gestion-permisos.component.html',
  styleUrl: './gestion-permisos.component.scss'
})
export class GestionPermisosComponent {
  especialistas:any = []
  usuariosCargados = false;
  constructor(public auth: Auth, private firestore: Firestore) {}

  ngOnInit(){
    this.obtenerEspecialistas();
  }

  async cambiarEstadoEspecialista(especialista: any, isVerificado: boolean){
    especialista.verificado = isVerificado;
    const userData = {
      nombre: especialista.nombre,
      apellido: especialista.apellido,
      dni: especialista.dni,
      edad: especialista.edad,
      email: especialista.email,
      especialidades: especialista.especialidades,
      imagen: especialista.imagen,
      rol: especialista.rol,
      verificado: especialista.verificado
    }
    const userDocRef = doc(this.firestore, `usuarios/${especialista.id}`);
    await setDoc(userDocRef, userData);
  }

  async obtenerEspecialistas(){
    const query = collection(this.firestore, "usuarios");

    onSnapshot(query, (querySnapshot) => {
      this.especialistas = [];
      
      // Recorrer los documentos en el snapshot
      querySnapshot.forEach((doc) => {
        const usuario = doc.data();
        if(usuario['rol']=='especialista'){
          usuario['id'] = doc.id
          this.especialistas.push(usuario);
        }
      });
      
      // Mostrar los mensajes en consola
      console.log(this.especialistas);
      this.usuariosCargados = true;
    });
  }
}
