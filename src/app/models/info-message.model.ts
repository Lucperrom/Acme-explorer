export class InfoMessage {
    private _message!: string
    private _cssClass!: string

    constructor(message: string, cssClass: string){
        this._message = message;
        this._cssClass = cssClass;
    }

    public get message(): string {
        return this._message
    }

    public get cssClass(): string {
        return this._cssClass
    }
}
