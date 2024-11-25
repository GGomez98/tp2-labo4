import { CommonModule } from '@angular/common';
import { Component, Input, Pipe } from '@angular/core';
import { Auth, user } from '@angular/fire/auth';
import { collection, doc, Firestore, getDoc, onSnapshot, setDoc } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import bootstrap, { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { RangePipe } from '../../../pipes/range.pipe';

@Component({
  selector: 'app-listado-turnos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
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
  motivoRechazoEnviado: boolean = false;
  motivoRechazoVacio: boolean = true;
  calificacionEnviada: boolean = false;
  calificacionAtencionVacia: boolean = true
  userData: any;
  encuesta!: FormGroup
  puntajeEnviado = false;
  puntajeVacio = true;

  constructor(private firestore: Firestore, private modalService: NgbModal, private auth: Auth, private fb: FormBuilder){
    this.encuesta = this.fb.group({
      puntaje: ''
    });
  }

  async ngOnInit(){
    this.obtenerTurnos()
    const userId = this.auth.currentUser?.uid
    const userDocRef = doc(this.firestore, `usuarios/${userId}`);
    const userDoc = await getDoc(userDocRef);
    this.userData = userDoc.data();
  }

  async ngOnChanges(){
    console.log(this.filtros);
    if(this.userData['rol'] == 'paciente'){
      this.turnosFiltrados = this.turnos.filter((turno:any) => this.filtros['especialidades'].includes(turno['especialidad'])||this.filtros['especialistas'].includes(turno['idEspecialista']))
    }
    else{
      this.turnosFiltrados = this.turnos.filter((turno:any) => this.filtros['especialidades'].includes(turno['especialidad'])||this.filtros['pacientes'].includes(turno['idPaciente']))
    }
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
      this.turnos = this.turnos.filter((turno:any) => this.userData['rol']=='paciente' && turno['idPaciente'] == this.auth.currentUser?.uid || this.userData['rol']=='especialista' && turno['idEspecialista'] == this.auth.currentUser?.uid);
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

  async rechazarTurno(turno: any, motivo: String, modal:any){
    this.motivoRechazoEnviado = true;
    const turnoData={
      especialidad: turno.especialidad,
      estado: 'Rechazado',
      fecha: turno.fecha,
      hora: turno.hora,
      idEspecialista: turno.idEspecialista,
      idPaciente: turno.idPaciente,
      motivoRechazo: motivo.trim()
    }
    if(motivo != ''){
      this.motivoRechazoVacio = false;
    }
    if(!this.motivoRechazoVacio){

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
          title: `El turno fue rechazado`,
          background: '#fff',
          color: '#000',
          confirmButtonColor: '#ff5722'
        })
        this.motivoRechazoEnviado = false;
        modal.close()
      }
      catch(error){
        console.error("Error al obtener los datos de los usuarios: "+error)
      }
    }
  }

  async calificarAtencion(turno: any, comentario: String, modal:any){
    this.calificacionEnviada = true;
    const turnoData={
      especialidad: turno.especialidad,
      estado: turno.estado,
      fecha: turno.fecha,
      hora: turno.hora,
      idEspecialista: turno.idEspecialista,
      idPaciente: turno.idPaciente,
      calificacionAtencion: comentario.trim()
    }
    if(comentario != ''){
      this.calificacionAtencionVacia = false;
    }
    if(!this.calificacionAtencionVacia){

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
          title: `La calificacion fue enviada`,
          background: '#fff',
          color: '#000',
          confirmButtonColor: '#ff5722'
        })
        this.calificacionEnviada = false;
        modal.close()
      }
      catch(error){
        console.error("Error al obtener los datos de los usuarios: "+error)
      }
    }
  }

  async enviarEncuesta(turno: any, puntaje: String, modal:any){
    this.puntajeEnviado = true;
    const turnoData={
      especialidad: turno.especialidad,
      estado: turno.estado,
      fecha: turno.fecha,
      hora: turno.hora,
      idEspecialista: turno.idEspecialista,
      idPaciente: turno.idPaciente,
      puntajeEncuesta: puntaje
    }
    if(puntaje != ''){
      this.puntajeVacio = false;
    }
    if(!this.puntajeVacio){

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
          title: `La encuesta fue enviada`,
          background: '#fff',
          color: '#000',
          confirmButtonColor: '#ff5722'
        })
        this.puntajeEnviado = false;
        modal.close()
      }
      catch(error){
        console.error("Error al obtener los datos de los usuarios: "+error)
      }
    }
  }

  async aceptarTurno(turno: any){
    this.motivoRechazoEnviado = true;
    const turnoData={
      especialidad: turno.especialidad,
      estado: 'Aceptado',
      fecha: turno.fecha,
      hora: turno.hora,
      idEspecialista: turno.idEspecialista,
      idPaciente: turno.idPaciente
    }
    
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
        title: `El turno fue Aceptado`,
        background: '#fff',
        color: '#000',
        confirmButtonColor: '#ff5722'
      })
      this.motivoRechazoEnviado = false;
    }
    catch(error){
      console.error("Error al obtener los datos de los usuarios: "+error)
    }
  }

  async finalizarTurno(turno: any, resenia: string, modal: any){
    this.motivoRechazoEnviado = true;
    const turnoData={
      especialidad: turno.especialidad,
      estado: 'Finalizado',
      fecha: turno.fecha,
      hora: turno.hora,
      idEspecialista: turno.idEspecialista,
      idPaciente: turno.idPaciente,
      resenia: resenia
    }
    
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
        title: `El turno fue Finalizado`,
        background: '#fff',
        color: '#000',
        confirmButtonColor: '#ff5722'
      })
      this.motivoRechazoEnviado = false;
      modal.close()
    }
    catch(error){
      console.error("Error al obtener los datos de los usuarios: "+error)
    }
  }

  get puntaje(){
    return this.encuesta.get('puntaje')
  }
}
