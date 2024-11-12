import { inject } from '@angular/core';
import { getAuth } from '@angular/fire/auth';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = getAuth();
  const router = inject(Router); // Inyectar el Router para redirigir

  const user = auth.currentUser;

  if (user) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};
