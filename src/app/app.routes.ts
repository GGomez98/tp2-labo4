import { Routes } from '@angular/router';
import { BienvenidaComponent } from './components/bienvenida/bienvenida.component';
import { LoginComponent } from './components/login/login.component';
import { RegistroPacienteComponent } from './components/registro-paciente/registro-paciente.component';
import { RegistroEspecialistaComponent } from './components/registro-especialista/registro-especialista.component';
import { HomeComponent } from './components/home/home.component';
import { GestionUsuariosComponent } from './components/gestion-usuarios/gestion-usuarios.component';

export const routes: Routes = [
    {component:BienvenidaComponent, path:''},
    {component:LoginComponent, path:'login'},
    {component:RegistroPacienteComponent, path:'registro-paciente'},
    {component:RegistroEspecialistaComponent, path:'registro-especialista'},
    {component:HomeComponent, path: 'home'},
    {component: GestionUsuariosComponent, path: 'gestion-usuarios'}
];
