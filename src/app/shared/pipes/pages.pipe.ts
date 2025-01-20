import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pagesPipe'
})
export class PagesPipe implements PipeTransform {

  transform(value: number): unknown {
    return null;
  }

}
