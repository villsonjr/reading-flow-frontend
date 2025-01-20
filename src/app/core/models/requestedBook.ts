import { Book } from './book';
import { User } from './user';

export class RequestedBook {

    key: string;
    requestedDate: string;
    bookTitle: string;
    authorName: string;
    status: string;
    owner: User;
    assigned: User | null;
    book: Book;
    startedDate: string;
    closedDate: string;

    constructor(key: string, requestedDate: string, bookTitle: string,
        authorName: string, status: string, owner: User, assigned: User | null,
        book: Book, startedDate: string, closedDate: string
    ) {
        this.key = key;
        this.requestedDate = requestedDate;
        this.bookTitle = bookTitle;
        this.authorName = authorName;
        this.status = status;
        this.owner = owner;
        this.assigned = assigned;
        this.book = book;
        this.startedDate = startedDate;
        this.closedDate = closedDate;
    }

    static fromJSON(data: any): RequestedBook {
        const owner = User.fromJSON(data.owner);
        const assigned = data.assigned ? User.fromJSON(data.assigned) : null;

        return new RequestedBook(
            data.key,
            data.requestedDate,
            data.bookTitle,
            data.authorName,
            data.status,
            owner,
            assigned,
            data.book,
            data.startedDate,
            data.closedDate
        );
    }

    public getStatus(): string {
        switch (this.status) {
            case 'CREATED':
                return 'Em Aberto';
            case 'IN_PROGRESS':
                return 'Em Andamento';
            case 'CANCELED':
                return 'Cancelada';
            case 'COMPLETE':
                return 'Concluída';
            default:
                return 'Erro Interno';
        }
    }

    public hasResponsible(): boolean {
        return this.owner.name ? true : false;
    }
}