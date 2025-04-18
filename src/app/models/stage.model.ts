export class Stage {
    private _title!: string;
    private _description!: string;
    private _price!: number;

    constructor(data?: any) {
        this._title = data?.title || '';
        this._description = data?.description || '';
        this._price = data?.price || 0;
    }

    public get title(): string {
        return this._title;
    }

    public get description(): string {
        return this._description;
    }

    public get price(): number {
        return this._price;
    }

    public set title(value: string) {
        this._title = value;
    }

    public set description(value: string) {
        this._description = value;
    }

    public set price(value: number) {
        this._price = value;
    }

    toPlainObject() {
        return {
          title: this.title,
          description: this.description,
          price: this.price,
        };
    }
}
