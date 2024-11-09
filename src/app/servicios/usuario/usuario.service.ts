import { Injectable } from '@angular/core';
import { addDoc, collection, Firestore } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL, getStorage } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})

export class UsuarioService {

  constructor(private firestore: Firestore) {}

  async registrarUsuarios(userData: any, tipo:string) {
    const userRef = collection(this.firestore, tipo);

    try {
      await addDoc(userRef, { ...userData});
      console.log('Usuario registrado con éxito en Firestore');
    } catch (error) {
      console.error('Error al registrar usuario:', error);
    }
  }

}
