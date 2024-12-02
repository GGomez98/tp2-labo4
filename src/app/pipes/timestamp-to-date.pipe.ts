import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';


@Pipe({
  name: 'timestampToDate',
  standalone: true,
})
export class TimestampToDatePipe implements PipeTransform {

  constructor() {}

  transform(timestamp: { seconds: number, nanoseconds: number }, format: string = 'mediumDate'): string | null {
    // Convertir el Timestamp (segundos y nanosegundos) a milisegundos
    const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
    
    if(format == 'HH:mm'){
      const horas = date.getHours()
      const minutos = date.getMinutes()
      return `${this.pad(horas)}:${this.pad(minutos)}`
    }
    else if(format == 'dd-mm-yyyy'){
      const dia = date.getDate()
      const mes = date.getMonth()
      const anio = date.getFullYear()
      return `${this.pad(dia)}-${this.pad(mes)}-${anio}`
    }
    else{
      return null;
    }
  }

  private pad(num: number): string {
    return num.toString().padStart(2, '0');
  }
}

