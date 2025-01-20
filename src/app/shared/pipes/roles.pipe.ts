import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'rolesPipe'
})
export class RolePipe implements PipeTransform {

  transform(roles: { description: string }[]): string {
    return roles.map(role => role.description).join(' e ');
  }

}
