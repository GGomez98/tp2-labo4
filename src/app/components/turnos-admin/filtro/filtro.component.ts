import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { collection, Firestore, getDocs, onSnapshot } from '@angular/fire/firestore';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-filtro',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './filtro.component.html',
  styleUrl: './filtro.component.scss'
})
export class FiltroComponent {
  filtros!: FormGroup
  especialidades: any[] = []
  especialistas: any[] = []
  especialistasCargados = false

  constructor(private firestore: Firestore){}

  async ngOnInit(){
    await this.obtenerEspecialistas()
    this.obtenerEspecialidades()
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
}
