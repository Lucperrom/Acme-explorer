import { Entity } from "./entity.model";

export class Actor extends Entity {
    private _name!: string;
    private _surname!: string;
    private _phone!: string;
    private _role!: string;
    private _email!: string;
    private _password!: string;
    private _validate!: boolean;

    public constructor() {
        super();
    }

    public get name(): string {
        return this._name;
    }

    public get surname(): string {
        return this._surname;
    }

    public get phone(): string {
        return this._phone;
    }
    public get role(): string {
        return this._role;
    }
    public set role(value: string) {
        this._role = value;
    }
    public get email(): string {
        return this._email;
    }

    public get password(): string {
        return this._password;
    }

    public get validate(): boolean {
        return this._validate;
    }

    public set name(value: string) {
        this._name = value;
    }

    public set surname(value: string) {
        this._surname = value;
    }
    
    public set phone(value: string) {
        this._phone = value;
    }

    public set email(value: string) {
        this._email = value;
    }

    public set password(value: string) {
        this._password = value;
    }

    public set validate(value: boolean) {
        this._validate = value;
    }
}
