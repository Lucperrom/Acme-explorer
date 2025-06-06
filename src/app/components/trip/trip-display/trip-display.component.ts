import { Component, OnInit } from '@angular/core';
import { Trip } from 'src/app/models/trip.model';
import { TripService } from 'src/app/services/trip.service';
import { ActivatedRoute, Router } from '@angular/router';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { Actor } from 'src/app/models/actor.model';
import { ApplicationService } from 'src/app/services/application.service';
import { NgForm } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { MessageService } from 'src/app/services/message.service';
import { SponsorshipService } from 'src/app/services/sponsorship.service';
import { Sponsorship } from 'src/app/models/sponsorship.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SavedTripsService, SavedList } from 'src/app/services/saved-trips.service';
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
  protected sponsorhips: Sponsorship[] = [];
  protected filteredSponsorships: Sponsorship[] = [];
  showCancelInput = false;
  hasAppliedFlag = false;
  hasSponsorFlag = false;
  isManager = false;
  cancelReason = "";
  countdown: string = '';
  tripEditable: boolean = true;
  tripCancelable: boolean = true;
  tripLoaded: boolean = false;
  isDarkMode = false;
  loading: boolean = true; // Add loading property
  
  constructor(
    private tripService: TripService, 
    private savedTripsService: SavedTripsService,
    private route: ActivatedRoute, 
    private applicationService: ApplicationService, 
    private authService: AuthService,
    private messageService: MessageService,
    private router: Router,
    private sponsorshipService: SponsorshipService,
    private modalService: NgbModal
  ) { 
    this.trip = new Trip();
    this.trip.pictures = ["/assets/images/playa3.jpg"];
    this.trip.title = "megusta";
  }

  async ngOnInit(): Promise<void> {
    this.loading = true; // Start loading
    try {
      this.isDarkMode = localStorage.getItem('darkMode') === 'true';
      this.tripId = this.route.snapshot.paramMap.get('id') || '';
      if (this.tripId) {
        this.startCountdown();
        this.trip = await this.tripService.getTripById(this.tripId);
        console.log("Trip: ", this.trip);
        if (!this.trip.ticker) {
          this.router.navigate(['/not-found']);
        }
        this.sponsorhips = await this.sponsorshipService.getAllSponsorshipsByTripId(this.trip.ticker);
        this.filteredSponsorships = this.sponsorhips.filter(sponsorhip => sponsorhip.payed);
        this.trip.startDate = new Date(this.trip.startDate);
        this.trip.endDate = new Date(this.trip.endDate);
        this.isSpecial = this.trip.price < 100;
        this.currentActor = this.authService.getCurrentActor();
        
        if (this.currentActor?.email && this.tripId) {
          this.hasAppliedFlag = await this.applicationService.hasApplied(this.currentActor.email, this.tripId);
          this.isManager = this.currentActor.role.toLowerCase() === 'manager';
        }
        if (this.currentActor?.email && this.trip.ticker) {
          this.hasSponsorFlag = await this.sponsorshipService.hasSponsor(this.currentActor.email, this.trip.ticker);
        }
        
        // Calcular si el viaje es cancelable al cargar la página
        this.checkIfTripIsEditable(this.trip);
        this.checkIfTripIsCancelable(this.trip);
        this.tripLoaded = true; // Indica que el viaje ha sido cargado
      }
    } catch (error) {
      console.error('Error loading trip:', error);
    } finally {
      this.loading = false; // End loading
    }
  }

  startCountdown(): void {
    const start = new Date(this.trip.startDate).getTime();
  
    const interval = setInterval(() => {
      const distance =  this.trip.startDate.getTime() - new Date().getTime();
  
      if (distance < 0) {
        let msg = $localize `The trip has already started`;
        this.countdown = msg;
        clearInterval(interval);
        return;
      }
  
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
  
      this.countdown = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }, 1000);
  }

  async checkIfTripIsEditable(trip: Trip) {
    this.tripEditable = await this.isEditable(trip);
  }

  async checkIfTripIsCancelable(trip: Trip) {
    this.tripCancelable = await this.isCancelable(trip);
  }

  cancelTrip(trip: Trip, reason: string) {
    const plainTrip = {
      cancelledReason: reason
    };
  
    this.tripService.updateTrip(trip.id, plainTrip).then(() => {
      let msg = $localize `Trip cancelled successfully`;
      this.messageService.notifyMessage(msg, 'alert-success');
      this.router.navigate(['/trips']);
    }).catch((error) => {
      let msg = $localize `Error cancelling trip`;
      this.messageService.notifyMessage(msg, 'alert-danger');
      console.error('Error canceling trip:', error);
    });
  }
  

  async isCancelable(trip: Trip): Promise<boolean>{
    const timeReason = trip.startDate.getTime() - new Date().getTime() > 7 * 24 * 60 * 60 * 1000;
    if (!timeReason || trip.cancelledReason !== "") return false;

    try {
      const applications = await this.applicationService.getAllApplicationsByTripId(trip.id);
      const hasAccepted = applications.some(app => 
        app.status.toLowerCase() === 'accepted'
      );
      console.log("hasAccepted: ", hasAccepted);
      return !hasAccepted;
    } catch (error) {
      console.error('Error checking cancelability:', error);
      return false;
    }
  }
  
  getFontColor() {
    return this.trip.price >= 100 ? 'red' : 'black';
  }

  editTrip(tripId: string) {
    this.router.navigate(['/trips/edit', tripId]);
  }

  openLink(link: string): void {
    if (link) {
      window.open(link, '_blank');
    }
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

  async isEditable(trip: Trip): Promise<boolean> {
    const timeReason = trip.startDate.getTime() - new Date().getTime() > 10 * 24 * 60 * 60 * 1000;
    if (!timeReason) return false;

    try {
      const applications = await this.applicationService.getAllApplicationsByTripId(trip.id);
      const hasAccepted = applications.some(app => 
        app.status.toLowerCase() === 'accepted'
      );
      console.log("hasAccepted: ", hasAccepted);
      return !hasAccepted;
    } catch (error) {
      console.error('Error checking cancelability:', error);
      return false;
    }
  }

  async deleteTrip(): Promise<void> {
    if (!this.tripId) {
      let msg = $localize `You cannot delete a trip that does not exist`;
      this.messageService.notifyMessage(msg, 'alert-danger');
      return;
    }

    let msg = $localize `Are you sure you want to delete this trip?`;
    if (confirm(msg)) {
      try {
        await this.tripService.updateTrip(this.tripId, {
          deleted: true
        });
        
        let msg = $localize `Trip deleted successfully`;
        this.messageService.notifyMessage(msg, 'alert-success');
        // Redireccionar a la lista de viajes
        this.router.navigate(['/trips']);
      } catch (error) {
        let msg = $localize `Error deleting trip`;
        this.messageService.notifyMessage(msg, 'alert-danger');
        console.error('Error al eliminar el viaje:', error);
      }
    }
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
    return this.applicationService.hasApplied(this.currentActor?.email, this.tripId);
  }

  hasSponsor() {
    return this.sponsorshipService.hasSponsor(this.currentActor?.email, this.trip.ticker);
  }

  sponsorTrip(tripTicker: string) {
    this.router.navigate(['/sponsorships/create', tripTicker]);  
  }

  onApplicationSubmit(f: NgForm) {
    try {
      const comments = f.value.comments;

      this.applicationService.createApplication({ managerId: this.trip.managerId, explorerId: this.currentActor?.email, tripId: this.tripId, status: "pending", creationDate: new Date(), rejectionReason: "", comments})
        .then((response) => {
          this.hasAppliedFlag = true;
          let msg = $localize `Application created successfully`;
          this.messageService.notifyMessage(msg, 'alert-success');
        })
        .catch((error) => {
          console.error('Error creating application:', error);
          let msg = $localize `Error creating application`;
          this.messageService.notifyMessage(msg, 'alert-danger');
        });
    }
    catch (error) {
      console.error('Error submitting form:', error);
    }
  }

  onListSelected(list: SavedList): void {
    if (this.tripId) {
      this.savedTripsService.addTripToList(this.tripId, list.id)
        .then(() => {
          this.messageService.notifyMessage('Trip added to list successfully', 'alert-success');
        })
        .catch((error) => {
          console.error('Error adding trip to list:', error);
          this.messageService.notifyMessage('Error adding trip to list', 'alert-danger');
        });
    }
  }

}