import { Entity } from "./entity.model";

export class Finder extends Entity{

    private _keyWord!: string;
    private _minimumPrice!: number;
    private _maximumPrice!: number;  
    private _startingDate: Date | null = null;
    private _endDate: Date | null = null;
    private _queryTime!: Date;
    private _cacheTimeInHours: number = 1;
    private _maxResults: number = 10;
    private _actorId!: string;



    constructor(data?: any) {
        super();
        if(data){
            this._keyWord = data?.keyWord || '';
            this._minimumPrice = data?.minimumPrice || 0;
            this._maximumPrice = data?.maximumPrice || 0;
            this._startingDate = data?.startingDate ? new Date(data.startingDate) : null;
            this._endDate = data?.endDate ? new Date(data.endDate) : null;
            this._queryTime = data?.queryTime || new Date();
            this._cacheTimeInHours = data?.cacheTTL || 1;
            this._maxResults = data?.maxResults || 10;
            this._actorId = data?.actorId || '';
        }
            
    }
    

    // GETTERS
    public get keyWord(): string { return this._keyWord; }
    public get minimumPrice(): number { return this._minimumPrice; }
    public get maximumPrice(): number { return this._maximumPrice; }
    public get startingDate(): Date | null { return this._startingDate; }
    public get endDate(): Date | null { return this._endDate; }
    public get queryTime(): Date { return this._queryTime; }
    public get cacheTTL(): number { return this._cacheTimeInHours; }
    public get maxResults(): number { return this._maxResults; }
    public get actorId(): string { return this._actorId; }



    // SETTERS
    public set keyWord(value: string) { this._keyWord = value; }
    public set minimumPrice(value: number) { this._minimumPrice = value; }
    public set maximumPrice(value: number) { this._maximumPrice = value; }  
    public set startingDate(value: Date | null) { this._startingDate = value; }
    public set endDate(value: Date | null) { this._endDate = value; }
    public set queryTime(value: Date) { this._queryTime = value;}
    public set cacheTTL(value: number) { this._cacheTimeInHours = value; }
    public set maxResults(value: number) { this._maxResults = value; }
    public set actorId(value: string) { this._actorId = value; }
}
