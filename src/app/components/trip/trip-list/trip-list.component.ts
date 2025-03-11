import { Component, OnInit } from '@angular/core';
import { Trip } from '../../../models/trip.model';
import { TripService } from '../../../services/trip.service';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-trip-list',
  templateUrl: './trip-list.component.html',
  styleUrls: ['./trip-list.component.css']
})
export class TripListComponent implements OnInit {
  protected trips: Trip[];
  protected trash = faTrash;
  //no se si esto es cancelled

  constructor (private tripService: TripService) {
    this.trips = this.tripService.createTrips();
  }
  

  isCancelled(trip: Trip) {
    return trip.cancelledReason != "";
  }

  ngOnInit(): void {
  }

}
