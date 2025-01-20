export class TopAuthor {

    name: string;
    bookCount: number;

    constructor(name: string, bookCounter: number) {
        this.name = name;
        this.bookCount = bookCounter;
    }

    static fromJSON(data: any): TopAuthor {
        return new TopAuthor(
            data.name,
            data.bookCount
        );
    }

}