import { Pipe, PipeTransform } from '@angular/core';
import { Category } from 'src/app/core/models/category';

@Pipe({
  name: 'categoryPipe'
})
export class CategoryPipe implements PipeTransform {

  transform(categories: Category[]): string {
    if (!categories || categories.length === 0) {
      return 'N/A';
    }
    const pipeGenre = categories.map(category => category.name).join(', ');
    return pipeGenre;
  }
}
