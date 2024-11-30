import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'keyValueList',
  standalone: true
})
export class KeyValueListPipe implements PipeTransform {

  transform(value: Record<string, any>): { key: string, value: any }[] {
    if (!value || typeof value !== 'object') {
      return [];
    }

    return Object.entries(value).map(([key, val]) => ({ key, value: val }));
  }

}
