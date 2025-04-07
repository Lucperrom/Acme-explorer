import { Component, OnInit } from '@angular/core';
import { Trip } from '../../../models/trip.model';
import { TripService } from '../../../services/trip.service';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { MessageService } from 'src/app/services/message.service';
@Component({
  selector: 'app-trip-list',
  templateUrl: './trip-list.component.html',
  styleUrls: ['./trip-list.component.css']
})
export class TripListComponent implements OnInit {
  protected trips: Trip[];
  protected trash = faTrash;
  protected filteredTrips: Trip[];

  //no se si esto es cancelled

  constructor(private tripService: TripService, private router: Router, private messageService: MessageService) {
    this.trips = [];
    this.filteredTrips = [];
  }
  
  isCancelled(trip: Trip) {
    return trip.cancelledReason != "";
  }

  async ngOnInit(): Promise<void> {
    console.log("Loading trips...");
    this.trips = await this.tripService.getAllTrips();
    console.log("Trips were loaded", this.trips);
    this.filteredTrips = [...this.trips]; 
    this.tripService.searchTerm$.subscribe(term => {
      this.tripService.getAllTripsFiltered(term).then((trips: Trip[]) => {
        this.filteredTrips = trips; 
      } );
    });

  }
  goToTrip(tripId: string) {
    this.router.navigate(['/trips', tripId]);
  }

  removeTrip(index:number){
    this.trips[index].deleted = true;
    this.messageService.notifyMessage("Item successfully deleted", "alert alert-success")
  }
}
