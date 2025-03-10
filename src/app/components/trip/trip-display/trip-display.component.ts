import { Component, OnInit } from '@angular/core';
import { Trip } from 'src/app/models/trip.model';
import {faTrash} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-trip-display',
  templateUrl: './trip-display.component.html',
  styleUrls: ['./trip-display.component.css']
})
export class TripDisplayComponent implements OnInit {
  protected trip: Trip;
  protected isSpecial = false;
  protected trash = faTrash;

  constructor() { 
    this.trip = new Trip();
    this.trip.title = "Trip to the beach";
    this.trip.description = "A trip to the beach to relax";
    this.trip.startDate = new Date('2025-03-18');
    this.trip.endDate = new Date('2025-03-20');
    this.trip.price = 100;
    this.trip.destinity = "Valencia";
    this.isSpecial = true;
    this.trip.cancelledReason = "";
    this.trip.pictures = ['../../../../assets/playa1.jpg','../../../../assets/playa2.jpg','../../../../assets/playa3.jpg'];
  }

  cancelTrip() {
    this.trip.cancelledReason = "";
  }

  isCancelled() {
    return this.trip.cancelledReason != "";
  }
  
  getFontColor() {
    return this.trip.price >= 100 ? 'red' : 'black';
  }

  getCurrentStyles() {
    let deal = this.trip.price <= 100
    let currentStyles = {
      'font-weight': deal ? 'bold' : 'normal',
      'font-size': deal ? '24px' : '12px',
      'color': deal ? 'green' : 'red'
    };
    return currentStyles;
  }

  onPriceChange() {
    this.isSpecial = Number(this.trip.price) >= 0
    && this.trip.price < 100;
  }

  isCancelable() {
    return this.trip.startDate.getTime() - new Date().getTime() > 7 * 24 * 60 * 60 * 1000;
  }

  getName() {
    return this.trip.title;
  }
  getDescription() {
    return this.trip.description;
  }
  getStartDate() {
    return this.trip.startDate;
  }
  getEndDate() {
    return this.trip.endDate;
  }
  getPrice() {
    return this.trip.price;
  }
  getOrigin() {
    return this.trip.origin;
  }
  getDestinity() {
    return this.trip.destinity;
  }


  ngOnInit(): void {
  }

}
