import { Author } from './author';
import { Category } from './category';
import { Genre } from './genre';

export class Book {

    title: string;
    description: string;
    pages: number;
    isbn: string;
    genre: Genre;
    categories: Category[];
    authors: Author[];
    gDriveID: string;

    constructor(title?: string, description?: string, pages?: number,
        isbn?: string, genre?: Genre, categories?: Category[],
        authors?: Author[], gDriveID?: string) {

            this.title = title || '';
            this.description = description || '';
            this.pages = pages || 0;
            this.isbn = isbn || '';
            this.genre = genre || new Genre('', '', []);
            this.categories = categories || [];
            this.authors = authors || [];
            this.gDriveID = gDriveID || '';
    }

    static fromJSON(data: any): Book {

        const genre = data.genre ? Genre.fromJSON(data.genre) : new Genre('', '', []);
        const categories = data.categories ? data.categories.map((categoryData: any) => Category.fromJSON(categoryData)) : [];
        const authors = data.authors.map((authorData: any) => new Author(authorData.name));

        return new Book(
            data.title,
            data.description,
            data.pages,
            data.isbn,
            genre,
            categories,
            authors,
            data.gDriveID
        );
    }

    getTitle(): string {
        return this.title;
    }

    setTitle(title: string): void {
        this.title = title;
    }

    getDescription(): string {
        return this.description;
    }

    setDescription(description: string): void {
        this.description = description;
    }

    getPages(): number {
        return this.pages;
    }

    setPages(pages: number): void {
        this.pages = pages;
    }

    getgDriveID(): string {
        return this.gDriveID;
    }

    setgDriveID(gDriveID: string): void {
        this.gDriveID = gDriveID;
    }

    getAuthors(): Author[] {
        return this.authors;
    }

    setAuthors(authors: Author[]): void {
        this.authors = authors;
    }

    getAuthorsName(): string {
        return this.authors.map(author => author.name).join(' e ');
    }

    getGenreName(): string {
        if (this.genre) {
            return this.genre.name
        }
        return '';
    }

    getCategoriesName() {
        return this.categories.map(cat => cat.name).join(', ');
    }
}
