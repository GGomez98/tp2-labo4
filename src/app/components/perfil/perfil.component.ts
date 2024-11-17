import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { collection, doc, Firestore, getDoc, onSnapshot } from '@angular/fire/firestore';
import Modal from 'bootstrap/js/dist/modal';
import { FormHorariosComponent } from './form-horarios/form-horarios.component';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormHorariosComponent],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss'
})
export class PerfilComponent {
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
          console.log(this.auth.currentUser?.uid)
          console.log(horario['especialistaId'])
          if(this.auth.currentUser?.uid == horario['especialistaId']){
            this.horarios.push(horario);
          }
        });

        console.log(this.horarios);
        this.horariosCargados = true;
      });
  }
}
