import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { collection, doc, Firestore, getDoc, onSnapshot, setDoc } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import bootstrap, { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { TimeFormatPipe } from '../../../pipes/time-format.pipe';
import { CambiarColorCeldaDirective } from '../../../directives/cambiar-color-celda.directive';

@Component({
  selector: 'app-listado-turnos',
  standalone: true,
  imports: [CommonModule, FormsModule, TimeFormatPipe, CambiarColorCeldaDirective],
  templateUrl: './listado-turnos.component.html',
  styleUrl: './listado-turnos.component.scss'
})
export class ListadoTurnosComponent {
  @Input() filtros: any = null
  turnosCargados = false;
  turnos: any[] = []
  turnosFiltrados: any[] = []
  motivoCancelacionVacio: boolean = true;
  motivoCancelacionEnviado: boolean = false;

  constructor(private firestore: Firestore, private modalService: NgbModal){}

  ngOnInit(){
    this.obtenerTurnos()
  }

  ngOnChanges(){
    console.log(this.filtros);
    this.turnosFiltrados = this.turnos.filter((turno:any) => this.filtros['especialidades'].includes(turno['especialidad'])||this.filtros['especialistas'].includes(turno['idEspecialista']))
  }

  async obtenerTurnos(){
    const query = collection(this.firestore, "turnos");

    onSnapshot(query, async (querySnapshot) => {
      this.turnos = [];
      this.turnosCargados = false;

      const turnosPromises = querySnapshot.docs.map(async (doc) => {
      const turno = doc.data();
      const [paciente, especialista] = await Promise.all([
      this.obtenerUsuarioPorId(turno['idPaciente']),
      this.obtenerUsuarioPorId(turno['idEspecialista']),
      ]);

      turno['id'] = doc.id;
      turno['paciente'] = `${paciente.nombre} ${paciente.apellido}`;
      turno['especialista'] = `${especialista.nombre} ${especialista.apellido}`;
      return turno;
      });

      this.turnos = await Promise.all(turnosPromises);
    
      console.log(this.turnos);
      this.turnosFiltrados = this.turnos;
      this.turnosCargados = true;
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

  abrirModal(content: any) {
    this.modalService.open(content); // Abre el modal con el template #content
  }

  async cancelarTurno(turno: any, motivo: String, modal:any){
    this.motivoCancelacionEnviado = true;
    const turnoData={
      especialidad: turno.especialidad,
      estado: 'Cancelado',
      fecha: turno.fecha,
      hora: turno.hora,
      idEspecialista: turno.idEspecialista,
      idPaciente: turno.idPaciente,
      motivoCancelacion: motivo.trim()
    }
    if(motivo != ''){
      this.motivoCancelacionVacio = false;
    }
    if(!this.motivoCancelacionVacio){

      Swal.fire({
        title: 'Cargando...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        background: '#fff',
        color: '#000',
        didOpen: () => {
          Swal.showLoading();
        }
      });
      try{
        const turnoDocRef = doc(this.firestore, `turnos/${turno.id}`);
        await setDoc(turnoDocRef, turnoData);
        Swal.fire({
          title: `El turno fue cancelado`,
          background: '#fff',
          color: '#000',
          confirmButtonColor: '#ff5722'
        })
        this.motivoCancelacionEnviado = false;
        modal.close()
      }
      catch(error){
        console.error("Error al obtener los datos de los usuarios: "+error)
      }
    }
  }
}
