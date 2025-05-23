import { Component, OnInit } from '@angular/core';
import { Trip } from '../../../models/trip.model';
import { TripService } from '../../../services/trip.service';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { MessageService } from 'src/app/services/message.service';
import { AuthService } from 'src/app/services/auth.service';
import { Actor } from 'src/app/models/actor.model';
import { ApplicationService } from 'src/app/services/application.service';

@Component({
  selector: 'app-trip-list',
  templateUrl: './trip-list.component.html',
  styleUrls: ['./trip-list.component.css']
})
export class TripListComponent implements OnInit {
  protected currentActor: Actor | null = null;
  protected trips: Trip[];
  protected trash = faTrash;
  protected filteredTrips: Trip[];
  protected activeRole: string = 'anonymous';
  selectedFilter: string = 'myTrips'; // Default filter renamed to "My Trips"
  tripEditableMap: Map<string, boolean> = new Map();
  tripCancelableMap: Map<string, boolean> = new Map();
  isDarkMode = false;
  loading: boolean = true; // Add loading property

  constructor(private tripService: TripService, private router: Router, private messageService: MessageService, private authService: AuthService, private applicationService: ApplicationService) {
    this.trips = [];
    this.filteredTrips = [];
  }
  
  isCancelled(trip: Trip) {
    return trip.cancelledReason != "";
  }

  isVisible(trip: Trip) {
    if (this.activeRole === 'MANAGER') {
        return !trip.deleted;
    } else if (this.activeRole === 'ADMINISTRATOR') {
        return true;
    } else {
      return !trip.deleted && trip.getTripStatus() !== 'canceled' && trip.getTripStatus() !== 'deleted';
  }
  }

  // isTripEditable(tripId: string): boolean {
  //   return this.tripEditableMap.get(tripId) || false;
  // }

  // isTripCancelable(tripId: string): boolean {
  //   return this.tripCancelableMap.get(tripId) || false;
  // }

  // async isCancelable(trip: Trip): Promise<boolean> {
  //   const timeReason = trip.startDate.getTime() - new Date().getTime() > 7 * 24 * 60 * 60 * 1000;
  //   if (!timeReason || trip.cancelledReason !== "") return false;

  //   try {
  //     const applications = await this.applicationService.getAllApplicationsByTripId(trip.id);
  //     const hasAccepted = applications.some(app => 
  //       app.status.toLowerCase() === 'accepted'
  //     );
  //     console.log("hasAccepted: ", hasAccepted);
  //     return !hasAccepted;
  //   } catch (error) {
  //     console.error('Error checking cancelability:', error);
  //     return false;
  //   }
  // }

  // async checkIfTripIsEditable(trip: Trip) {
  //   const isEditable = await this.isEditable(trip);
  //   this.tripEditableMap.set(trip.id, isEditable);
  //   return isEditable;
  // }

  // async checkIfTripIsCancelable(trip: Trip) {
  //   const isCancelable = await this.isCancelable(trip);
  //   this.tripCancelableMap.set(trip.id, isCancelable);
  //   return isCancelable;
  // }

  // async isEditable(trip: Trip) {
  //   const timeReason = trip.startDate.getTime() - new Date().getTime() > 10 * 24 * 60 * 60 * 1000
  //   if (!timeReason) return false;

  //   try {
  //     const applications = await this.applicationService.getAllApplicationsByTripId(trip.id);
  //     const hasAccepted = applications.some(app => 
  //       app.status.toLowerCase() === 'accepted'
  //     );
  //     console.log("hasAccepted: ", hasAccepted);
  //     return !hasAccepted;
  //   } catch (error) {
  //     console.error('Error checking editability:', error);
  //     return false;
  //   }
  // }

  async ngOnInit(): Promise<void> {
    this.loading = true; // Start loading
    try {
      this.isDarkMode = localStorage.getItem('darkMode') === 'true';
      console.log("Loading trips...");
      const actorData = localStorage.getItem('currentActor');
      this.currentActor = actorData ? JSON.parse(actorData) as Actor : null;
      this.activeRole = this.currentActor?.role || '';

      console.log("Current actor: ", this.activeRole);
      if (this.activeRole === 'MANAGER') {
        this.trips = await this.tripService.getAllTripsByManager(this.currentActor?.email || '');
      } else if (this.activeRole === 'ADMINISTRATOR') {
        this.trips = await this.tripService.getAllTripsAdmin();
      } else {
        this.trips = await this.tripService.getAllTrips();
      }

      this.filteredTrips = [...this.trips];

      // Too expensive in terms of performance
      // for (const trip of this.trips) {
      //   await this.checkIfTripIsEditable(trip);
      //   await this.checkIfTripIsCancelable(trip);
      // }

      this.tripService.searchTerm$.subscribe(term => {
        if (this.selectedFilter === 'myTrips') {
          if (this.activeRole === 'MANAGER') {
            this.tripService.getAllTripsFilteredByManager(term, this.currentActor?.email || '').then((trips: Trip[]) => {
              this.filteredTrips = trips.filter(trip => trip.cancelledReason === "" && !trip.deleted);
            });
          } else if (this.activeRole === 'ADMINISTRATOR') {
            this.tripService.getAllTripsFilteredAdmin(term).then((trips: Trip[]) => {
              this.filteredTrips = trips
            });
          } else {
            this.tripService.getAllTripsFiltered(term).then((trips: Trip[]) => {
              this.filteredTrips = trips.filter(trip => trip.cancelledReason === "" && !trip.deleted);
            });
          }
        } else if (this.selectedFilter === 'myCancelledTrips') {
          if (this.activeRole === 'MANAGER') {
            this.tripService.getAllTripsFilteredByManager(term, this.currentActor?.email || '').then((trips: Trip[]) => {
              this.filteredTrips = trips.filter(trip => trip.cancelledReason && !trip.deleted);
            });
          } else {
            this.tripService.getAllTripsFiltered(term).then((trips: Trip[]) => {
              this.filteredTrips = trips.filter(trip => trip.cancelledReason && !trip.deleted);
            });
          }
        } else if (this.selectedFilter === 'allTrips') {
          this.tripService.getAllTripsFiltered(term).then((trips: Trip[]) => {
            this.filteredTrips = trips.filter(trip => !trip.deleted && trip.cancelledReason === "" && trip.getTripStatus() !== 'expired');
          });
        }
      });
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      this.loading = false; // End loading
    }
  }

  onFilterChange(): void {
    this.tripService.searchTermSubject.next('');
    if (this.selectedFilter === 'myTrips') {
      this.filteredTrips = this.trips.filter(trip => !trip.deleted && trip.cancelledReason === "");
    } else if (this.selectedFilter === 'myCancelledTrips') {
      this.filteredTrips = this.trips.filter(trip => trip.cancelledReason && !trip.deleted);
    } else if (this.selectedFilter === 'allTrips') {
      this.filteredTrips = this.trips.filter(trip => !trip.deleted);
    }
  }

  goToTrip(tripId: string) {
    this.router.navigate(['/trips', tripId]);
  }

  editTrip(tripId: string) {
    this.router.navigate(['/trips/edit', tripId]);
  }

  removeTrip(index:number){
    this.trips[index].deleted = true;
    let msg = $localize `Trip successfully deleted`;
    this.messageService.notifyMessage(msg, "alert alert-success")
  }
}
