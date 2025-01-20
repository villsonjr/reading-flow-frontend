export class Category {

    name: string;

    constructor(name: string) {
        this.name = name;
    }

    static fromJSON(data: any): Category {
        return new Category(data.name);
    }

    getName(): string {
        return this.name;
    }

}
