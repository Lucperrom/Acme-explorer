import { Component, OnInit } from '@angular/core';
import { ApplicationService } from 'src/app/services/application.service';
import { AuthService } from 'src/app/services/auth.service';
import { MessageService } from 'src/app/services/message.service';
import { TripService } from 'src/app/services/trip.service';

@Component({
  selector: 'app-application-list',
  templateUrl: './application-list.component.html',
  styleUrls: ['./application-list.component.css']
})
export class ApplicationListComponent implements OnInit {

  constructor(private applicationService: ApplicationService, private authService: AuthService, private tripService: TripService, private messageService: MessageService) { }

  protected actor: any;
  protected applications: any[] = [];
  protected filteredApplications: any[] = [];
  protected rejectReason: string = '';

  ngOnInit(): void {
    this.actor = this.authService.getCurrentActor();
    console.log("Actor: ", this.actor);
    if (this.actor) {
      this.applicationService.getAllApplicationsByManagerId(this.actor.email).then(applications => {
        this.applications = applications;
        this.filteredApplications = applications; // Inicializa con todas las aplicaciones
        for (let application of this.applications) {
          this.tripService.getTripById(application.tripId).then(trip => {
            application.trip = trip;
          }).catch(error => {
            console.error("Error fetching trip: ", error);
          });
        }
        console.log("Applications: ", this.applications);
      }).catch(error => {
        console.error("Error fetching applications: ", error);
      });
    }
  }

  filterByStatus(status: string): void {
    if (status === 'all') {
      this.filteredApplications = this.applications;
    } else {
      this.filteredApplications = this.applications.filter(application => application.status?.toLowerCase() === status);
    }
  }

  acceptApplication(application: string): void {
    this.applicationService.updateApplicationStatus(application, 'due').then(() => {
      this.refreshApplications();
    }).catch(error => {
      console.error(`Error accepting application:`, error);
    });
  }

  rejectApplication(application: any): void {
    if (!this.rejectReason.trim()) {
      this.messageService.notifyMessage("Please provide a reason for rejection", "alert-danger");
      return;
    }

    const updatedApplication = { ...application, rejectReason: this.rejectReason };
    this.applicationService.updateApplicationStatus(updatedApplication, 'rejected').then(() => {
      this.rejectReason = ''; // Limpia el motivo después de rechazar
      this.refreshApplications();
    }).catch(error => {
      console.error(`Error rejecting application:`, error);
    });
  }

  private refreshApplications(): void {
    if (this.actor) {
      this.applicationService.getAllApplicationsByManagerId(this.actor.email).then(applications => {
        this.applications = applications;
        this.filteredApplications = applications; // Asegura que también se actualicen las aplicaciones filtradas
        for (let application of this.applications) {
          this.tripService.getTripById(application.tripId).then(trip => {
            application.trip = trip;
          }).catch(error => {
            console.error("Error fetching trip: ", error);
          });
        }
        console.log("Applications refreshed: ", this.applications);
      }).catch(error => {
        console.error("Error refreshing applications: ", error);
      });
    }
  }
}
