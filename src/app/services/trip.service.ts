import { Injectable } from '@angular/core';
import { Trip } from '../models/trip.model';
import { Firestore, collection, getDocs, getDoc,addDoc, doc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class TripService {
  constructor(private firestore: Firestore) { }

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

      console.log("Trips loaded:", trips);
      return trips;
    } catch (error) {
      console.error("Error fetching trips:", error);
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
}