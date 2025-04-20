import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Sponsorship } from 'src/app/models/sponsorship.model';
import { AuthService } from 'src/app/services/auth.service';
import { MessageService } from 'src/app/services/message.service';
import { SponsorshipService } from 'src/app/services/sponsorship.service';
import { TripService } from 'src/app/services/trip.service';

@Component({
  selector: 'app-sponsorship-list',
  templateUrl: './sponsorship-list.component.html',
  styleUrls: ['./sponsorship-list.component.css']
})
export class SponsorshipListComponent implements OnInit {

  public actor: any;
  public sponsorships: any[] = [];
  public filteredSponsorships: any[] = [];
  sponsorshipPayable: Map<String, boolean> = new Map();
  isDarkMode = false;


  constructor(
    private sponsorshipService: SponsorshipService,
    private authService: AuthService,
    private tripService: TripService,
    private messageService: MessageService,
    private router: Router
  ) { }

  payable(sponsorship: Sponsorship): void{
    const payable = sponsorship.rate>0 && !sponsorship.payed
    console.log("Sponsorship: ", sponsorship.rate, sponsorship.payed);
    console.log("Payable: ", payable);
    this.sponsorshipPayable.set(sponsorship.id, payable);
  }

  isPayable(sponsorshipId: string): boolean{
    return this.sponsorshipPayable.get(sponsorshipId) || false;
  }


  ngOnInit(): void {
    this.isDarkMode = localStorage.getItem('darkMode') === 'true';
    this.actor = this.authService.getCurrentActor();
    console.log("Actor: ", this.actor);

    if (this.actor) {
      if (this.actor.role.toLowerCase() === 'sponsor') {
        this.sponsorshipService.getAllSponsorshipsBySponsorId(this.actor.email)
          .then((sponsorships) => {
            this.sponsorships = sponsorships;
            this.filteredSponsorships = sponsorships;
            for (const sponsorship of this.sponsorships) {
              this.payable(sponsorship);
            }
          })
          .catch((error) => {
            console.error("Error fetching sponsorships: ", error);
            let msg = $localize `Error fetching sponsorships for sponsor.`;
            this.messageService.notifyMessage(msg,"alert-danger");
          });

      } else {
        this.sponsorshipService.getAllSponsorships()
          .then((sponsorships) => {
            this.sponsorships = sponsorships;
            this.filteredSponsorships = sponsorships;
          })
          .catch((error) => {
            console.error("Error fetching sponsorships: ", error);
            let msg = $localize `Error fetching sponsorships for trips.`;
            this.messageService.notifyMessage(msg, "alert-danger");
          });
      }
    }
  }

  goToSponsorship(sponsorshipId: string) {
    this.router.navigate(['/sponsorships', sponsorshipId]);
  }

  editSponsorship(sponsorshipId: string) {
    this.router.navigate(['/sponsorships/edit', sponsorshipId]);
  }

  paySponsorship(sponsorship: Sponsorship): void {
    this.router.navigate(['/checkout'], { queryParams: { total: sponsorship.rate, id:sponsorship.id } });
  }


  removeSponsorship(sponsorshipId: string): void {
    this.sponsorshipService.removeSponsorship(sponsorshipId).then(() => {
      let msg = $localize `Sponsorship successfully deleted`;
      this.messageService.notifyMessage(msg, "alert alert-success");
      
      // Actualiza el listado de sponsorships
      this.loadSponsorships();
    }).catch((error) => {
      let msg = $localize `Error deleting sponsorship`;
      this.messageService.notifyMessage(msg, "alert alert-danger");
      console.error("Error deleting sponsorship:", error);
    });
  }
  
  // Método para cargar los sponsorships nuevamente
  loadSponsorships(): void {
    this.sponsorshipService.getAllSponsorshipsBySponsorId(this.actor.email).then((sponsorships) => {
      // Asumiendo que tienes una variable en tu componente que almacena los sponsorships
      this.filteredSponsorships = sponsorships;
    }).catch((error) => {
      console.error("Error loading sponsorships:", error);
    });
  }
}
