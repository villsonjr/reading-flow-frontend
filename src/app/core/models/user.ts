import { Preferences } from "./preferences";

export class User {

    name: string;
    username: string;
    email: string;
    birthday: string;
    phone: string;
    gender: string;
    kindleMail: string;
    status: string;
    roles: string[];
    preferences: Preferences[];


    constructor(name: string, username: string, email: string, birthday: string, phone: string,
        gender: string, kindleMail: string, status: string, roles: string[], preferences: Preferences[]) {

        this.name = name;
        this.username = username;
        this.email = email;
        this.birthday = birthday;
        this.phone = phone;
        this.gender = gender;
        this.kindleMail = kindleMail
        this.status = status;
        this.roles = roles;
        this.preferences = preferences;
    }

    static fromJSON(data: any): User {

        return new User(
            data.name ?? null,
            data.username ?? null,
            data.email ?? null,
            data.birthday ?? null,
            data.phone ?? null,
            data.gender ?? null,
            data.kindleMail ?? null,
            data.status ?? null,
            data.roles ?
                data.roles.map((role: string) => role) : [],

            data.preferences ? data.preferences.map((preference: any) => ({
                key: preference.key,
                value: preference.value
            })) : []
        );
    }

    public getGender(): string {
        switch (this.gender) {
            case 'MALE':
                return 'Masculino';
            case 'FEMALE':
                return 'Feminino';
            case 'NOT INFORMED':
                return 'Não Informado';
            default:
                return 'Erro Interno';
        }
    }

    getRoles(): string {
        return this.roles.join(' e ');
    }

    canAccessUserResources(): boolean {
        return this.roles.includes('USER') || this.roles.includes('MODERATOR') || this.roles.includes('ADMINISTRATOR');
    }

    canAccessModeratorResources(): boolean {
        return this.roles.includes('MODERATOR') || this.roles.includes('ADMINISTRATOR')
    }

    canAccessAdminResources(): boolean {
        return this.roles.includes('ADMINISTRATOR');
    }
}
