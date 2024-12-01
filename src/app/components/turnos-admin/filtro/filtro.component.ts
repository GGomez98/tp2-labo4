import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { collection, Firestore, getDocs, onSnapshot } from '@angular/fire/firestore';
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
  especialistasCargados = false

  constructor(private firestore: Firestore, private fb: FormBuilder){}

  async ngOnInit(){
    await this.obtenerEspecialistas()
    this.obtenerEspecialidades()
    const especialistasControls = this.especialistas.reduce((controls, esp) => {
      controls[esp.id] = true;
      return controls;
    }, {} as any);

    const especialidadesControls = this.especialidades.reduce((controls, esp) => {
      controls[esp] = true;
      return controls;
    }, {} as any);

    this.filtros = this.fb.group({
      ...especialistasControls,
      ...especialidadesControls,
    });
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

      console.log(this.especialistas);
      this.especialistasCargados = true;
    }
    catch(error){
      console.error("Error al obtener especialistas")
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
    console.log(this.especialidades);
  }
  aplicarFiltrosFn(){

    const seleccionados = Object.keys(this.filtros.value).filter(key => this.filtros.value[key]);

    const seleccionadosEspecialistas = seleccionados.filter(key =>
      this.especialistas.some(especialista => especialista.id === key)
    );

    const seleccionadosEspecialidades = seleccionados.filter(key =>
      this.especialidades.includes(key)
    );
  }
}
