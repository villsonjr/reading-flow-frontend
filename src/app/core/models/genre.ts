import { Category } from "./category";

export class Genre {

    name: string;
    icon: string;
    categories: Category[];

    constructor(name: string, icon: string, categories: Category[]) {
        this.name = name;
        this.icon = icon;
        this.categories = categories;
    }

    static fromJSON(data: any): Genre {
        return new Genre(
            data.name,
            data.icon,
            data.categories
        );
    }

    getName(): string {
        return this.name;
    }

    setName(name: string): void {
        this.name = name;
    }

    getIcon(): string {
        return this.icon;
    }

    setIcon(icon: string): void {
        this.icon = icon;
    }

    getCategories(): Category[] {
        return this.categories;
    }

    setCategories(categories: Category[]): void {
        this.categories = categories;
    }

    removeCategoria(categoria: string): void {
        const index = this.categories.findIndex(cat => cat.getName() === categoria);

        if (index !== -1) {
            this.categories.splice(index, 1);
        }
    }
}
