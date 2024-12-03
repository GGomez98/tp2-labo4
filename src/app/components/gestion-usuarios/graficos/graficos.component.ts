import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { collection, doc, Firestore, getDoc, limit, onSnapshot, orderBy, query } from '@angular/fire/firestore';
import { TimestampToDatePipe } from '../../../pipes/timestamp-to-date.pipe';
import moment from 'moment';
import { ChartistModule } from "ng-chartist";
import { Chart, ChartTypeRegistry, registerables } from 'chart.js';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
Chart.register(...registerables);



@Component({
  selector: 'app-graficos',
  standalone: true,
  imports: [CommonModule, TimestampToDatePipe, ChartistModule, ReactiveFormsModule],
  templateUrl: './graficos.component.html',
  styleUrl: './graficos.component.scss'
})
export class GraficosComponent {
  @ViewChild('graficoUno') graficoUno!: ElementRef;
  @ViewChild('graficoDos') graficoDos!: ElementRef;
  @ViewChild('graficoTres') graficoTres!: ElementRef;
  @ViewChild('graficoCuatro') graficoCuatro!: ElementRef;
  logins: any[] = []
  loginsCargados = false;
  turnos: any[] = []
  turnosPorEspecialidad: any[] = []
  turnosPorFecha: any[] = []
  turnosCargados = false;
  turnosPorEstadoYFecha: any[] = []
  especialistas: any[] = []
  especialistasCargados = false;
  listaSeleccionada = 'logins'
  fechas!: FormGroup;
  labels: string[] = []
  valores: number[] = []
  graficoActual!: Chart;
  usuarioSeleccionado: String = '';

  constructor(private firestore: Firestore){}

  ngOnInit(){
    this.obtenerLogins()
    this.obtenerTurnos()
    this.obtenerEspecialistas()
  }

  async obtenerLogins(){
    const queryRef = query(
      collection(this.firestore, "logins"),
      orderBy("fecha", "desc"),
      limit(100)
    );

      onSnapshot(queryRef, (querySnapshot) => {
        this.logins = [];

        // Recorrer los documentos en el snapshot
        querySnapshot.forEach((doc) => {
          const login = doc.data();
          this.logins.push(login);
        });

        this.loginsCargados = true;
      });
  }

  async obtenerTurnos(){
    const queryRef = query(
      collection(this.firestore, "turnos")
    );

      onSnapshot(queryRef, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const turno = doc.data();
          this.turnos.push(turno);
        });

