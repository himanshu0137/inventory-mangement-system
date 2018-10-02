import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'total'
})
export class TotalPipe implements PipeTransform
{

  transform(value: number, label: string, unit: string): string
  {
    if (value < 0)
    {
      return 'Invalid Value';
    }
    if (value === 0 || !value)
    {
      return;
    }
    return `Total ${label} = ${value.toFixed(3)} ${unit}`;
  }

}
