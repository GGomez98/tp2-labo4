import { CommonModule, KeyValuePipe } from '@angular/common';
import { Component } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { collection, doc, Firestore, getDoc, onSnapshot } from '@angular/fire/firestore';
import { TimeFormatPipe } from '../../pipes/time-format.pipe';
import { KeyValueListPipe } from '../../pipes/key-value-list.pipe';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import moment from 'moment';

@Component({
  selector: 'app-historia-clinica',
  standalone: true,
  imports: [CommonModule, TimeFormatPipe, KeyValueListPipe, ReactiveFormsModule],
  templateUrl: './historia-clinica.component.html',
  styleUrl: './historia-clinica.component.scss'
})
export class HistoriaClinicaComponent {
  userData: any;
  horarios: any;
  turnosCargados = false;
  turnos: any[] = []
  turnosPorEspecialista: any = []
  turnosPorPaciente: any[] = []
  especialistasPorPaciente: any[] = []
  especialistaCargado = false;
  historiaClinicaEspecialista!: FormGroup

  constructor(protected auth: Auth, protected firestore: Firestore){}

  async ngOnInit(){
    const userId = this.auth.currentUser?.uid
    const userDocRef = doc(this.firestore, `usuarios/${userId}`);
    const userDoc = await getDoc(userDocRef);
    this.userData = userDoc.data();
    await this.obtenerTurnos()
    this.historiaClinicaEspecialista = new FormGroup({
      especialista: new FormControl('')
    })
  }

  filtrarHistoriaClinica(){
  if(this.historiaClinicaEspecialista.get('especialista')?.value != ""){
    this.turnosPorEspecialista = this.turnosPorPaciente.filter((turno:any) => turno['idEspecialista'] == this.historiaClinicaEspecialista.get('especialista')?.value)
    console.log(this.turnosPorEspecialista);
  }
  else{
    this.turnosPorEspecialista = this.turnosPorPaciente;
  }

    return this.turnosPorEspecialista;
  }

  async descargarHistoriaClinica(){
    const doc = new jsPDF();

    const imageUrl = 'favicon.ico';
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const reader = new FileReader();

    reader.onload = async () => {
      const imageBase64 = reader.result as string;
      let currentY = 10;

      const tabla = document.getElementById('historia-clinica');
      if (tabla) {
        doc.addImage(imageBase64, 'PNG', 70, currentY, 50, 50);
        currentY += 60;

        const canvas = await html2canvas(tabla);
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 190;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        doc.setFontSize(18);
        doc.text(`Historia Clinica de ${this.userData['nombre']} ${this.userData['apellido']}`, 10, currentY);
        currentY += 5;
        doc.setFontSize(9);
        doc.text(`Fecha de emision: ${moment().format('DD/MM/YYYY')}`, 10, currentY);
        currentY += 15;
        doc.addImage(imgData, 'PNG', 10, currentY, imgWidth, imgHeight);
      }

      doc.save(`historia_clinica_${this.userData['nombre']}_${this.userData['apellido']}.pdf`);
    };

    reader.readAsDataURL(blob);
  }

  async obtenerTurnos(){
    const query = collection(this.firestore, "turnos");

    onSnapshot(query, async (querySnapshot) => {
      this.turnos = [];
      this.turnosCargados = false;

      const turnosPromises = querySnapshot.docs.map(async (doc) => {
      const turno = doc.data();
      const [paciente, especialista] = await Promise.all([
      await this.obtenerUsuarioPorId(turno['idPaciente']),
      await this.obtenerUsuarioPorId(turno['idEspecialista']),
      ]);
      especialista['id'] = turno['idEspecialista']
      turno['id'] = doc.id;
      turno['paciente'] = `${paciente.nombre} ${paciente.apellido}`;
      turno['especialista'] = `${especialista.nombre} ${especialista.apellido}`;
      this.especialistasPorPaciente.forEach(esp => {
        if(esp['id'] == especialista['id']){
          this.especialistaCargado = true;
        }
      });
      if(!this.especialistaCargado){
        this.especialistasPorPaciente.push(especialista)
      }
      this.especialistaCargado = false;
      return turno;
      });

      this.turnos = await Promise.all(turnosPromises);
      if(this.userData['rol'] == 'paciente'){
        this.turnosPorPaciente = this.turnos.filter((turno:any) => turno['idPaciente'] = this.auth.currentUser?.uid && turno['estado'] == 'Finalizado')
      }
      this.turnosPorEspecialista = this.turnosPorPaciente;
      this.turnosCargados = true
    });
  }

  async obtenerUsuarioPorId(id: String): Promise<any>{
    try{
      const userDocRef = doc(this.firestore, `usuarios/${id}`);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        return userDoc.data();
      } else {
        return null;
      }
    }
    catch(error){
      console.error("Error al obtener los datos de los usuarios: "+error)
    }
  }
}
