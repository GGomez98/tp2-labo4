import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, Input, OnChanges, OnInit } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { addDoc, collection, doc, Firestore, getDoc, onSnapshot, setDoc } from '@angular/fire/firestore';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Modal } from 'bootstrap';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-form-horarios',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './form-horarios.component.html',
  styleUrl: './form-horarios.component.scss'
})
export class FormHorariosComponent implements OnInit{
  @Input() horarioEspecialidad: any;
  @Input() listaHorarios: any = [];
  form!:FormGroup;
  modal!: Modal
  dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']
  horariosCargados = false;
  formularioEnviado = false;
  envioExitoso = false;

  constructor(private auth: Auth, private firestore: Firestore){}

  ngOnInit(){
    this.form = new FormGroup({
      minutos:new FormControl({ value: '', disabled: true }, Validators.required),
      lunes: new FormControl(false),
      iniciolunes: new FormControl({ value: '', disabled: true }),
      finlunes: new FormControl({ value: '', disabled: true }),
      martes: new FormControl(false),
      iniciomartes: new FormControl({ value: '', disabled: true }),
      finmartes: new FormControl({ value: '', disabled: true }),
      miercoles: new FormControl(false),
      iniciomiercoles: new FormControl({ value: '', disabled: true }),
      finmiercoles: new FormControl({ value: '', disabled: true }),
      jueves: new FormControl(false),
      iniciojueves: new FormControl({ value: '', disabled: true }),
      finjueves: new FormControl({ value: '', disabled: true }),
      viernes: new FormControl(false),
      inicioviernes: new FormControl({ value: '', disabled: true }),
      finviernes: new FormControl({ value: '', disabled: true }),
      sabado: new FormControl(false),
      iniciosabado: new FormControl({ value: '', disabled: true }),
      finsabado: new FormControl({ value: '', disabled: true })
    }, { 
      validators: [this.validateDias, this.validateAlMenosUnDiaSeleccionado, this.validateHorarios, this.validateRangoHorario] 
    });

      this.dias.forEach((dia) => {
        this.form.get(dia)?.valueChanges.subscribe((isChecked) => {
          if (isChecked) {
            this.form.get(`inicio${dia}`)?.enable();
            this.form.get(`fin${dia}`)?.enable();
          } else {
            this.form.get(`inicio${dia}`)?.disable();
            this.form.get(`fin${dia}`)?.disable();
            this.form.get(`inicio${dia}`)?.reset("");
            this.form.get(`fin${dia}`)?.reset("");
          }
          this.actualizarMinutos(this.dias);
        });
      });

      this.actualizarMinutos(this.dias);
      this.cargarFormulario();

      this.form.valueChanges.subscribe(()=>{
        this.envioExitoso = false;
      })
  }

  validateRangoHorario(control: AbstractControl): ValidationErrors | null{
    const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']
    let rangoNoValido = [];

    for (const dia of dias) {
      const diaControl = control.get(dia);
      const startControl = control.get(`inicio${dia}`);
      const endControl = control.get(`fin${dia}`);

      if (diaControl?.value) {
        if (startControl?.value > endControl?.value -1) {
          rangoNoValido.push(`El horario de inicio de ${dia} es mayor o igual al horario de fin`)
        }
      }
    }

    if(rangoNoValido.length == 0){
      return null;
    }
    else{
      return {rangoNoValido}
    }
  }

  validateHorarios(control: AbstractControl): ValidationErrors | null {
    const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']
    let horarioFueraDeRango = []

    for (const dia of dias) {
      const diaControl = control.get(dia);
      const startControl = control.get(`inicio${dia}`);
      const endControl = control.get(`fin${dia}`);
  
      if (diaControl?.value) {
        if(dia == 'sabado'){
          if (startControl?.value < 8 || startControl?.value > 13) {
            horarioFueraDeRango.push(`El horario de inicio de ${dia} tiene que ser entre las 8 y las 13`)
          }
          else if(endControl?.value < 9 || endControl?.value > 14){
            horarioFueraDeRango.push(`El horario de fin de ${dia} tiene que ser entre las 9 y las 14`)
          }
        }
        else{
          if (startControl?.value < 8 || startControl?.value > 18) {
            horarioFueraDeRango.push(`El horario de inicio de ${dia} tiene que ser entre las 8 y las 18`)
          }
          else if(endControl?.value < 9 || endControl?.value > 19){
            horarioFueraDeRango.push(`El horario de fin de ${dia} tiene que ser entre las 9 y las 19`)
          }
        }
      }
    }

    if(horarioFueraDeRango.length == 0){
      return null;
    }
    else{
      return {horarioFueraDeRango}
    }
  }

