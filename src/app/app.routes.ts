import { Routes } from '@angular/router';
import { BienvenidaComponent } from './components/bienvenida/bienvenida.component';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { GestionUsuariosComponent } from './components/gestion-usuarios/gestion-usuarios.component';
import { authGuard } from './auth.guard';
import { RegistroPacienteComponent } from './registro/registro-paciente/registro-paciente.component';
import { RegistroEspecialistaComponent } from './registro/registro-especialista/registro-especialista.component';
import { RegistroComponent } from './registro/registro.component';
import { OpcionesRegistroComponent } from './opciones-registro/opciones-registro.component';
import { PerfilComponent } from './components/perfil/perfil.component';
import { SolicitarTurnoComponent } from './components/solicitar-turno/solicitar-turno.component';
import { TurnosAdminComponent } from './components/turnos-admin/turnos-admin.component';
import { MisTurnosComponent } from './components/mis-turnos/mis-turnos.component';
import { PacientesComponent } from './components/pacientes/pacientes.component';

export const routes: Routes = [
    {component:BienvenidaComponent, path:'', data: { animation: 'bienvenida' }},
    {component:LoginComponent, path:'login', data: { animation: 'login' }},
    {component:OpcionesRegistroComponent, path:'opciones-registro', data: { animation: 'registro' }},
    {component:RegistroComponent, path:'registro', children:[
        {component:RegistroPacienteComponent, path:'registro-paciente'},
        {component:RegistroEspecialistaComponent, path:'registro-especialista'}
    ], data: { animation: 'opcion-registro' }},
    {component:HomeComponent, path: 'home', canActivate: [authGuard]},
    {component: GestionUsuariosComponent, path: 'gestion-usuarios', canActivate: [authGuard]},
    {component: PerfilComponent, path: 'perfil', canActivate: [authGuard]},
    {component: SolicitarTurnoComponent, path: 'solicitar-turno', canActivate: [authGuard]},
    {component: TurnosAdminComponent, path:'turnos', canActivate: [authGuard]},
    {component: MisTurnosComponent, path:'mis-turnos', canActivate: [authGuard]},
    {component: PacientesComponent, path:'pacientes',canActivate: [authGuard]}
];
