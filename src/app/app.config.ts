import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideFirebaseApp(() => initializeApp({"projectId":"tp2-labo4-96998","appId":"1:551030929167:web:1f1f826c51083b0685707a","storageBucket":"tp2-labo4-96998.firebasestorage.app","apiKey":"AIzaSyCPPiaFLgtdkkMbMyrg-j3h-CwQm8aBZiY","authDomain":"tp2-labo4-96998.firebaseapp.com","messagingSenderId":"551030929167"})), provideAuth(() => getAuth()), provideFirestore(() => getFirestore())]
};
