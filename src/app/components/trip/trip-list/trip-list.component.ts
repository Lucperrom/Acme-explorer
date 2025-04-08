import { Component, OnInit } from '@angular/core';
import { Trip } from '../../../models/trip.model';
import { TripService } from '../../../services/trip.service';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { MessageService } from 'src/app/services/message.service';
import { AuthService } from 'src/app/services/auth.service';
import { Actor } from 'src/app/models/actor.model';
@Component({
  selector: 'app-trip-list',
  templateUrl: './trip-list.component.html',
  styleUrls: ['./trip-list.component.css']
})
export class TripListComponent implements OnInit {
  protected trips: Trip[];
  protected trash = faTrash;
  protected filteredTrips: Trip[];
  protected currentActor: Actor | null = null;
  protected activeRole: string = 'anonymous';
  selectedFilter: string = 'all';



  constructor(private tripService: TripService, private router: Router, private messageService: MessageService, private authService: AuthService) {
    this.trips = [];
    this.filteredTrips = [];

  }
  
  isCancelled(trip: Trip) {
    return trip.cancelledReason != "";
  }

  isVisible(trip: Trip) {
    if(this.activeRole === 'MANAGER'){
      return !trip.deleted;
    }else{
      return !trip.deleted && trip.cancelledReason === "";
    }

  }

  async ngOnInit(): Promise<void> {
    console.log("Loading trips...");
    const actorData = localStorage.getItem('currentActor');
    this.currentActor = actorData ? JSON.parse(actorData) as Actor : null;
    this.activeRole = this.currentActor?.role || '';
    if (this.activeRole === 'MANAGER') {
      //Se usa con el email temporalmente
      this.trips = await this.tripService.getAllTripsByManager(this.currentActor?.email || '');
      console.log("tripsssss: " + this.trips);
    } else {
      this.trips = await this.tripService.getAllTrips();
    }
  
    this.filteredTrips = [...this.trips]; 
  
    this.tripService.searchTerm$.subscribe(term => {
      if (this.activeRole === 'MANAGER') {
        this.tripService.getAllTripsFilteredByManager(term, this.currentActor?.email || '').then((trips: Trip[]) => {
          this.filteredTrips = trips.filter(trip => trip.cancelledReason === "");
        });
      } else {
        this.tripService.getAllTripsFiltered(term).then((trips: Trip[]) => {
          this.filteredTrips = trips.filter(trip => trip.cancelledReason === "");
        });
      }
    });
  }

  onFilterChange(): void {
    if (this.selectedFilter === 'all') {
      this.filteredTrips = this.trips.filter(trip => !trip.deleted && trip.cancelledReason === "");
    } else if (this.selectedFilter === 'cancelled') {
      this.filteredTrips = this.trips.filter(trip => trip.cancelledReason && !trip.deleted);
    }
  }

  goToTrip(tripId: string) {
    this.router.navigate(['/trips', tripId]);
  }

  removeTrip(index:number){
    this.trips[index].deleted = true;
    this.messageService.notifyMessage("Item successfully deleted", "alert alert-success")
  }
}
