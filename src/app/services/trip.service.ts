import { Injectable } from '@angular/core';
import { Trip } from '../models/trip.model';
import { environment } from 'src/environments/environment';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class TripService {

  constructor() { }

  async getAllTrips(): Promise<Trip[]> {
    try {
      const response = await axios.get(environment.backendApiBaseUrl + '/trips');
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async getTripById(tripId: string): Promise<Trip> {
    try {
      const response = await axios.get(`${environment.backendApiBaseUrl}/trips/${tripId}`);
      return response.data;
    } catch (error) {
      console.log(error);
      return {} as Trip;
    }
  }
}
