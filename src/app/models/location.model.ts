export class Location {
  latitude: number;
  longitude: number;
  address: string;

  constructor(data?: Partial<Location>) {
    this.latitude = data?.latitude || 0;
    this.longitude = data?.longitude || 0;
    this.address = data?.address || '';
  }

  toPlainObject() {
    return {
      latitude: this.latitude,
      longitude: this.longitude,
      address: this.address
    };
  }
}
