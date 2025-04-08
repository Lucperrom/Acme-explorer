import { Component, OnInit } from '@angular/core';
import { Trip } from 'src/app/models/trip.model';
import { TripService } from 'src/app/services/trip.service';
import { ActivatedRoute, Router } from '@angular/router';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { Actor } from 'src/app/models/actor.model';
import { AuthService } from 'src/app/services/auth.service'

@Component({
  selector: 'app-trip-display',
  templateUrl: './trip-display.component.html',
  styleUrls: ['./trip-display.component.css']
})
export class TripDisplayComponent implements OnInit {
  protected trip: Trip;
  protected isSpecial = false;
  protected trash = faTrash;
  protected tripId: string | null = null;
  protected currentActor: Actor | null = null;

  constructor(private tripService: TripService, private route: ActivatedRoute, private authService: AuthService, private router: Router) { 
      this.trip = new Trip();
      this.trip.pictures = ["/assets/images/playa3.jpg"]
      this.trip.title = "megusta"
      console.log("inicializando trip", this.trip);    
    }

  async ngOnInit(): Promise<void> {
    this.tripId = this.route.snapshot.paramMap.get('id');
    if (this.tripId) {
      this.trip = await this.tripService.getTripById(this.tripId);
      this.trip.startDate = new Date(this.trip.startDate);
      this.trip.endDate = new Date(this.trip.endDate);
      console.log("Trip loaded", this.trip);
      this.isSpecial = this.trip.price < 100;
      this.currentActor = this.authService.getCurrentActor();
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

  
  editTrip(tripId: string) {
    this.router.navigate(['/trips/edit', tripId]);
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

  seeForecast(tripId: string) {
    this.router.navigate(['/forecast', tripId]);
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
  getTripId() {
    return this.tripId;
  }
}
