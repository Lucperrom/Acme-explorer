import { Injectable } from '@angular/core';
import { Trip } from '../models/trip.model';
import { environment } from 'src/environments/environment';
import axios from 'axios';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TripService {

  constructor(private http: HttpClient) { }

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

  getTripById(tripId: string) {
    const url = `${environment.backendApiBaseUrl}/trips/${tripId}`
      // const response = await axios.get(`${environment.backendApiBaseUrl}/trips/${tripId}`);
    const response = this.http.get<Trip>(url);
    return response;
  }
}
