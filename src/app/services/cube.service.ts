import { Injectable } from '@angular/core';
import { ApplicationService } from './application.service';
import { TripService } from './trip.service';

@Injectable({
  providedIn: 'root'
})
export class CubeService {
  private cube: { [explorerId: string]: { [period: string]: number } } = {};

  constructor(
    private applicationService: ApplicationService,
    private tripService: TripService
  ) {}

  async calculateCube(): Promise<void> {
    const [applications, trips] = await Promise.all([
      this.applicationService.getAllApplications(),
      this.tripService.getAllTrips()
    ]);

    const tripMap: { [tripId: string]: any } = {};
    trips.forEach(trip => {
      tripMap[trip.id] = trip;
    });

    this.cube = {};

    applications.forEach(app => {
      if (app.status !== 'accepted') return;
      

      const explorerId = app.explorerId;
      const trip = tripMap[app.tripId];
      if (!trip) return;

      console.log("Application "+ app.status)
      console.log("ExplorerId " + app.explorerId)
      console.log("Fecha " + timestampToDate(app.creationDate))
      console.log("Precio " + trip.price)

      const price = Number(trip.price || 0);
      let creationDate = timestampToDate(app.creationDate);
      const period = this.getPeriod(creationDate.toISOString());

      if (!this.cube[explorerId]) this.cube[explorerId] = {};
      if (!this.cube[explorerId][period]) {
        this.cube[explorerId][period] = 0;
      }
      this.cube[explorerId][period] += price;
    });

  }

  private getPeriod(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();

    const diffMonths = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
    if (diffMonths >= 0 && diffMonths < 36) {
      const m = 1 + diffMonths; 
      return `M${m < 10 ? '0' + m : m}`;
    }
  
    const diffYears = now.getFullYear() - date.getFullYear();
  
    if (
      diffYears >= 0 &&
      diffYears < 3 &&
      (date.getMonth() < now.getMonth() || diffYears > 0)
    ) {
      return `Y0${diffYears + 1}`; 
    }

    return 'OUT_OF_RANGE';
  }
  

  getMoneyByExplorerAndPeriod(explorerId: string, period: string): number {
    if (!this.cube[explorerId]) return 0;
  
    const entries = Object.entries(this.cube[explorerId]);
  
    let maxMonth = 0;
  
    if (period.startsWith('M')) {
      maxMonth = parseInt(period.substring(1));
    } else if (period.startsWith('Y')) {
      const y = parseInt(period.substring(1));
      maxMonth = y * 12;
    }
  
    return entries
      .filter(([key]) => key.startsWith('M'))
      .filter(([key]) => parseInt(key.substring(1)) <= maxMonth)
      .reduce((sum, [, value]) => sum + value, 0);
  }
  
  

  getExplorersByCondition(period: string, operator: string, value: number): string[] {
    const result: string[] = [];
  
    for (const explorerId in this.cube) {
      const amount = this.getMoneyByExplorerAndPeriod(explorerId, period);
      if (this.compare(amount, operator, value)) {
        result.push(explorerId);
      }
    }
    return result;
  }

  private compare(a: number, op: string, b: number): boolean {
    switch (op) {
      case 'equal': return a === b;
      case 'notEqual': return a !== b;
      case 'greaterThan': return a > b;
      case 'greaterThanOrEqual': return a >= b;
      case 'smallerThan': return a < b;
      case 'smallerThanOrEqual': return a <= b;
      default: return false;
    }
  }

  getCube(): any {
    return this.cube;
  }

  public printFullCube() {
  
    for (const explorerId in this.cube) {
      console.log(`Explorer: ${explorerId}`);
      for (const period in this.cube[explorerId]) {
        const amount = this.cube[explorerId][period];
        console.log(`  ${period}: ${amount.toFixed(2)}€`);
      }
      console.log('----------------------------');
    }
  }
}

function timestampToDate(timestamp: { seconds: number; nanoseconds: number }): Date {
  return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1_000_000);
}
