import {Entity} from "./entity.model";

export class Sponsorship extends Entity {
    private _url!: string;
    private _link!: string;
    private _rate!: number;
    private _payed!: boolean;

    public constructor(data?: any) {
        super();
        if (data) {
            this._url = data._url || '';
            this._link = data._link || '';
            this._rate = data._rate || 0;
            this._payed = data._payed || false;
        }
    }
}