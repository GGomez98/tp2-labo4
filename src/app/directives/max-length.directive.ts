import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appMaxLength]',
  standalone: true
})
export class MaxLengthDirective {
  @Input('appMaxLength') maxLength!: number; // Máximo número de caracteres permitido

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = this.el.nativeElement as HTMLInputElement;
    const value = input.value;

    if (value.length > this.maxLength) {
      // Truncar el texto al máximo permitido
      input.value = value.substring(0, this.maxLength);
    }
  }
}
