import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { collection, doc, Firestore, getDoc, getDocs, onSnapshot } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-filtro',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './filtro.component.html',
  styleUrl: './filtro.component.scss'
})
export class FiltroComponent {
  @Output() filtrar = new EventEmitter <any> ();
  filtros!: FormGroup
  especialidades: any[] = []
  especialistas: any[] = []
  pacientes: any[] = []
  especialistasCargados = false
  pacientesCargados = false
  userData: any;

  constructor(private firestore: Firestore, private fb: FormBuilder, private auth: Auth){}

  async ngOnInit(){
    await this.obtenerEspecialistas()
    await this.obtenerPacientes()
    this.obtenerEspecialidades()
    const userId = this.auth.currentUser?.uid
    const userDocRef = doc(this.firestore, `usuarios/${userId}`);
    const userDoc = await getDoc(userDocRef);
    this.userData = userDoc.data();

    const especialidadesControls = this.especialidades.reduce((controls, esp) => {
      controls[esp] = true;
      return controls;
    }, {} as any);

    if(this.userData['rol'] == 'paciente'){
      const especialistasControls = this.especialistas.reduce((controls, esp) => {
        controls[esp.id] = true;
        return controls;
      }, {} as any);
  
      this.filtros = this.fb.group({
        ...especialistasControls,
        ...especialidadesControls,
      });
    }
    else{
      const pacientesControls = this.pacientes.reduce((controls, pac) => {
        controls[pac.id] = true;
        return controls;
      }, {} as any);
  
      this.filtros = this.fb.group({
        ...pacientesControls,
        ...especialidadesControls,
      });
    }
  }

  async obtenerEspecialistas(){
    const query = collection(this.firestore, "usuarios");
    try{
      const querySnapshot = await getDocs(query);
      querySnapshot.forEach((doc) => {
        const usuario = doc.data();
        if(usuario['rol']=='especialista'){
          usuario['id'] = doc.id
          this.especialistas.push(usuario);
        }
      });

      this.especialistasCargados = true;
    }
    catch(error){
      console.error("Error al obtener especialistas")
    }
  }

  async obtenerPacientes(){
    const query = collection(this.firestore, "usuarios");
    try{
      const querySnapshot = await getDocs(query);
      querySnapshot.forEach((doc) => {
        const usuario = doc.data();
        if(usuario['rol']=='paciente'){
          usuario['id'] = doc.id
          this.pacientes.push(usuario);
        }
      });

      this.pacientesCargados = true;
    }
    catch(error){
      console.error("Error al obtener pacientes")
    }
  }

  obtenerEspecialidades(){
    this.especialistas.forEach(especialista => {
      especialista['especialidades'].forEach((especialidad: any) => {
        if(!this.especialidades.includes(especialidad)){
          this.especialidades.push(especialidad)
        }
      });
    });
  }

  aplicarFiltrosFn(){

    const seleccionados = Object.keys(this.filtros.value).filter(key => this.filtros.value[key]);


    const seleccionadosEspecialidades = seleccionados.filter(key =>
      this.especialidades.includes(key)
    );

    if(this.userData['rol']=='paciente'){
      const seleccionadosEspecialistas = seleccionados.filter(key =>
        this.especialistas.some(especialista => especialista.id === key)
      );
  
      this.filtrar.emit({'especialistas':seleccionadosEspecialistas, 'especialidades': seleccionadosEspecialidades})
    }
    else{
      const seleccionadosPacientes = seleccionados.filter(key =>
        this.pacientes.some(paciente => paciente.id === key)
      );
  
      this.filtrar.emit({'pacientes':seleccionadosPacientes, 'especialidades': seleccionadosEspecialidades})
    }
  }
}