  validateDias(control: AbstractControl): ValidationErrors | null {
    const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']
    let incompleteSchedule = []

    for (const dia of dias) {
      const diaControl = control.get(dia);
      const startControl = control.get(`inicio${dia}`);
      const endControl = control.get(`fin${dia}`);
  
      if (diaControl?.value) {
        if (!startControl?.value || !endControl?.value) {
          incompleteSchedule.push(`${dia} tiene horarios incompletos`)
        }
      }
    }

    if(incompleteSchedule.length == 0){
      return null;
    }
    else{
      return {incompleteSchedule}
    }
  }

  validateAlMenosUnDiaSeleccionado(control: AbstractControl): ValidationErrors | null {
    const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']
    const algunDiaSeleccionado = dias.some(dia => control.get(dia)?.value);

    return algunDiaSeleccionado ? null : {sinDiasSeleccionados: 'Por favor seleccione al menos un dia'}
  }

  obtenerDiasHabilitados(): any[]{
    let horario :any = []
    this.dias.forEach((dia) => {
        if (this.form.get(dia)?.value) {
          let horarioDia = {diaAtencion: dia, inicio: this.form.get(`inicio${dia}`)?.value, fin: this.form.get(`fin${dia}`)?.value}
          console.log(dia)
          horario.push(horarioDia)
        }
    });
    return horario;
  }

  actualizarMinutos(dias: string[]) {
    const algunDiaSeleccionado = dias.some((dia) => this.form.get(dia)?.value);
    if (algunDiaSeleccionado) {
      this.minutos?.enable();
    } else {
      this.minutos?.disable();
      this.minutos?.reset('')
      
    }
  }

  async obtenerHorarios(){
    const query = collection(this.firestore, "horariosAtencion");

      onSnapshot(query, (querySnapshot) => {

        querySnapshot.forEach((doc) => {
          const horario = doc.data();
          if(this.auth.currentUser?.uid == horario['especialistaId']){
            horario['id'] = doc.id
            this.listaHorarios.push(horario);
          }
        });
        this.horariosCargados = true;
      });
  }

  cargarFormulario(){
    this.listaHorarios.forEach((horario: any) => {
      if(horario.especialidad == this.horarioEspecialidad && horario.especialistaId == this.auth.currentUser?.uid){
        this.minutos?.enable();
        this.minutos.setValue(horario.minutosTurno)
        horario.horarios.forEach((horario: any) => {
          this.form.get(`${horario.diaAtencion}`)?.setValue(true)
          this.form.get(`inicio${horario.diaAtencion}`)?.setValue(horario.inicio)
          this.form.get(`fin${horario.diaAtencion}`)?.setValue(horario.fin)
        });
      }
    })
  }

  async CargarHorariosPorEspecialidad(){
    this.formularioEnviado = true
    let horarioExiste = false;
    const userId = this.auth.currentUser?.uid;
    const horarioData = {
      especialistaId: userId,
      especialidad: this.horarioEspecialidad,
      minutosTurno: this.minutos.value,
      horarios: this.obtenerDiasHabilitados()
    }

    if(this.form.valid){
      Swal.fire({
        title: 'Cargando...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        background: '#fff',
        color: '#000',
        didOpen: () => {
          Swal.showLoading();
        }
      });
      try {
        for(let horario of this.listaHorarios){
          if(horario.especialidad == this.horarioEspecialidad && horario.especialistaId == this.auth.currentUser?.uid){
            const horarioDocRef = doc(this.firestore, `horariosAtencion/${horario.id}`);
            await setDoc(horarioDocRef, horarioData);
            horarioExiste = true;
            Swal.fire({
              title: `Se editaron los horarios de la especialidad`,
              background: '#fff',
              color: '#000',
              confirmButtonColor: '#ff5722'
            })
            console.log('Se editaron los horarios de la especialidad');
          }
        }
  
        if(!horarioExiste){
          const horarioDocRef = collection(this.firestore, `horariosAtencion`);
          await addDoc(horarioDocRef, horarioData);
          Swal.fire({
            title: `Se cargaron los horarios de la especialidad`,
            background: '#fff',
            color: '#000',
            confirmButtonColor: '#ff5722'
          })
          console.log('Se cargaron los horarios de la especialidad');
        }
        this.envioExitoso = true
        this.formularioEnviado = false
      } catch (error) {
        console.error('Error al registrar los horarios del usuario:', error);
      }
    }
    else{
      console.log("Formulario Invalido")
    }
  }

