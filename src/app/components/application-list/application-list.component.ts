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

  public actor: any;
  public applications: any[] = [];
  public filteredApplications: any[] = [];
  public rejectReason: string = '';
  public tripTitles: string[] = [];
  public selectedTripTitle: string = 'all';
  public selectedStatus: string = 'all'; // Agrega una propiedad para almacenar el estado seleccionado
  isDarkMode = false;

  ngOnInit(): void {
    this.isDarkMode = localStorage.getItem('darkMode') === 'true';
    this.actor = this.authService.getCurrentActor();
    console.log("Actor: ", this.actor);
    if (this.actor) {
      const fetchApplications = this.actor.role.toLowerCase() === 'explorer'
        ? this.applicationService.getAllApplicationsByExplorerId(this.actor.email)
        : this.applicationService.getAllApplicationsByManagerId(this.actor.email);

      fetchApplications.then(applications => {
        this.applications = applications;
        this.filteredApplications = applications; // Inicializa con todas las aplicaciones
        const tripTitleSet = new Set<string>(); // Usamos un Set para evitar duplicados
        const tripPromises = this.applications.map(application => {
          if (!application.trip) { // Evita llamadas duplicadas si el viaje ya está asignado
            return this.tripService.getTripById(application.tripId).then(trip => {
              application.trip = trip;
              if (this.actor.role.toLowerCase() === 'manager') {
                tripTitleSet.add(trip.title); // Agrega el título del viaje al Set
              }
            }).catch(error => {
              console.error("Error fetching trip: ", error);
            });
          }
          return Promise.resolve();
        });

        Promise.all(tripPromises).then(() => {
          this.tripTitles = Array.from(tripTitleSet); // Convierte el Set a un array
          console.log("Trip titles loaded:", this.tripTitles);
        });
      }).catch(error => {
        console.error("Error fetching applications: ", error);
      });
    }
  }

  filterApplications(): void {
    this.filteredApplications = this.applications.filter(application => {
      const matchesStatus = this.selectedStatus === 'all' || application.status?.toLowerCase() === this.selectedStatus.toLowerCase();
      const matchesTripTitle = this.selectedTripTitle === 'all' || application.trip?.title === this.selectedTripTitle;
      return matchesStatus && matchesTripTitle; // Combina ambos filtros
    });
  }

  filterByStatus(status: string): void {
    this.selectedStatus = status; // Actualiza el estado seleccionado
    this.filterApplications(); // Aplica el filtro combinado
  }

  filterByTripTitle(): void {
    this.filterApplications(); // Aplica el filtro combinado
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

  payForApplication(application: any): void {
    if (this.actor.role.toLowerCase() !== 'explorer') {
      console.error("Only explorers can pay for applications.");
      return;
    }

    this.applicationService.updateApplicationStatus(application, 'accepted').then(() => {
      this.messageService.notifyMessage("Application successfully paid and accepted!", "alert-success");
      this.refreshApplications();
    }).catch(error => {
      console.error(`Error paying for application:`, error);
    });
  }

  public refreshApplications(): void {
    if (this.actor) {
      const fetchApplications = this.actor.role.toLowerCase() === 'explorer'
        ? this.applicationService.getAllApplicationsByExplorerId(this.actor.email)
        : this.applicationService.getAllApplicationsByManagerId(this.actor.email);

      fetchApplications.then(applications => {
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
