import { Component, OnInit } from '@angular/core';
import { Trip } from '../../../models/trip.model';
import { TripService } from '../../../services/trip.service';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { MessageService } from 'src/app/services/message.service';
import { AuthService } from 'src/app/services/auth.service'
import { Actor } from 'src/app/models/actor.model';

@Component({
  selector: 'app-trip-list',
  templateUrl: './trip-list.component.html',
  styleUrls: ['./trip-list.component.css']
})
export class TripListComponent implements OnInit {
  protected currentActor: Actor | null = null;
  protected trips: Trip[];
  protected trash = faTrash;
  protected activeRole: string = 'anonymous'
  //no se si esto es cancelled

  constructor(private tripService: TripService, private router: Router, private messageService: MessageService, private authService: AuthService) {
    this.trips = [];
  }
  
  isCancelled(trip: Trip) {
    return trip.cancelledReason != "";
  }

  isCancelable(trip: Trip) {
    return trip.startDate.getTime() - new Date().getTime() > 7 * 24 * 60 * 60 * 1000;
  }

  async ngOnInit(): Promise<void> {
    console.log("Loading trips...");
    this.trips = await this.tripService.getAllTrips();
    console.log("Trips were loaded", this.trips);
    this.authService.loggedInUserSubject.asObservable().subscribe((loggedIn: boolean) => {
      if (loggedIn) {
        this.currentActor = this.authService.getCurrentActor();
        this.activeRole = this.currentActor?.role || 'anonymous';
        console.log(this.currentActor);
      }
    });
  }
  goToTrip(tripId: string) {
    this.router.navigate(['/trips', tripId]);
  }

  editTrip(tripId: string) {
    this.router.navigate(['/trips/edit', tripId]);
  }

  removeTrip(index:number){
    this.trips[index].deleted = true;
    this.messageService.notifyMessage("Item successfully deleted", "alert alert-success")
  }
}
