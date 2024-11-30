import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { provideHttpClient } from '@angular/common/http';
import {RECAPTCHA_SETTINGS, RecaptchaModule, RecaptchaSettings, ReCaptchaV3Service} from 'ng-recaptcha';
import { provideAnimations } from '@angular/platform-browser/animations'

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes), 
    provideFirebaseApp(() => initializeApp({"projectId":"tp2-labo4-96998","appId":"1:551030929167:web:1f1f826c51083b0685707a","storageBucket":"tp2-labo4-96998.firebasestorage.app","apiKey":"AIzaSyCPPiaFLgtdkkMbMyrg-j3h-CwQm8aBZiY","authDomain":"tp2-labo4-96998.firebaseapp.com","messagingSenderId":"551030929167"})), 
    provideAuth(() => getAuth()), 
    provideFirestore(() => getFirestore()), 
    provideStorage(() => getStorage()),
    provideHttpClient(),
    importProvidersFrom(
      RecaptchaModule,
      ReCaptchaV3Service
    ),
  {provide:RECAPTCHA_SETTINGS, useValue:{siteKey:'6LcJ_nwqAAAAAHWshJBmnD2wzXVsi4bPk2C5jIih' as RecaptchaSettings}},
  provideAnimations()]
};
