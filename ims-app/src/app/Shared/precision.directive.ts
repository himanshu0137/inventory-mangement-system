import { Directive, HostListener, ElementRef, OnChanges } from '@angular/core';

@Directive({
  selector: '[appPrecision]'
})
export class PrecisionDirective implements OnChanges
{
  constructor(private el: ElementRef) { }

  ngOnChanges()
  {
    const element = this.el.nativeElement;
    const val = parseFloat(element.value);
    if (isNaN(val))
    {
      element.value = '0';
    }
    element.value = val.toFixed(2);
  }
}
