import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { collection, doc, Firestore, onSnapshot, setDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-lista-usuarios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-usuarios.component.html',
  styleUrl: './lista-usuarios.component.scss'
})
export class ListaUsuariosComponent {
  @ViewChild('pacientesBtn') pacientesBtn!: ElementRef;
  @ViewChild('especialistasBtn') especialistasBtn!: ElementRef;
  @ViewChild('administradoresBtn') administradoresBtn!: ElementRef;
  usuarios:any = []
  usuariosCargados = false;
  listaPacientes = true;
  listaEspecialistas = false;
  listaAdministradores = false;

  constructor(public auth: Auth, private firestore: Firestore) {}

  ngOnInit(){
    this.obtenerUsuarios("");
  }

  async obtenerUsuarios(lista: string){
    this.seleccionarLista(lista);

    if(this.listaPacientes){
      const query = collection(this.firestore, "usuarios");

      onSnapshot(query, (querySnapshot) => {
        this.usuarios = [];

        // Recorrer los documentos en el snapshot
        querySnapshot.forEach((doc) => {
          const usuario = doc.data();
          if(usuario['rol']=='paciente'){
            usuario['id'] = doc.id
            this.usuarios.push(usuario);
          }
        });

        // Mostrar los mensajes en consola
        console.log(this.usuarios);
        this.usuariosCargados = true;
      });
    }
    else if(this.listaEspecialistas){
      const query = collection(this.firestore, "usuarios");

      onSnapshot(query, (querySnapshot) => {
        this.usuarios = [];

        // Recorrer los documentos en el snapshot
        querySnapshot.forEach((doc) => {
          const usuario = doc.data();
          if(usuario['rol']=='especialista'){
            usuario['id'] = doc.id
            this.usuarios.push(usuario);
          }
        });

        // Mostrar los mensajes en consola
        console.log(this.usuarios);
        this.usuariosCargados = true;
      });
    }
    else{
      const query = collection(this.firestore, "usuarios");

      onSnapshot(query, (querySnapshot) => {
        this.usuarios = [];

        // Recorrer los documentos en el snapshot
        querySnapshot.forEach((doc) => {
          const usuario = doc.data();
          if(usuario['rol']=='administrador'){
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

  seleccionarLista(lista:string){
    switch(lista){
      case "administradores":
        this.listaAdministradores = true;
        this.listaEspecialistas = false;
        this.listaPacientes = false;
        this.pacientesBtn.nativeElement.classList.remove('active')
        this.especialistasBtn.nativeElement.classList.remove('active')
        this.administradoresBtn.nativeElement.classList.add('active')
      break;
      case "especialistas":
        this.listaAdministradores = false;
        this.listaEspecialistas = true;
        this.listaPacientes = false;
        this.pacientesBtn.nativeElement.classList.remove('active')
        this.especialistasBtn.nativeElement.classList.add('active')
        this.administradoresBtn.nativeElement.classList.remove('active')
      break;
      default:
        this.listaAdministradores = false;
        this.listaEspecialistas = false;
        this.listaPacientes = true;
        if(this.usuariosCargados){
          this.pacientesBtn.nativeElement.classList.add('active')
          this.especialistasBtn.nativeElement.classList.remove('active')
          this.administradoresBtn.nativeElement.classList.remove('active')
        }
      break;
    }
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
}
