import { Injectable } from '@angular/core';
import { TripService } from './trip.service';
import { ApplicationService } from './application.service';


@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private tripService: TripService, private applicationService: ApplicationService) { }

  async getTripStatistics(): Promise<any> {
    const trips = await this.tripService.getAllTrips();
    const tripsPerManager = trips.reduce((acc: { [key: string]: number }, trip) => {
      acc[trip.managerId] = (acc[trip.managerId] || 0) + 1;
      return acc;
    }, {});

    const values = Object.values(tripsPerManager);

    const average = values.reduce((sum, val) => sum + val, 0) / values.length || 0;
    const minimum = Math.min(...values) || 0;
    const maximum = Math.max(...values) || 0;
    const stdDeviation = Math.sqrt(
      values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / values.length || 0
    );

    return {
      average,
      minimum,
      maximum,
      stdDeviation,
    };
  }

  
  async getApplicationStatistics(): Promise<any> {
    const applications = await this.applicationService.getAllApplications();
    const applicationsPerTrip = applications.reduce((acc: { [key: string]: number }, application) => {
      acc[application.tripId] = (acc[application.tripId] || 0) + 1;
      return acc;
    }, {});

    const values = Object.values(applicationsPerTrip);

    const average = values.reduce((sum, val) => sum + val, 0) / values.length || 0;
    const minimum = Math.min(...values) || 0;
    const maximum = Math.max(...values) || 0;
    const stdDeviation = Math.sqrt(
      values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / values.length || 0
    );

    return {
      average,
      minimum,
      maximum,
      stdDeviation,
    };
  }
    

  async getPriceStatistics(): Promise<any> {
    const trips = await this.tripService.getAllTrips();
    const prices = trips.map(trip => Number(trip.price) || 0);    
    const average = prices.reduce((sum, price) => sum + price, 0) / prices.length || 0;
    const minimum = Math.min(...prices) || 0;
    const maximum = Math.max(...prices) || 0;
    const stdDeviation = Math.sqrt(
      prices.reduce((sum, price) => sum + Math.pow(price - average, 2), 0) / prices.length || 0
    );

    return {
      average,
      minimum,
      maximum,
      stdDeviation,
    };
  }

  
  async getApplicationsByStatus(): Promise<any> {
    const applications = await this.applicationService.getAllApplications();

    const applicationsByStatus = applications.reduce((acc: { [key: string]: number }, application) => {
      const status = application.status.toLowerCase() || 'UNKNOWN';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return applicationsByStatus;
  }
  
  
}