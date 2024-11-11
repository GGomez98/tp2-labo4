import { Component } from '@angular/core';
import { RegistroAdminsComponent } from './registro-admins/registro-admins.component';
import { GestionPermisosComponent } from './gestion-permisos/gestion-permisos.component';

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  imports: [RegistroAdminsComponent, GestionPermisosComponent],
  templateUrl: './gestion-usuarios.component.html',
  styleUrl: './gestion-usuarios.component.scss'
})
export class GestionUsuariosComponent {

}
