import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'siNoPipe',
  standalone: true
})
export class SiNoPipe implements PipeTransform {

  transform(value: boolean): string {
    if(typeof value == 'boolean'){
      if(value){
        return 'Si'
      }
      else{
        return 'No'
      }
    }
    else{
      return value
    }
  }

}
