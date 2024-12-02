import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appReplaceImage]',
  standalone: true
})
export class ReplaceImageDirective {
  @Input() defaultImage: string = "";
  @Input() hoverImage: string = "";

  constructor(private el: ElementRef) {}

  @HostListener('mouseenter') onMouseEnter() {
    this.changeImage(this.hoverImage);
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.changeImage(this.defaultImage);
  }

  private changeImage(image: string) {
    const imgElement = this.el.nativeElement as HTMLImageElement;
    imgElement.src = image;
    imgElement.style.height = '300px'
  }
}
