import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FiltroComponent } from "./filtro/filtro.component";
import { ListadoTurnosComponent } from "./listado-turnos/listado-turnos.component";

@Component({
  selector: 'app-turnos-admin',
  standalone: true,
  imports: [FiltroComponent, ListadoTurnosComponent],
  templateUrl: './turnos-admin.component.html',
  styleUrl: './turnos-admin.component.scss'
})
export class TurnosAdminComponent {
}
