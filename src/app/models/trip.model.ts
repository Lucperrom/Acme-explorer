import { Entity } from "./entity.model";
import { Stage } from "./stage.model";

export class Trip extends Entity {
    private _ticker!: string;
    private _title!: string;
    private _description!: string;
    private _stages!: Stage[];  // Array de etapas
    private _price!: number; // Precio total del viaje
    private _requirements!: Array<string>;
    private _startDate!: Date;
    private _endDate!: Date;
    private _pictures!: Array<string>;
    private _cancelledReason!: string;
    private _deleted!: boolean;
    private _managerId!: string;
    private _managerName!: string;
    private _createdAt!: Date; // New property

    constructor(data?: any) {
        super();
        this._requirements = data?.requirements || [];
        this._pictures = data?.pictures || [];
        this._stages = (data?.stages || []).map((stageData: any) => new Stage(stageData)); // Convertimos los datos en instancias de Stage
        this._price = this._stages.reduce((total, stage) => total + stage.price, 0);
        this._startDate = data?.startDate || new Date();
        this._endDate = data?.endDate || new Date();
        this._createdAt = data?.createdAt || new Date(); // Initialize createdAt
        
        const generateTicker = (): string => {
            const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, '');
            const lettersPart = Array.from({ length: 4 }, () =>
                String.fromCharCode(65 + Math.floor(Math.random() * 26))
            ).join('');
            return `${datePart}-${lettersPart}`;
        };

        this._ticker = generateTicker();
        this._title = data?.title || '';
        this._description = data?.description || '';
        this._cancelledReason = '';
        this._deleted = false;
        this._managerId = data?.managerId || '';
        this._managerName = data?.managerName || '';
    }

    // GETTERS
    public get title(): string { return this._title; }
    public get description(): string { return this._description; }
    public get startDate(): Date { return this._startDate; }
    public get endDate(): Date { return this._endDate; }
    public get cancelledReason(): string { return this._cancelledReason; }
    public get ticker(): string { return this._ticker; }
    public get requirements(): Array<string> { return this._requirements; }
    public get pictures(): Array<string> { return this._pictures; }
    public get deleted(): boolean { return this._deleted; }
    public get managerId(): string { return this._managerId; }
    public get managerName(): string { return this._managerName; }
    public get stages(): Stage[] { return this._stages; }
    public get price(): number { return this._price; }
    public get createdAt(): Date { return this._createdAt; } // Getter for createdAt

    // SETTERS
    public set title(value: string) { this._title = value; }
    public set description(value: string) { this._description = value; }
    public set startDate(value: Date) { this._startDate = value; }
    public set endDate(value: Date) { this._endDate = value; }
    public set cancelledReason(value: string) { this._cancelledReason = value; }
    public set ticker(value: string) { this._ticker = value; }
    public set requirements(value: Array<string>) { this._requirements = value; }
    public set pictures(value: Array<string>) { this._pictures = value; }
    public set deleted(value: boolean) { this._deleted = value; }
    public set managerId(value: string) { this._managerId = value; }
    public set managerName(value: string) { this._managerName = value; }
    public set stages(value: Stage[]) { this._stages = value; }
    public set price(value: number) { this._price = value; }
    public set createdAt(value: Date) { this._createdAt = value; } // Setter for createdAt
}
