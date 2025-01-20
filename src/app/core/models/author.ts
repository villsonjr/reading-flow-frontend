import { Book } from './book';

export class Author  {

    name: string;

    constructor(name:string) {
        this.name = name;
    }

    getName(): string {
        return this.name;
    }

    setName(name: string): void {
        this.name = name;
    }
}
