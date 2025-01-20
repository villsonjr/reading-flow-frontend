import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phoneMaskPipe'
})
export class PhoneMaskPipe implements PipeTransform {

  transform(value: string): string {
    if (!value) return '';

    const phone = value.replace(/\D/g, '');
    
    const phoneMask = phone.length <= 10 
      ? phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
      : phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');

    return phoneMask;
  }

}
