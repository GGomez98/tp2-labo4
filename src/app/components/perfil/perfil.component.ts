import { CommonModule } from '@angular/common';
import { Component, ComponentRef, ElementRef, ViewChild, ViewContainerRef } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { collection, doc, docData, Firestore, getDoc, onSnapshot } from '@angular/fire/firestore';
import { FormHorariosComponent } from './form-horarios/form-horarios.component';
import { HistoriaClinicaComponent } from '../historia-clinica/historia-clinica.component';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormHorariosComponent, HistoriaClinicaComponent],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss'
})
export class PerfilComponent {
  @ViewChild("modal") modal!: ElementRef;
  userData: any;
  horarios: any;
  horariosCargados: boolean = false;

  constructor(protected auth: Auth, protected firestore: Firestore){}

  async ngOnInit(){
    const userId = this.auth.currentUser?.uid
    const userDocRef = doc(this.firestore, `usuarios/${userId}`);
    const userDoc = await getDoc(userDocRef);
    this.userData = userDoc.data();
    this.obtenerHorarios();
  }

  async obtenerHorarios(){
    const query = collection(this.firestore, "horariosAtencion");

      onSnapshot(query, (querySnapshot) => {
        this.horarios = [];

        querySnapshot.forEach((doc) => {
          const horario = doc.data();
          if(this.auth.currentUser?.uid == horario['especialistaId']){
            horario['id'] = doc.id
            this.horarios.push(horario);
          }
        });

        console.log(this.horarios);
        this.horariosCargados = true;
      });
  }
}
