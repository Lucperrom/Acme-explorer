import { Injectable } from '@angular/core';
import { Trip } from '../models/trip.model';
import { Location } from '../models/location.model';
import { Firestore, collection, getDocs, getDoc, addDoc, doc } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { MeteoService } from './meteo.service';

@Injectable({
  providedIn: 'root'
})
export class TripService {
  private searchTermSubject = new BehaviorSubject<string>('');
  searchTerm$ = this.searchTermSubject.asObservable();

  constructor(private firestore: Firestore, private meteoService: MeteoService) { }

  getCurrentTripFromDoc(doc: any): Trip {
    const data = doc.data();
    let trip = new Trip();
    trip.id = doc.id; // Asigna el ID del documento
    trip.ticker = data['ticker'];
    trip.title = data['title'];
    trip.description = data['description'];
    trip.price = data['price'];
    trip.requirements = data['requirements'] || []; // Manejo seguro de arrays
    trip.startDate = new Date(data['startDate']);
    trip.endDate = new Date(data['endDate']);
    trip.cancelledReason = data['cancelledReason'] || '';
    trip.deleted = data['deleted'] || false; // Valor predeterminado
    trip.pictures = data['pictures'] || []; // Manejo seguro de imágenes
    trip.managerId = data['managerId'] || ''; // Manejo seguro de ID
    trip.managerName = data['managerName'] || ''; // Manejo seguro de nombre
    trip.createdAt = data['createdAt'] ? new Date(data['createdAt']) : new Date(); // Manejo seguro de fecha
    trip.location = new Location(data['location']); // Use Location model
    return trip;
  }

  async getAllTrips(): Promise<Trip[]> {
    try {
      const tripsRef = collection(this.firestore, 'trips');
      const querySnapshot = await getDocs(tripsRef);

      let trips: Trip[] = [];
      querySnapshot.forEach((doc) => {
        let trip = this.getCurrentTripFromDoc(doc);
        if (!trip.deleted) { // Filtra los viajes eliminados
          trips.push(trip);
        }
      });

      return trips;
    } catch (error) {
      console.error("Error fetching trips:", error);
      return [];
    }
  }

  async getAllTripsByManager(managerId: string): Promise<Trip[]> {
    try {
      const tripsRef = collection(this.firestore, 'trips');
      const querySnapshot = await getDocs(tripsRef);
  
      let trips: Trip[] = [];
      querySnapshot.forEach((doc) => {
        let trip = this.getCurrentTripFromDoc(doc);
        if (trip.managerId === managerId && !trip.deleted) {
          trips.push(trip);
        }
      });
      console.log("Trips for manager:", trips);
      return trips;
    } catch (error) {
      console.error(`Error fetching trips for manager ${managerId}:`, error);
      return [];
    }
  }

  async getTripById(tripId: string): Promise<Trip> {
    try {
      const tripDocRef = doc(this.firestore, 'trips', tripId);
      const tripDocSnap = await getDoc(tripDocRef);

      if (!tripDocSnap.exists()) {
        console.error("No trip found with ID:", tripId);
        return {} as Trip;
      }

      let trip = this.getCurrentTripFromDoc(tripDocSnap);
      console.log("Trip found:", trip);
      return trip;
    } catch (error) {
      console.error("Error fetching trip:", error);
      return {} as Trip;
    }
  }

  setSearchTerm(term: string): void {
    this.searchTermSubject.next(term);
  }

  async createTrip(trip: Object): Promise<string> {
    try {
      const tripRef = collection(this.firestore, 'trips'); // Firestore from AngularFire
      const docRef = await addDoc(tripRef, trip); // ✅ this addDoc now matches your Firestore type
      console.log("Trip created with ID:", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("Error creating trip:", error);
      throw error;
    }
  }

  async getTripWeather(tripId: string): Promise<any> {
    try {
      const trip = await this.getTripById(tripId);
      if (!trip.location) {
        throw new Error('Trip location is missing.');
      }
      return this.meteoService.getForecast(trip.location.latitude, trip.location.longitude);
    } catch (error) {
      console.error("Error fetching trip weather:", error);
      throw error;
    }
  }

  async getAllTripsFiltered(term: string): Promise<Trip[]> {
    try {
      const tripsRef = collection(this.firestore, 'trips');
      const querySnapshot = await getDocs(tripsRef);
  
      let trips: Trip[] = [];
      querySnapshot.forEach((doc) => {
        let trip = this.getCurrentTripFromDoc(doc);
        if (!trip.deleted) { 
          let condicion1 = false;
          let condicion2 = false;
          let condicion3 = false;
          if(trip.ticker != undefined && trip.ticker != null) {
            if(trip.ticker.toLowerCase().includes(term.toLowerCase())){
              condicion1 = true
            }
          }
          if(trip.title != undefined && trip.title != null) {
            if(trip.title.toLowerCase().includes(term.toLowerCase())){
              condicion2 = true
            }
          }
          if(trip.description != undefined && trip.description != null) {
            if(trip.description.toLowerCase().includes(term.toLowerCase())){
              condicion3 = true
            }
          }
          if (condicion1 || condicion2 || condicion3 ){
            trips.push(trip);
          }
        }
      });

      return trips;
    } catch (error) {
      console.error("Error fetching trips:", error);
      return [];
    }
  }

  async getAllTripsFilteredByManager(term: string, managerId: string): Promise<Trip[]> {
    try {
      const tripsRef = collection(this.firestore, 'trips');
      const querySnapshot = await getDocs(tripsRef);

      let trips: Trip[] = [];
      querySnapshot.forEach((doc) => {
        let trip = this.getCurrentTripFromDoc(doc);
        if (trip.managerId === managerId && !trip.deleted) { 
          let condicion1 = false;
          let condicion2 = false;
          let condicion3 = false;

          if (trip.ticker != undefined && trip.ticker != null) {
            if (trip.ticker.toLowerCase().includes(term.toLowerCase())) {
              condicion1 = true;
            }
          }
          if (trip.title != undefined && trip.title != null) {
            if (trip.title.toLowerCase().includes(term.toLowerCase())) {
              condicion2 = true;
            }
          }
          if (trip.description != undefined && trip.description != null) {
            if (trip.description.toLowerCase().includes(term.toLowerCase())) {
              condicion3 = true;
            }
          }

          if (condicion1 || condicion2 || condicion3) {
            trips.push(trip);
          }
        }
      });
      return trips;
    } catch (error) {
      console.error(`Error fetching filtered trips for manager ${managerId}:`, error);
      return [];
    }
  }
}