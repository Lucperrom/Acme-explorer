import { Component, OnInit } from '@angular/core';
import { Trip } from 'src/app/models/trip.model';
import { TripService } from 'src/app/services/trip.service';
import { ActivatedRoute } from '@angular/router';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-trip-display',
  templateUrl: './trip-display.component.html',
  styleUrls: ['./trip-display.component.css']
})
export class TripDisplayComponent implements OnInit {
  protected trip: Trip;
  protected isSpecial = false;
  protected trash = faTrash;

  constructor(private tripService: TripService, private route: ActivatedRoute) { 
    this.trip = new Trip();
    this.trip.pictures = ["/assets/images/playa3.jpg"]
    this.trip.title = "megusta"
    console.log("inicializando trip", this.trip);
  }

  async ngOnInit(): Promise<void> {
    const tripId = this.route.snapshot.paramMap.get('id');
    if (tripId) {
      this.trip = await this.tripService.getTripById(tripId);
      this.trip.startDate = new Date(this.trip.startDate);
      this.trip.endDate = new Date(this.trip.endDate);
      console.log("Trip loaded", this.trip);
      this.isSpecial = this.trip.price < 100;
    }
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
}
