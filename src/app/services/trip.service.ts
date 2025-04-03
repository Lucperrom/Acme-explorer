import { Injectable } from '@angular/core';
import { Trip } from '../models/trip.model';
import { Firestore, collection, getDocs, getDoc, doc } from '@angular/fire/firestore';
import { addDoc } from 'firebase/firestore';
import { Router } from '@angular/router';

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

  async createTrip(trip: Trip) {
      return new Promise<any>((resolve, reject) => {
        console.log(this.firestore)
          const tripRef = collection(this.firestore, 'trips');
          addDoc(tripRef, trip).then((docRef) => {
            console.log("Document written with ID: ", docRef.id);
            resolve(trip);
          }).catch((error) => {
            console.error("Error adding document: ", error);
            reject();
          });
        });
    }
}