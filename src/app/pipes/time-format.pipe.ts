import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeFormat',
  standalone: true
})
export class TimeFormatPipe implements PipeTransform {
  transform(value: String): string {
    if (!value) return '';

    const [hours, minutes] = value.split(':').map(Number);

    const period = hours >= 12 ? 'pm' : 'am';
    const adjustedHours = hours % 12 || 12;

    return `${this.pad(adjustedHours)}:${this.pad(minutes)}${period}`;
  }

  private pad(num: number): string {
    return num.toString().padStart(2, '0');
  }
}
