import {Entity} from "./entity.model";

export class Sponsorship extends Entity {
    private _url!: string;
    private _link!: string;
    private _rate!: number;
    private _payed!: boolean;
    private _tripId!: string;
    private _sponsorId!: string;

    public constructor(data?: any) {
        super();
        if (data) {
            this._url = data._url || '';
            this._link = data._link || '';
            this._rate = data._rate || 0;
            this._payed = data._payed || false;
            this._tripId = data._tripId || '';
            this._sponsorId = data._sponsorId || '';
        }
    }
    public get url(): string {
        return this._url;
    }

    public set url(value: string) {
        this._url = value;
    }

    public get link(): string {
        return this._link;
    }

    public set link(value: string) {
        this._link = value;
    }

    public get rate(): number {
        return this._rate;
    }

    public set rate(value: number) {
        this._rate = value;
    }

    public get payed(): boolean {
        return this._payed;
    }

    public set payed(value: boolean) {
        this._payed = value;
    }

    public get tripId(): string {
        return this._tripId;
    }

    public set tripId(value: string) {
        this._tripId = value;
    }

    public get sponsorId(): string {
        return this._sponsorId;
    }

    public set sponsorId(value: string) {
        this._sponsorId = value;
    }
}