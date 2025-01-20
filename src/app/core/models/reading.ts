import { Book } from "./book";

export class Reading {

    key: string;
    readingDate: string;
    rating: number;
    book: Book;

    constructor(key: string, readingDate: string, rating: number, book: Book) {
        this.key = key;
        this.readingDate = readingDate;
        this.rating = rating;
        this.book = book;
    }

    static fromJSON(data: any): Reading {
        return new Reading(
            data.key,
            data.readingDate,
            data.rating,
            data.book
        );
    }

    getReadingDate(): string {
        return this.readingDate;
    }

    getRating(): number {
        return this.rating;
    }

    getBook(): Book {
        return this.book;
    }

    getGenre():string {
        return this.book.genre.name;
    }

    getCategories(): string {
        return this.book.categories.map(cat => cat.name).join(', ');
    }

    getAuthors(): string {
        return this.book.authors.map(author => author.name).join(' e ');
    }

}