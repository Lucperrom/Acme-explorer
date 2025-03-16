import { Component, OnInit } from '@angular/core';
import { Trip } from '../../../models/trip.model';
import { TripService } from '../../../services/trip.service';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
@Component({
  selector: 'app-trip-list',
  templateUrl: './trip-list.component.html',
  styleUrls: ['./trip-list.component.css']
})
export class TripListComponent implements OnInit {
  protected trips: Trip[];
  protected trash = faTrash;
  //no se si esto es cancelled

  constructor(private tripService: TripService, private router: Router) {
    this.trips = [];
  }
  
  isCancelled(trip: Trip) {
    return trip.cancelledReason != "";
  }

  async ngOnInit(): Promise<void> {
    console.log("Loading trips...");
    this.trips = await this.tripService.getAllTrips();
    console.log("Trips were loaded", this.trips);
  }
  goToTrip(tripId: string) {
    this.router.navigate(['/trips', tripId]);
  }
}
