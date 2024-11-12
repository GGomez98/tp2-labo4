import { Component } from '@angular/core';
import { RegistroAdminsComponent } from './registro-admins/registro-admins.component';
import { GestionPermisosComponent } from './gestion-permisos/gestion-permisos.component';
import { ListaUsuariosComponent } from "./lista-usuarios/lista-usuarios.component";

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  imports: [RegistroAdminsComponent, GestionPermisosComponent, ListaUsuariosComponent],
  templateUrl: './gestion-usuarios.component.html',
  styleUrl: './gestion-usuarios.component.scss'
})
export class GestionUsuariosComponent {

}
