import { CommonModule, NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { addDoc, collection, doc, Firestore, getDoc, getDocs, onSnapshot } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import moment, {} from 'moment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-solicitar-turno',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './solicitar-turno.component.html',
  styleUrl: './solicitar-turno.component.scss'
})
export class SolicitarTurnoComponent {
  pacientes: any[] = []
  pacientesCargados = false
  pacienteSeleccionado: any;
  pacienteFueSeleccionado = false;
  especialistas: any[] = []
  especialistasCargados = false;
  especialistaFueSeleccionado = false;
  especialistaSeleccionado: any;
  especialidadFueSeleccionada = false;
  especialidadSeleccionada:any;
  horariosEspecialidad: any;
  horariosEspecialidadCargados: boolean = false;
  diasDisponibles: String[] = []
  diaFueSeleccionado = false;
  turnosDisponibles: String[] = []
  turnos: any[] = []
  diaSeleccionado: any;
  userData: any;

  constructor(private firestore: Firestore, private auth: Auth, private router: Router){}

  async ngOnInit(){
    const userId = this.auth.currentUser?.uid
    const userDocRef = doc(this.firestore, `usuarios/${userId}`);
    const userDoc = await getDoc(userDocRef);
    this.userData = userDoc.data();
    if(this.userData['rol'] == 'paciente'){
      this.obtenerEspecialistas()
    }else{
      this.obtenerPacientes()
    }
    this.obtenerTurnosDB()
  }

  async obtenerPacientes(){
    const query = collection(this.firestore, "usuarios");

    onSnapshot(query, (querySnapshot) => {

      querySnapshot.forEach(async (doc) => {
        const usuario = doc.data();
        if(usuario['rol']=='paciente'){
          usuario['id'] = doc.id
          this.pacientes.push(usuario);
        }
      });

      console.log(this.pacientes);
      this.pacientesCargados = true;
    });
  }
  
  async obtenerEspecialistas(){
    const query = collection(this.firestore, "usuarios");

      onSnapshot(query, (querySnapshot) => {

        querySnapshot.forEach((doc) => {
          const usuario = doc.data();
          usuario['especialidades'] = []
          if(usuario['rol']=='especialista'){
            usuario['id'] = doc.id
            this.especialistas.push(usuario);
          }
        });

        console.log(this.especialistas);
        this.especialistasCargados = true;
      });
  }

  async seleccionarPaciente(paciente:any){
    this.pacienteSeleccionado = paciente;
    await this.obtenerEspecialistas()
    this.pacienteFueSeleccionado = true;
    console.log(this.pacienteSeleccionado)
    this.especialidadFueSeleccionada = false;
    this.diaFueSeleccionado = false
    this.especialidadFueSeleccionada = false
  }


  async seleccionarEspecialista(especialista:any){
    this.especialistaSeleccionado = especialista;
    await this.obtenerEspecialidadesConHorarios(especialista)
    this.especialistaFueSeleccionado = true;
    console.log(this.especialistaSeleccionado)
    this.especialidadFueSeleccionada = false;
    this.diaFueSeleccionado = false
  }

  async seleccionarEspecialidad(especialidad:any){
    this.horariosEspecialidadCargados = false
    this.especialidadFueSeleccionada = true;
    this.especialidadSeleccionada = especialidad;
    this.diasDisponibles = [];
    console.log(this.especialidadSeleccionada)
    this.obtenerDiasDisponibles();
    this.diaFueSeleccionado = false
  }

  mostrarImagenEspecialidad(especialidad: String){
    let imagen;
    switch(especialidad){
      case "Pediatria":
        imagen = '/assets/images/pediatria.jpg'
      break;
      case "Cardiologia":
        imagen = '/assets/images/cardiologia.jpg'
      break;
      case "Odontología":
        imagen = '/assets/images/odontologia.jpg'
      break;
      default:
        imagen = '/assets/images/por-defecto.jpg'
      break;
    }

    return imagen
  }

  async obtenerEspecialidadesConHorarios(especialista: any){
    const query = collection(this.firestore, "horariosAtencion");
    this.especialistaSeleccionado['especialidades'] = []

    try {
      const querySnapshot = await getDocs(query);
      querySnapshot.forEach((doc) => {
        const horario = doc.data();
        if (especialista['id'] == horario['especialistaId'] && horario['horarios'].length != 0) {
          this.especialistaSeleccionado['especialidades'].push(horario['especialidad'])
        }
      });
    } catch (error) {
      console.error("Error al obtener los horarios:", error);
    }
  }

  obtenerTurnos(dia: String){
    this.turnosDisponibles = []
    this.diaSeleccionado = dia
    this.listarTurnosPorDia(dia)
    this.diaFueSeleccionado = true;
  }

  formatearFecha(fecha: Date) {
    const dia = String(fecha.getDate()).padStart(2, '0'); 
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    return `${dia}-${mes}-${anio}`;
  }

  obtenerDiasEspecificos(proximosDias: number, diasSemana: Number[]) {
    const hoy = new Date() ;
  
    for (let i = 1; i < proximosDias; i++) {
      const dia = new Date(hoy);
      dia.setDate((hoy.getDate()+1) + i);
      const diaSemana = dia.getDay(); 
      if (diasSemana.includes(diaSemana)) {
        this.diasDisponibles.push(this.formatearFecha(dia));
      }
    }
  }

