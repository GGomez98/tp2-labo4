import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { collection, Firestore, onSnapshot } from '@angular/fire/firestore';

@Component({
  selector: 'app-lista-usuarios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-usuarios.component.html',
  styleUrl: './lista-usuarios.component.scss'
})
export class ListaUsuariosComponent {
  usuarios:any = []
  usuariosCargados = false;
  constructor(public auth: Auth, private firestore: Firestore) {}

  ngOnInit(){
    this.obtenerUsuarios();
  }

  async obtenerUsuarios(){
    const query = collection(this.firestore, "usuarios");

    onSnapshot(query, (querySnapshot) => {
      this.usuarios = [];
      
      // Recorrer los documentos en el snapshot
      querySnapshot.forEach((doc) => {
        const usuario = doc.data();
        if(usuario['rol']!='administrador'){
          usuario['id'] = doc.id
          this.usuarios.push(usuario);
        }
      });
      
      // Mostrar los mensajes en consola
      console.log(this.usuarios);
      this.usuariosCargados = true;
    });
  }
}
