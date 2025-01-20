import { Pipe, PipeTransform } from '@angular/core';
import { Author } from 'src/app/core/models/author';

@Pipe({
  name: 'authorPipe'
})
export class AuthorPipe implements PipeTransform {

  transform(authors: Author[]): string {
    return authors.map(author => author.name).join(' e ');
  }

}