  async CargarHorarios(){
    const userId = this.auth.currentUser?.uid;
    const userDocRef = doc(this.firestore, `usuarios/${userId}`);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data();
    userData?.['especialidades'].forEach(async (especialidad: any) => {
      const horarioData = {
        especialistaId: this.auth.currentUser?.uid,
        especialidad: especialidad,
        horarios:[
          {dia:'lunes',horaInicio:"08:00",horaFin:"19:00"},
          {dia:'martes',horaInicio:"08:00",horaFin:"19:00"},
          {dia:'miercoles',horaInicio:"08:00",horaFin:"19:00"},
          {dia:'jueves',horaInicio:"08:00",horaFin:"19:00"},
          {dia:'viernes',horaInicio:"08:00",horaFin:"19:00"},
          {dia:'sabado',horaInicio:"08:00",horaFin:"14:00"}
        ],
        minutosTurno: 30
      }
      try {
        const horarioDocRef = collection(this.firestore, `horariosAtencion`);
        await addDoc(horarioDocRef, horarioData);
        console.log('Los horarios del usuario se registraron con exito');
      } catch (error) {
        console.error('Error al registrar los horarios del usuario:', error);
      }
    });
  }

  get minutos(){
    return this.form.get('minutos')
  }
  set minutos(value:any){
    this.minutos.value = value
  }
  get lunes(){
    return this.form.get('lunes')
  }
  set lunes(value:any){
    this.lunes.value = value
  }
  get finlunes(){
    return this.form.get('finlunes')
  }
  set finlunes(value:any){
    this.finlunes.value = value
  }
  get iniciolunes(){
    return this.form.get('iniciolunes')
  }
  set iniciolunes(value:any){
    this.iniciolunes.value = value
  }
  get martes(){
    return this.form.get('martes')
  }
  set martes(value:any){
    this.martes.value = value
  }
  get finmartes(){
    return this.form.get('finmartes')
  }
  set finmartes(value:any){
    this.finmartes.value = value
  }
  get iniciomartes(){
    return this.form.get('iniciomartes')
  }
  set iniciomartes(value:any){
    this.iniciomartes.value = value
  }
  get miercoles(){
    return this.form.get('miercoles')
  }
  set miercoles(value:any){
    this.miercoles.value = value
  }
  get finmiercoles(){
    return this.form.get('finmiercoles')
  }
  set finmiercoles(value:any){
    this.finmiercoles.value = value
  }
  get iniciomiercoles(){
    return this.form.get('iniciomiercoles')
  }
  set iniciomiercoles(value:any){
    this.iniciomiercoles.value = value
  }
  get jueves(){
    return this.form.get('jueves')
  }
  set jueves(value:any){
    this.jueves.value = value
  }
  get finjueves(){
    return this.form.get('finjueves')
  }
  set finjueves(value:any){
    this.finjueves.value = value
  }
  get iniciojueves(){
    return this.form.get('iniciojueves')
  }
  set iniciojueves(value:any){
    this.iniciojueves.value = value
  }
  get viernes(){
    return this.form.get('viernes')
  }
  set viernes(value:any){
    this.viernes.value = value
  }
  get finviernes(){
    return this.form.get('finviernes')
  }
  set finviernes(value:any){
    this.finviernes.value = value
  }
  get inicioviernes(){
    return this.form.get('inicioviernes')
  }
  set inicioviernes(value:any){
    this.inicioviernes.value = value
  }
  get sabado(){
    return this.form.get('sabado')
  }
  set sabado(value:any){
    this.sabado.value = value
  }
  get finsabado(){
    return this.form.get('finsabado')
  }
  set finsabado(value:any){
    this.finsabado.value = value
  }
  get iniciosabado(){
    return this.form.get('iniciosabado')
  }
  set iniciosabado(value:any){
    this.iniciosabado.value = value
  }
}


