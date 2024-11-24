import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { collection, doc, Firestore, getDoc, onSnapshot } from '@angular/fire/firestore';

@Component({
  selector: 'app-listado-turnos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './listado-turnos.component.html',
  styleUrl: './listado-turnos.component.scss'
})
export class ListadoTurnosComponent {
turnosCargados = false;
turnos: any[] = []

constructor(private firestore: Firestore){}

ngOnInit(){
  this.obtenerTurnos()
}

async obtenerTurnos(){
  const query = collection(this.firestore, "turnos");

  onSnapshot(query, (querySnapshot) => {

    querySnapshot.forEach(async (doc) => {
      const turno = doc.data();
      const [paciente, especialista] = await Promise.all([
        this.obtenerUsuarioPorId(turno['idPaciente']),
        this.obtenerUsuarioPorId(turno['idEspecialista'])
      ]);
      turno['id'] = doc.id
      turno['paciente'] = `${paciente.nombre} ${paciente.apellido}`
      turno['especialista'] = `${especialista.nombre} ${especialista.apellido}`
      this.turnos.push(turno);
    });

    console.log(this.turnos);
    this.turnosCargados = true;
  });
}

async obtenerUsuarioPorId(id: String): Promise<any>{
  try{
    const userDocRef = doc(this.firestore, `usuarios/${id}`);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      return userDoc.data();
    } else {
      return null;
    }
  }
  catch(error){
    console.error("Error al obtener los datos de los usuarios: "+error)
  }
}
}
