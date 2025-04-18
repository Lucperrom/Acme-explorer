import { Injectable } from '@angular/core';
import { Firestore, collection, doc, getDoc, setDoc, query, where, getDocs, collectionData } from '@angular/fire/firestore';
import { Trip } from '../models/trip.model';
import { Finder } from '../models/finder.model';
import { TripService } from './trip.service';

@Injectable({
  providedIn: 'root'
})
export class FinderService {
  constructor(private firestore: Firestore, private tripService : TripService) {}

  private finderPath(actorId: string) {
    return doc(this.firestore, `finders/${actorId}`);
  }

  async saveFinder(finder: Finder): Promise<void> {
    if (!finder.actorId) {
      throw new Error('Finder must have an actorId');
    }
    const finderRef = doc(this.firestore, 'finders', finder.actorId);
    await setDoc(finderRef, {
      keyWord: finder.keyWord,
      minimumPrice: finder.minimumPrice,
      maximumPrice: finder.maximumPrice,
      startingDate: finder.startingDate ? finder.startingDate.toISOString() : null,
      endDate: finder.endDate ? finder.endDate.toISOString() : null,
      queryTime: new Date().toISOString(),
      cacheTTL: finder.cacheTTL,
      maxResults: finder.maxResults,
      actorId: finder.actorId
    });
  }

  async getFinderByActorId(actorId: string ): Promise<Finder | null> {
    const ref = this.finderPath(actorId);
    const snapshot = await getDoc(ref);

    if (snapshot.exists()) {
      const data = snapshot.data();
      return new Finder({
        ...data,
        startingDate: data['startingDate'] ? new Date(data['startingDate']) : null,
        endDate: data['endDate'] ? new Date(data['endDate']) : null
      });
    } else {
      return null;
    }
  }

  async searchTrips(finder: Finder): Promise<Trip[]> {
    const tripsRef = collection(this.firestore, 'trips');
    const snapshot = await getDocs(tripsRef);

    let trips: Trip[] = [];

    snapshot.forEach(doc => {
      const trip = this.tripService.getCurrentTripFromDoc(doc); 
      if (!trip.deleted) {
        trips.push(trip);
      }
    });

    if (finder.keyWord?.trim()) {
      const keyWord = finder.keyWord.toLowerCase();
      trips = trips.filter(trip => {
        return (
          (trip.ticker && trip.ticker.toLowerCase().includes(keyWord)) ||
          (trip.title && trip.title.toLowerCase().includes(keyWord)) ||
          (trip.description && trip.description.toLowerCase().includes(keyWord))
        );
      });
    }
    console.log(trips);


    trips = trips.filter(trip => {
      let priceOK = true;
      //al parecer el 0 lo detecta como vacio
      if(finder.minimumPrice == 0){
        finder.minimumPrice = 0.01;
      }
      if(finder.maximumPrice && finder.minimumPrice){
        priceOK = trip.price >= finder.minimumPrice && trip.price <= finder.maximumPrice;
      }
      let startDateOK = true;
      if(finder.startingDate ){
        startDateOK = !finder.startingDate || new Date(trip.startDate) >= new Date(finder.startingDate);
      }
      let endDateOK = true;
      if(finder.endDate ){
        endDateOK = !finder.endDate || new Date(trip.endDate) <= new Date(finder.endDate);
      }
      return priceOK && startDateOK && endDateOK;
    });

    return trips.slice(0, finder.maxResults);
  }
}
