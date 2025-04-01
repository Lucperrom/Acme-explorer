import { Entity } from "./entity.model";

export class Trip extends Entity {

//ATTRIBUTES

    private _ticker!: string;
    private _title!: string;
    private _description!: string;
    private _price!: number;
    private _requirements!: Array<string>;
    private _startDate!: Date;
    private _endDate!: Date;
    private _pictures!: Array<string>;
    private _cancelledReason!: string;
    private _deleted!: boolean;

//CONSTRUCTOR

    constructor(data?: any) {
        super();
        this._requirements = data?._requirements || new Array<string>();
        this._pictures = data?._pictures || new Array<string>();
        this._startDate = data?._startDate || new Date();
        this._endDate = data?._endDate || new Date();
        const generateTicker = (): string => {
            const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, '');
            const lettersPart = Array.from({ length: 4 }, () =>
                String.fromCharCode(65 + Math.floor(Math.random() * 26))
            ).join('');
            return `${datePart}-${lettersPart}`;
        };
        this._ticker = generateTicker();
        this._title = data?._title || '';
        this._description = data?._description || '';
        this._price = data?._price || 0;
        this._cancelledReason = '';
        this._deleted = false;
    }

//GETTERS

    public get title(): string {
        return this._title;
    }
    public get description(): string {
        return this._description;
    }
    public get startDate(): Date {
        return this._startDate;
    }
    public get endDate(): Date {    
        return this._endDate;
    }
    public get price(): number {
        return this._price;
    }
    public get cancelledReason(): string {
        return this._cancelledReason;
    }
    
    public get ticker(): string {
        return this._ticker;
    }

    public get requirements(): Array<string> {
        return this._requirements;
    }

    public get pictures(): Array<string> {
        return this._pictures;
    }  
    
    public get deleted(): boolean {
        return this._deleted;
    }  
    
    //SETTER
    
    public set title(value: string) {
        this._title = value;
    }
    public set description(value: string) {
        this._description = value;
    }
    public set startDate(value: Date) {
        this._startDate = value;
    }
    public set endDate(value: Date) {
        this._endDate = value;
    }
    public set price(value: number) {
        this._price = value;
    }
    
    public set cancelledReason(value: string) {
        this._cancelledReason = value;
    }
    public set ticker(value: string) {
        this._ticker = value;
    }
    public set requirements(value: Array<string>) {
        this._requirements = value;
    }
    public set pictures(value: Array<string>) {
        this._pictures = value;
    }
    public set deleted(value: boolean) {
        this._deleted = value;
    }
}
