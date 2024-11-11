import { Injectable } from '@angular/core';
import { doc, Firestore, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})

export class UsuarioService {

  constructor(private firestore: Firestore) {}

  async registrarUsuarios(userId:string, userData: any) {
    try {
      const userDocRef = doc(this.firestore, `usuarios/${userId}`);
      console.log(`usuarios/${userId}`)
      await setDoc(userDocRef, userData);
      console.log('Usuario registrado con éxito en Firestore');
    } catch (error) {
      console.error('Error al registrar usuario:', error);
    }
  }

}
