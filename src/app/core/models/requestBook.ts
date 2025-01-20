export class RequestBook {

    bookTitle: string;
    authorName: string;

    constructor(bookTitle: string, authorName: string) {
        this.bookTitle = bookTitle;
        this.authorName = authorName;
    }

    static fromJSON(data: any): RequestBook {
        return new RequestBook(
            data.bookTitle,
            data.authorName
        );
    }

}
