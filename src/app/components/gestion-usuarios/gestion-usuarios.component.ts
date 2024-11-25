import { Component, ElementRef, ViewChild } from '@angular/core';
import { RegistroAdminsComponent } from './registro-admins/registro-admins.component';
import { ListaUsuariosComponent } from "./lista-usuarios/lista-usuarios.component";
import { Modal } from 'bootstrap';
import { RegistroEspecialistaComponent } from '../../registro/registro-especialista/registro-especialista.component';
import { RegistroPacienteComponent } from '../../registro/registro-paciente/registro-paciente.component';

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  imports: [RegistroAdminsComponent, ListaUsuariosComponent, RegistroEspecialistaComponent, RegistroPacienteComponent ],
  templateUrl: './gestion-usuarios.component.html',
  styleUrl: './gestion-usuarios.component.scss'
})
export class GestionUsuariosComponent {
}
