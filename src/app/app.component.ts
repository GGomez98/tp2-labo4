import { Component } from '@angular/core';
import { ChildrenOutletContexts, Router, RouterModule, RouterOutlet } from '@angular/router';
import Swal from 'sweetalert2';
import { Auth } from '@angular/fire/auth';
import { slideInAnimation } from './animations/animations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  animations: [
    slideInAnimation
  ]
})
export class AppComponent {
  title = 'tp2_labo4';

  constructor(protected router: Router, protected auth: Auth, private contexts: ChildrenOutletContexts) {}
  
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

  getRouteAnimationData() {
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
  }
}
