import { Component } from '@angular/core';
import { FiltroComponent } from "./filtro/filtro.component";
import { ListadoTurnosComponent } from "./listado-turnos/listado-turnos.component";

@Component({
  selector: 'app-mis-turnos',
  standalone: true,
  imports: [FiltroComponent, ListadoTurnosComponent],
  templateUrl: './mis-turnos.component.html',
  styleUrl: './mis-turnos.component.scss'
})
export class MisTurnosComponent {
  filtros: any;

  actualizarFiltros(filtros: any){
    this.filtros = filtros;
  }
}
