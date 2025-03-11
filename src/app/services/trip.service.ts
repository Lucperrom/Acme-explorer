import { Injectable } from '@angular/core';
import { Trip } from '../models/trip.model';

@Injectable({
  providedIn: 'root'
})
export class TripService {

  constructor() { }

  createTrips(): Trip[]{
    let trip : Trip;
    let trips : Trip[];
  
// Trip 1
trips = new Array();
trip = new Trip();
trip.title = "Trip to the beach"; 
trip.description = "Enjoy the sun and the beach";
trip.startDate = new Date("2021-12-01");
trip.endDate = new Date("2021-12-15");
trip.price = 1000;
trip.destinity = "Mar del Plata";
trip.requirements = ["Sunscreen", "Swimsuit", "Towel"];
trip.ticker = "TRP-0001";
trip.pictures = ['../../assets/images/playa1.jpg','../../assets/images/playa2.jpg','../../assets/images/playa3.jpg'];
trips.push(trip);

// Trip 2
trips = new Array();
trip = new Trip();
trip.title = "Trip to the beach"; 
trip.description = "Enjoy the sun and the beach";
trip.startDate = new Date("2021-12-01");
trip.endDate = new Date("2021-12-15");
trip.price = 1000;
trip.destinity = "Mar del Plata";
trip.requirements = ["Sunscreen", "Swimsuit", "Towel"];
trip.ticker = "TRP-0001";
trips.push(trip);

// Trip 3
trip = new Trip();
trip.title = "Trip to the snow"; 
trip.description = "Enjoy the snow";
trip.startDate = new Date("2021-15-02");
trip.endDate = new Date("2021-13-16");
trip.price = 15000;
trip.destinity = "Mar del oro";
trip.requirements = ["Motorbike helmet", "Fur coat", "Towel"];
trip.ticker = "TRP-0003";
trip.pictures = ['../../assets/images/playa1.jpg','../../assets/images/playa2.jpg','../../assets/images/playa3.jpg'];
trips.push(trip);

// Trip 4
trip = new Trip();
trip.title = "Trip to Paris"; 
trip.description = "Enjoy the baguettes";
trip.startDate = new Date("2021-15-02");
trip.endDate = new Date("2021-13-16"); // Pero esto tb lo habra que hacer no?
trip.price = 15000;
trip.destinity = "Paris";
trip.requirements = ["French mostache", "baguette"];
trip.ticker = "TRP-0004";
trip.pictures = ['../../assets/images/playa1.jpg','../../assets/images/playa2.jpg','../../assets/images/playa3.jpg'];
trips.push(trip);

// Trip 5
trip = new Trip();
trip.title = "Trip to Berlin"; 
trip.description = "Enjoy the wall";
trip.startDate = new Date("2021-15-02");
trip.endDate = new Date("2021-13-16");
trip.price = 15000;
trip.destinity = "Berlin";
trip.requirements = ["Sausages", "Techno", "Beer"];
trip.ticker = "TRP-0005";
trip.pictures = ['../../assets/images/playa1.jpg','../../assets/images/playa2.jpg','../../assets/images/playa3.jpg'];
trips.push(trip);

return trips;
  }
}