        this.turnosCargados = true;
        this.agruparTurnos('especialidad', this.turnosPorEspecialidad)
        this.agruparTurnos('fecha', this.turnosPorFecha)
      });
  }

  async obtenerEspecialistas(){
    const queryRef = query(
      collection(this.firestore, "usuarios")
    );

      onSnapshot(queryRef, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const usuario = doc.data();
          usuario['id'] = doc.id
          if(usuario['rol'] == 'especialista'){
            this.especialistas.push(usuario);
          }
        });

        this.especialistasCargados = true;
        console.log(this.especialistas);
      });
  }

  agruparTurnos(clave: string, lista: any[]){
    this.turnos.forEach(turno => {
      lista.forEach(turnoEsp => {
        if(turno[clave] == turnoEsp[clave]){
          turnoEsp['cantidadTurnos']++
        }
      });
      if(!lista.find((turnoEsp) => turnoEsp[clave] === turno[clave])){
        lista.push({[clave]:turno[clave],cantidadTurnos:1})
      }
    });

    console.log(lista)
  }

  async obtenerUsuarioPorId(id: String): Promise<any>{
    try{
      const userDocRef = doc(this.firestore, `usuarios/${id}`);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        this.usuarioSeleccionado = `${userDoc.data()['nombre']} ${userDoc.data()['apellido']}`
        return userDoc.data();
      } else {
        return null;
      }
    }
    catch(error){
      console.error("Error al obtener los datos de los usuarios: "+error)
    }
  }

  agruparTurnosPorEstadoYFecha(fechaInicio:string,fechaFin:string, medicoId: string){
    this.obtenerUsuarioPorId(medicoId);
    this.turnosPorEstadoYFecha = [{estado:'Solicitado', cantidad: 0},{estado:'Finalizado', cantidad: 0}]
    const momentFechaInicio = moment(fechaInicio, 'YYYY-MM-DD');
    const momentFechaFin = moment(fechaFin, 'YYYY-MM-DD');
    this.turnos.forEach(turno => {
      const momentTurnoFecha = moment(turno['fecha'], 'DD-MM-YYYY');
      if(momentTurnoFecha.isBefore(momentFechaFin) && momentTurnoFecha.isAfter(momentFechaInicio)){
        if(turno['estado'] == 'Solicitado' && turno['idEspecialista'] == medicoId){
          this.turnosPorEstadoYFecha[0].cantidad++;
        }
        else if(turno['estado'] == 'Finalizado' && turno['idEspecialista'] == medicoId){
          this.turnosPorEstadoYFecha[1].cantidad++;
        }
      }
    })
    console.log(this.turnosPorEstadoYFecha)
    if(this.graficoActual){
      this.graficoActual.destroy()
    }
    this.conseguirCantidades(this.turnosPorEstadoYFecha, "estado", "cantidad", "chart-turno-estado-fecha", "bar", "Turnos")
  }

  seleccionarLista(lista: string){
    this.listaSeleccionada = lista
    setTimeout(() => {
      switch(lista){
        case 'turnos por dia':
          this.graficoUno.nativeElement.classList.remove('active')
          this.graficoDos.nativeElement.classList.add('active')
          this.graficoTres.nativeElement.classList.remove('active')
          this.graficoCuatro.nativeElement.classList.remove('active')
          this.conseguirCantidades(this.turnosPorFecha, "fecha", "cantidadTurnos", "chart-turno-fecha", "line", "Turnos")
        break;
        case 'turnos por especialidad':
          this.graficoUno.nativeElement.classList.remove('active')
          this.graficoDos.nativeElement.classList.remove('active')
          this.graficoTres.nativeElement.classList.add('active')
          this.graficoCuatro.nativeElement.classList.remove('active')
          this.conseguirCantidades(this.turnosPorEspecialidad, "especialidad", "cantidadTurnos", "chart-turno-especialidad", "bar", "Turnos")
        break;
        case 'turnos por estado y fecha':
          this.graficoUno.nativeElement.classList.remove('active')
          this.graficoDos.nativeElement.classList.remove('active')
          this.graficoTres.nativeElement.classList.remove('active')
          this.graficoCuatro.nativeElement.classList.add('active')
          this.fechas = new FormGroup({
            fechaInicio: new FormControl(moment().format('YYYY-MM-DD')),
            fechaFin: new FormControl(moment().add(30,'days').format('YYYY-MM-DD')),
            especialista: new FormControl("A0mfBAZnOmMdbrflcXnD2y5V7vh1")
          });
          setTimeout(() => {
            this.agruparTurnosPorEstadoYFecha(this.fechas.get('fechaInicio')?.value,this.fechas.get('fechaFin')?.value, this.fechas.get('especialista')?.value)
          }, 100);
        break;
        default:
          this.graficoUno.nativeElement.classList.add('active')
          this.graficoDos.nativeElement.classList.remove('active')
          this.graficoTres.nativeElement.classList.remove('active')
          this.graficoCuatro.nativeElement.classList.remove('active')
        break;
      }
    }, 200);
  }

  conseguirCantidades(lista: any, label:string, valor: string, idChart:string, tipoChart: keyof ChartTypeRegistry, labelChart:string) {
    this.labels = []
    this.valores = []
    if (lista !== null) {
      lista .map((o: any) => {
        this.labels.push(o[label]);
        this.valores.push(o[valor]);
      })
    }
    this.cargarDatos(this.labels, this.valores, idChart, tipoChart, labelChart);

  }


  cargarDatos(labelData: any, valuedata: any, idChart:string, tipoChart: keyof ChartTypeRegistry, label:string) {
    this.graficoActual = new Chart(idChart, {
      type: tipoChart,
      data: {
        labels: labelData,
        datasets: [
          {
            label: label,
            data: valuedata,
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
            borderColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
            borderWidth: 1
          }
        ]
      },
      options: {
        scales: {
          y: {
              beginAtZero: true
          }
        }
      }
    })
  }

async descargar(id: string, titulo: string){
    const doc = new jsPDF();

    const grafico = document.getElementById(id);
      if (grafico) {
        const canvas = await html2canvas(grafico);
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 190;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        doc.addImage(imgData, 'PNG', 10, 50, imgWidth, imgHeight);
        doc.setFontSize(18);
        doc.text(`${titulo}`, 10, 10);
        doc.save(`${id}.pdf`);
      }
  }
}
