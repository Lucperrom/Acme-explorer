import { Component, OnInit } from '@angular/core';
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

  constructor(
    private sponsorshipService: SponsorshipService,
    private authService: AuthService,
    private tripService: TripService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.actor = this.authService.getCurrentActor();
    console.log("Actor: ", this.actor);

    if (this.actor) {
      if (this.actor.role.toLowerCase() === 'sponsor') {
        this.sponsorshipService.getAllSponsorshipsBySponsorId(this.actor.email)
          .then((sponsorships) => {
            this.sponsorships = sponsorships;
            this.filteredSponsorships = sponsorships;
          })
          .catch((error) => {
            console.error("Error fetching sponsorships: ", error);
            this.messageService.notifyMessage("Error fetching sponsorships for sponsor.","alert-danger");
          });
      } else {
        this.sponsorshipService.getAllSponsorshipsByTripId(this.actor.email)
          .then((sponsorships) => {
            this.sponsorships = sponsorships;
            this.filteredSponsorships = sponsorships;
          })
          .catch((error) => {
            console.error("Error fetching sponsorships: ", error);
            this.messageService.notifyMessage("Error fetching sponsorships for trips.", "alert-danger");
          });
      }
    }
  }
}
