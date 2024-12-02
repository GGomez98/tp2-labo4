import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, Pipe, ViewChild } from '@angular/core';
import { Auth, user } from '@angular/fire/auth';
import { collection, doc, Firestore, getDoc, onSnapshot, setDoc } from '@angular/fire/firestore';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import bootstrap, { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { RangePipe } from '../../../pipes/range.pipe';
import { TimeFormatPipe } from '../../../pipes/time-format.pipe';
import { CambiarColorCeldaDirective } from '../../../directives/cambiar-color-celda.directive';

@Component({
  selector: 'app-listado-turnos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TimeFormatPipe, CambiarColorCeldaDirective],
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
  historiaClinica!: FormGroup
  datosDinamicosForm!: FormGroup
  puntajeEnviado = false;
  puntajeVacio = true;
  valoresAdicionales: number = 0;
  historiaClinicaEnviada = false;

  constructor(private firestore: Firestore, private modalService: NgbModal, private auth: Auth, private fb: FormBuilder){
    this.encuesta = this.fb.group({
      puntaje: ''
    });
    this.historiaClinica = new FormGroup({
      altura: new FormControl("",[Validators.required,Validators.min(50),Validators.max(300)]),
      peso: new FormControl("",[Validators.required,Validators.min(5),Validators.max(300)]),
      temperatura: new FormControl("",[Validators.required,Validators.min(30),Validators.max(45)]),
      presion: new FormControl("",[Validators.required,Validators.min(60),Validators.max(150)]),
      datosDinamicos: new FormArray([])
    })
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
      this.turnosFiltrados = this.turnos.filter((turno:any) => this.filtros['especialidades'].includes(turno['especialidad'])&&this.filtros['especialistas'].includes(turno['idEspecialista']))
    }
    else{
      this.turnosFiltrados = this.turnos.filter((turno:any) => this.filtros['especialidades'].includes(turno['especialidad'])&&this.filtros['pacientes'].includes(turno['idPaciente']))
    }

    if(this.filtros['campo'].toLowerCase() == 'fecha' ||this.filtros['campo'].toLowerCase() == 'paciente'||this.filtros['campo'].toLowerCase() == 'especialista'||this.filtros['campo'].toLowerCase() == 'especialidad'||this.filtros['campo'].toLowerCase() == 'estado'){
      this.turnosFiltrados = this.turnosFiltrados.filter((turno:any) => new RegExp(`^${this.filtros['valor']}`, 'i').test(turno[this.filtros['campo'].toLowerCase()]))
    }
    else if(this.filtros['campo'].toLowerCase() == 'altura' ||this.filtros['campo'].toLowerCase() == 'peso'||this.filtros['campo'].toLowerCase() == 'presion'||this.filtros['campo'].toLowerCase() == 'temperatura'){
      this.turnosFiltrados = this.turnosFiltrados.filter((turno:any) =>turno['historiaClinica'] != undefined && turno['historiaClinica'][this.filtros['campo'].toLowerCase()] == this.filtros['valor'])
    }
    else if(this.filtros['campo'] != '' && this.filtros['valor'] != ''){
      this.turnosFiltrados = this.turnosFiltrados.filter((turno:any) =>turno['historiaClinica'] != undefined && turno['historiaClinica']['datosDinamicos'] != undefined && turno['historiaClinica']['datosDinamicos'][this.filtros['campo'].toLowerCase()] != undefined && turno['historiaClinica']['datosDinamicos'][this.filtros['campo'].toLowerCase()] == this.filtros['valor'])
    }
  }

  agregarDatosDinamicos(){
    const nuevoCampo = new FormGroup({
      clave: new FormControl("" ,[Validators.required]),
      valor: new FormControl("" ,[Validators.required]), 
    });
    this.datosDinamicos.push(nuevoCampo);
    console.log(this.guardarDatosDinamicos())
  }

  eliminarDatosDinamicos(index: number){
    this.datosDinamicos.removeAt(index);
  }

  guardarDatosDinamicos() {
    const datosDinamicosArray = this.datosDinamicos.value; // Obtiene el array de pares clave-valor
      const datosComoObjeto = datosDinamicosArray.reduce((obj: any, item: any) => {
        if (item.clave) {
          obj[item.clave.toLowerCase()] = item.valor; // Agrega la clave y valor al objeto
        }
        return obj;
      }, {});
  
      console.log('Objeto generado:', datosComoObjeto);

      return datosComoObjeto;
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
    this.modalService.open(content);
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
    let turnoData;
    if(turno.resenia != undefined){
      turnoData={
        especialidad: turno.especialidad,
        estado: turno.estado,
        fecha: turno.fecha,
        hora: turno.hora,
        idEspecialista: turno.idEspecialista,
        idPaciente: turno.idPaciente,
        calificacionAtencion: comentario.trim(),
        resenia: turno.resenia
      }
    }
    else{
      turnoData={
        especialidad: turno.especialidad,
        estado: turno.estado,
        fecha: turno.fecha,
        hora: turno.hora,
        idEspecialista: turno.idEspecialista,
        idPaciente: turno.idPaciente,
        calificacionAtencion: comentario.trim()
      }
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
    let turnoData;
    if(turno.resenia != undefined){
      turnoData={
        especialidad: turno.especialidad,
        estado: turno.estado,
        fecha: turno.fecha,
        hora: turno.hora,
        idEspecialista: turno.idEspecialista,
        idPaciente: turno.idPaciente,
        puntajeEncuesta: puntaje,
        resenia: turno.resenia
      }
    }
    else{
      turnoData={
        especialidad: turno.especialidad,
        estado: turno.estado,
        fecha: turno.fecha,
        hora: turno.hora,
        idEspecialista: turno.idEspecialista,
        idPaciente: turno.idPaciente,
        puntajeEncuesta: puntaje
      }
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
    this.historiaClinicaEnviada = true
    if(this.historiaClinica.valid){
      let turnoData;
      let historiaClinica;
      let datosDinamicos = this.guardarDatosDinamicos();

      historiaClinica={
        altura: this.historiaClinica.get('altura')?.value,
        peso: this.historiaClinica.get('peso')?.value,
        temperatura: this.historiaClinica.get('temperatura')?.value,
        presion: this.historiaClinica.get('presion')?.value,
        datosDinamicos: datosDinamicos
      }

      if(resenia == ''){
        turnoData={
          especialidad: turno.especialidad,
          estado: 'Finalizado',
          fecha: turno.fecha,
          hora: turno.hora,
          idEspecialista: turno.idEspecialista,
          idPaciente: turno.idPaciente,
          historiaClinica: historiaClinica
        }
      }
      else{
        turnoData={
          especialidad: turno.especialidad,
          estado: 'Finalizado',
          fecha: turno.fecha,
          hora: turno.hora,
          idEspecialista: turno.idEspecialista,
          idPaciente: turno.idPaciente,
          resenia: resenia,
          historiaClinica: historiaClinica
        }
      }

      console.log(this.datosDinamicos);
      
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
        this.historiaClinicaEnviada = false;
        modal.close()
      }
      catch(error){
        console.error("Error al obtener los datos de los usuarios: "+error)
      }
    }
  }

  get puntaje(){
    return this.encuesta.get('puntaje')
  }

  get datosDinamicos(): FormArray {
    return this.historiaClinica.get('datosDinamicos') as FormArray;
  }
}
