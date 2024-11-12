import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { doc, Firestore, getDoc } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  userData: any;
  constructor(protected auth: Auth, protected firestore: Firestore){}

  async ngOnInit(){
    const userId = this.auth.currentUser?.uid
    const userDocRef = doc(this.firestore, `usuarios/${userId}`);
    const userDoc = await getDoc(userDocRef);
    this.userData = userDoc.data();
  }

}
