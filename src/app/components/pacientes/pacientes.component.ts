import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { collection, doc, Firestore, getDoc, onSnapshot } from '@angular/fire/firestore';
import { TimeFormatPipe } from "../../pipes/time-format.pipe";
import { KeyValueListPipe } from "../../pipes/key-value-list.pipe";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [CommonModule, TimeFormatPipe, KeyValueListPipe],
  templateUrl: './pacientes.component.html',
  styleUrl: './pacientes.component.scss'
})
export class PacientesComponent {
pacientesCargados = false;
pacientes: any[] = []
pacienteCargado = false
turnos: any[] = []
turnosPorPaciente: any[] = []
turnosPorPacienteCargados = true;

  constructor(private auth: Auth, private firestore: Firestore, private modalService: NgbModal){}

  ngOnInit(){
    this.obtenerPacientesAtendidos();
  }

  async obtenerPacientesAtendidos(){
    const query = collection(this.firestore, "turnos");
    
      return new Promise<void>((resolve) => {
        onSnapshot(query, async (querySnapshot) => {
          this.pacientes = [];
    
          querySnapshot.docs.map(async (doc) => {
            const turno = doc.data();
            const [paciente, especialista] = await Promise.all([
              await this.obtenerUsuarioPorId(turno["idPaciente"]),
              await this.obtenerUsuarioPorId(turno["idEspecialista"]),
            ]);
            paciente["id"] = turno["idPaciente"];
            turno["id"] = doc.id;
            turno["paciente"] = `${paciente.nombre} ${paciente.apellido}`;
            turno["especialista"] = `${especialista.nombre} ${especialista.apellido}`;
            if(turno['estado'] == 'Finalizado' && turno["idEspecialista"] == this.auth.currentUser?.uid){
              this.pacientes.forEach(pac => {
                if(pac['id'] == paciente['id']){
                  this.pacienteCargado = true;
                }
              });
              if(!this.pacienteCargado){
                this.pacientes.push(paciente)
              }
              this.pacienteCargado = false;
            }
            return turno;
          });

          console.log(this.pacientes);
          this.pacientesCargados = true
          resolve(); 
        });
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

  seleccionarPaciente(id: String){
    console.log(id);
    this.turnosPorPacienteCargados = false;
    console.log(this.turnosPorPacienteCargados)
    const query = collection(this.firestore, "turnos");
    
      return new Promise<void>((resolve) => {
        onSnapshot(query, async (querySnapshot) => {
          this.turnosPorPaciente = [];
    
          querySnapshot.docs.map(async (doc) => {
            const turno = doc.data();
            const [paciente, especialista] = await Promise.all([
              await this.obtenerUsuarioPorId(turno["idPaciente"]),
              await this.obtenerUsuarioPorId(turno["idEspecialista"]),
            ]);
            turno["id"] = doc.id;
            turno["paciente"] = `${paciente.nombre} ${paciente.apellido}`;
            turno["especialista"] = `${especialista.nombre} ${especialista.apellido}`;
            if(turno['estado'] == 'Finalizado' && turno["idEspecialista"] == this.auth.currentUser?.uid && turno['idPaciente'] == id){
              this.turnosPorPaciente.push(turno)
            }
            return turno;
          });
          setTimeout(() => {
            this.turnosPorPacienteCargados = true
          }, 1000);
          console.log(this.turnosPorPacienteCargados)
          resolve()
        });
      });
  }

  abrirModal(content: any) {
    this.modalService.open(content);
  }
}