  pasarDiasSemanaANumero(dias: String[]): Number[]{
    const diasConvertidos: Number[] = []
    dias.forEach(dia => {
      switch(dia){
        case 'lunes':
          diasConvertidos.push(1)
        break;
        case 'martes':
          diasConvertidos.push(2)
        break;
        case 'miercoles':
          diasConvertidos.push(3)
        break;
        case 'jueves':
          diasConvertidos.push(4)
        break;
        case 'viernes':
          diasConvertidos.push(5)
        break;
        default:
          diasConvertidos.push(6)
        break;
      }
    });
    return diasConvertidos;
  }

  async obtenerHorarios(){
    const query = collection(this.firestore, "horariosAtencion");

    try {
      const querySnapshot = await getDocs(query);
      querySnapshot.forEach((doc) => {
        const horario = doc.data();
        if (
          this.especialistaSeleccionado['id'] == horario['especialistaId'] &&
          horario['especialidad'] == this.especialidadSeleccionada) {
          horario['id'] = doc.id;
          this.horariosEspecialidad = horario;
        }
      });
  
      console.log(this.horariosEspecialidad);
      this.horariosEspecialidadCargados = true;
    } catch (error) {
      console.error("Error al obtener los horarios:", error);
    }
  }

  async obtenerDiasDisponibles(){
    const dias: String[] = [];
    let diasNumerados: Number[] = []
    try{
      await this.obtenerHorarios();
      this.horariosEspecialidad.horarios.forEach((dia: any) => {
        dias.push(dia.diaAtencion);
      });
      console.log(dias);
      diasNumerados = this.pasarDiasSemanaANumero(dias);
      console.log(diasNumerados);
      this.obtenerDiasEspecificos(15,diasNumerados);
      console.log(this.diasDisponibles);
    }
    catch (error) {
      console.error("Error al obtener los días disponibles:", error);
    }
  }

  obtenerDiasDeSemana(fecha: String): String {
    const diasSemana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  
    const [dia, mes, anio] = fecha.split('-').map(Number);
    const fechaObj = new Date(anio, mes - 1, dia);
    const diaSemana = diasSemana[fechaObj.getDay()-1];

    return diaSemana;
  }

  listarTurnosPorDia(dia: String){
    const horarioEspecialidad = this.horariosEspecialidad
    const diaSemana = this.obtenerDiasDeSemana(dia);
    console.log(diaSemana)

    horarioEspecialidad['horarios'].forEach((horario: any) => {
      if(horario['diaAtencion'] == diaSemana){
        this.generarTurnos(horario['inicio'], horario['fin'], horarioEspecialidad['minutosTurno'])
      }
    });
  }

  generarTurnos(horaInicio: number,horaFin: number,intervalo: number){

    const horaInicioMoment = moment({hour:horaInicio,minute:0})
    const horaFinMoment = moment({hour:horaFin,minute:0})
    const turnosDia = []

    let horario = horaInicioMoment

    while(horario.format('HH:mm') != horaFinMoment.format('HH:mm')){
      let turnoDisponible = true
      let horarioFormateado = horario.format('HH:mm');
      this.turnos.forEach(turno => {
        if(turno['idEspecialista'] == this.especialistaSeleccionado['id'] && turno['fecha'] == this.diaSeleccionado && turno['hora'] == horarioFormateado && (turno['estado'] == 'Aceptado' || turno['estado'] == 'Finalizado' || turno['estado'] == 'Solicitado')){
          turnoDisponible = false;
        }
      });
      if(turnoDisponible){
        turnosDia.push(horarioFormateado);
      }
      horario = horario.clone().add(intervalo, 'minutes');
    }

    console.log(turnosDia)
    this.turnosDisponibles = turnosDia

  }

  async cargarTurno(turno: any){
    let idPaciente :String;

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

    if(this.userData['rol'] == 'administrador'){
      idPaciente = this.pacienteSeleccionado['id']
    }
    else{
      idPaciente = this.auth.currentUser?.uid as String
    }

    const turnoData = {
      hora: turno,
      fecha: this.diaSeleccionado,
      especialidad: this.especialidadSeleccionada,
      idPaciente: idPaciente,
      idEspecialista: this.especialistaSeleccionado['id'],
      estado: 'Solicitado'
    }

    const turnoDocRef = collection(this.firestore, `turnos`);
    await addDoc(turnoDocRef, turnoData);
    Swal.fire({
      title: `El turno fue solicitado con exito`,
      background: '#fff',
      color: '#000',
      confirmButtonColor: '#ff5722'
    })
    this.router.navigate(['/home'])
  }

  async obtenerTurnosDB(){
    const query = collection(this.firestore, "turnos");

    try {
      const querySnapshot = await getDocs(query);
      querySnapshot.forEach((doc) => {
        const turno = doc.data();
        this.turnos.push(turno)
      });
      console.log(this.turnos);
    } catch (error) {
      console.error("Error al obtener los horarios:", error);
    }
  }
}
