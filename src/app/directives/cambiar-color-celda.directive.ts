import { Directive, ElementRef, Input, Renderer2, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appCambiarColorCelda]',
  standalone: true
})
export class CambiarColorCeldaDirective {

  @Input() appCambiarColorCelda: string | undefined;

  private estadoColor: { [key: string]: string } = {
    solicitado: '#edff9f',
    cancelado: '#aaaaaa',
    rechazado: '#ff9f9f',
    aceptado: '#9fff9f',
    finalizado:"#9ffffa"
  };

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appCambiarColorCelda']) {
      this.updateCellColor();
    }
  }

  private updateCellColor(): void {
    const color = this.estadoColor[this.appCambiarColorCelda || 'neutral'] || 'transparent';
    this.renderer.setStyle(this.el.nativeElement, 'backgroundColor', color);
  }

}
