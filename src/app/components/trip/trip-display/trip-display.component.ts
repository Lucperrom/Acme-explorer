import { Component, OnInit } from '@angular/core';
import { Trip } from 'src/app/models/trip.model';
import { TripService } from 'src/app/services/trip.service';
import { ActivatedRoute } from '@angular/router';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { ApplicationService } from 'src/app/services/application.service';
import { FormControl, FormGroup, NgForm } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { MessageService } from 'src/app/services/message.service';

@Component({
  selector: 'app-trip-display',
  templateUrl: './trip-display.component.html',
  styleUrls: ['./trip-display.component.css']
})
export class TripDisplayComponent implements OnInit {
  protected trip: Trip;
  protected isSpecial = false;
  protected trash = faTrash;
  protected tripId: string = '';
  protected actor: any;
  hasAppliedFlag = false;
  isManager = false;

  constructor(
    private tripService: TripService, 
    private route: ActivatedRoute, 
    private applicationService: ApplicationService, 
    private authService: AuthService,
    private messageService: MessageService
  ) { 
    this.trip = new Trip();
    this.trip.pictures = ["/assets/images/playa3.jpg"]
    this.trip.title = "megusta"
    console.log("inicializando trip", this.trip);
  }

  async ngOnInit(): Promise<void> {
    this.tripId = this.route.snapshot.paramMap.get('id') || '';
    if (this.tripId) {
      this.trip = await this.tripService.getTripById(this.tripId);
      this.trip.startDate = new Date(this.trip.startDate);
      this.trip.endDate = new Date(this.trip.endDate);
      console.log("Trip loaded", this.trip);
      this.isSpecial = this.trip.price < 100;
      
    }

    this.actor = this.authService.getCurrentActor();

    if (this.actor?.email && this.tripId) {
      this.hasAppliedFlag = await this.applicationService.hasApplied(this.actor.email, this.tripId);
      this.isManager = this.actor.role.toLowerCase() === 'manager';
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
  getTripId() {
    return this.tripId;
  }

  hasApplied() {
    return this.applicationService.hasApplied(this.actor?.email, this.tripId);
  }

  onApplicationSubmit(f: NgForm) {
    try {
      const comments = f.value.comments;

      this.applicationService.createApplication({ managerId: this.trip.managerId, explorerId: this.actor?.email, tripId: this.tripId, status: "pending", creationDate: new Date(), rejectionReason: "", comments})
        .then((response) => {
          console.log('Application created successfully:', response);
          this.messageService.notifyMessage('Application created successfully', 'alert-success');
        })
        .catch((error) => {
          console.error('Error creating application:', error);
          this.messageService.notifyMessage('Error creating application', 'alert-danger');
        });
    }
    catch (error) {
      console.error('Error submitting form:', error);
      // Handle error, e.g., show an error message
    }
  }
}
