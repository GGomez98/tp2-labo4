import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { collection, doc, Firestore, onSnapshot, setDoc } from '@angular/fire/firestore';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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
  todosLosUsuarios: any[] = []
  usuariosPorRol:any = []
  usuariosCargados = false;
  listaPacientes = true;
  listaEspecialistas = false;
  listaAdministradores = false;

  constructor(public auth: Auth, private firestore: Firestore) {}

  ngOnInit(){
    this.obtenerTodosLosUsuarios();
    this.obtenerUsuarios("");
  }
  
  agruparUsuariosPorRol(){
    this.usuariosPorRol = []
    const pacientes: any[] = []
    const especialistas: any[] = []
    const administradores: any[] = []

    this.todosLosUsuarios.forEach(usuario => {
      if(usuario['rol'] == 'paciente'){
        pacientes.push(usuario)
      }
      else if(usuario['rol'] == 'especialista'){
        usuario.especialidades = usuario.especialidades.join(',')
        especialistas.push(usuario)
      }
      else{
        administradores.push(usuario);
      }
    });

    this.usuariosPorRol = {"pacientes":pacientes,"especialistas":especialistas,"administradores":administradores}
  }

  filtrarCampos(items: any[], campos: string[]): any[] {
    return items.map(item => {
      const itemFiltrado: any = { ...item };
      campos.forEach(campo => delete itemFiltrado[campo]);
      return itemFiltrado;
    });
  }

  descargarUsuarios(): void {
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    this.agruparUsuariosPorRol();

    const camposASacar: any = {
      pacientes: ['imagen1','imagen2'],
      especialistas: ['imagen'],
      administradores: ['imagen']
    };
  
    Object.keys(this.usuariosPorRol).forEach((key) => {
      const items = this.usuariosPorRol[key];
      if (items && items.length > 0) {
        const itemsFiltrados = this.filtrarCampos(items, camposASacar[key] || []);

        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(itemsFiltrados);
  
        XLSX.utils.book_append_sheet(workbook, worksheet, key);
      }
    });
  
    console.log(workbook);
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });
  
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'usuarios.xlsx');
  }

  async obtenerTodosLosUsuarios(){
      const query = collection(this.firestore, "usuarios");

      onSnapshot(query, (querySnapshot) => {
        this.usuarios = [];

        // Recorrer los documentos en el snapshot
        querySnapshot.forEach((doc) => {
          const usuario = doc.data();
          this.todosLosUsuarios.push(usuario);
        });

        // Mostrar los mensajes en consola
        console.log(this.todosLosUsuarios);
        this.usuariosCargados = true;
      });
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
