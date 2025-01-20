import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberDotsPipe'
})
export class NumberDotsPipe implements PipeTransform {

  transform(value: number | string, locale?: string): string {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1
    }).format(Number(value));
  }

}
