import { Entity } from "./entity.model";

export class Application extends Entity {
    private _status!: string;
    private _creationDate!: Date;
    private _rejectionReason!: string;
    private _comments!: string;
    private _tripId!: string;
    private _managerId!: string;
    private _explorerId!: string;

    constructor(data?: any) {
        super();
        this._status = 'pending';
        this._creationDate = new Date();
        this._rejectionReason = '';
        this._comments = data?.comments || '';
        this._tripId = data?.tripId || '';
        this._managerId = data?.managerId || '';
        this._explorerId = data?.explorerId || '';
    }

    // GETTERS
    public get status(): string { return this._status; }
    public get creationDate(): Date { return this._creationDate; }
    public get rejectionReason(): string { return this._rejectionReason; }
    public get comments(): string { return this._comments; }
    public get tripId(): string { return this._tripId; }
    public get managerId(): string { return this._managerId; }
    public get explorerId(): string { return this._explorerId; }

    // SETTERS
    public set status(value: string) { this._status = value; }
    public set creationDate(value: Date) { this._creationDate = value; }
    public set rejectionReason(value: string) { this._rejectionReason = value; }
    public set comments(value: string) { this._comments = value; }
    public set tripId(value: string) { this._tripId = value; }
    public set managerId(value: string) { this._managerId = value; }
    public set explorerId(value: string) { this._explorerId = value; }

}