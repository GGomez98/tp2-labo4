import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { collection, Firestore, getDocs, onSnapshot } from '@angular/fire/firestore';

@Component({
  selector: 'app-solicitar-turno',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './solicitar-turno.component.html',
  styleUrl: './solicitar-turno.component.scss'
})
export class SolicitarTurnoComponent {
  especialistas: any[] = []
  especialistasCargados = false;
  especialistaFueSeleccionado = false;
  especialistaSeleccionado: any;
  especialidadFueSeleccionada = false;
  especialidadSeleccionada:any;
  horariosEspecialidad: any;
  horariosEspecialidadCargados: boolean = false;
  diasDisponibles: String[] = []

  constructor(private firestore: Firestore){}

  ngOnInit(){
    this.obtenerEspecialistas()
  }
  
  async obtenerEspecialistas(){
    const query = collection(this.firestore, "usuarios");

      onSnapshot(query, (querySnapshot) => {

        querySnapshot.forEach(async (doc) => {
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

  async seleccionarEspecialista(especialista:any){
    this.especialistaSeleccionado = especialista;
    await this.obtenerEspecialidadesConHorarios(especialista)
    this.especialistaFueSeleccionado = true;
    console.log(this.especialistaSeleccionado)
    this.especialidadFueSeleccionada = false;
  }

  async seleccionarEspecialidad(especialidad:any){
    this.horariosEspecialidadCargados = false
    this.especialidadFueSeleccionada = true;
    this.especialidadSeleccionada = especialidad;
    this.diasDisponibles = [];
    console.log(this.especialidadSeleccionada)
    this.obtenerDiasDisponibles();
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

  obtenerDiasConSemana(fechas: String[]): any[] {
    const diasSemana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  
    return fechas.map(fecha => {
      const [dia, mes, anio] = fecha.split('-').map(Number);
      const fechaObj = new Date(anio, mes - 1, dia);
      const diaSemana = diasSemana[fechaObj.getDay()];
      return {"diaSemana":diaSemana,"fecha":fecha};
    });
  }

  listarTurnosPorDia(){}
}
