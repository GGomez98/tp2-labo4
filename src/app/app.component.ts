import { Component } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { BienvenidaComponent } from './components/bienvenida/bienvenida.component';
import Swal from 'sweetalert2';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, BienvenidaComponent,RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'tp2_labo4';

  constructor(protected router: Router, protected auth: Auth) {}
  
  goTo(path: string) {
    console.log(path);
    this.router.navigate([path]);
  }

  isLoggedOut(): boolean {
    return this.auth.currentUser == null;
  }

  logout() {
    Swal.fire({
      title: "¿Esta seguro que desea cerrar la sesión?",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Cerrar Sesión",
      cancelButtonText: "Cancelar",
      background: '#fff',
      color: '#000',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.showLoading();
        this.auth.signOut();
        this.goTo('/login');
      }
    });
  }
}
