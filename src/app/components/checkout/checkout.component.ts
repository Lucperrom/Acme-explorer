import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ICreateOrderRequest, IPayPalConfig } from 'ngx-paypal';
import { NgxPayPalModule } from 'ngx-paypal';
import { ApplicationService } from 'src/app/services/application.service';
import { SponsorshipService } from 'src/app/services/sponsorship.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  protected payPalConfig ?: IPayPalConfig;
  isDarkMode = false;

  constructor(private route: ActivatedRoute, private router: Router, private sponsorshipService: SponsorshipService, private applicationService: ApplicationService) { }

  ngOnInit(): void {
    this.initConfig();
    this.isDarkMode = localStorage.getItem('darkMode') === 'true';
  }
  private initConfig(): void {
    const total = this.route.snapshot.queryParams['total'];
    const applicationId = this.route.snapshot.queryParams['applicationId'];
    const sponsorshipId = this.route.snapshot.queryParams['id'];

    if (!total && !(applicationId || sponsorshipId)) {
      this.router.navigate(['/denied-access']);
    }

    this.payPalConfig = {
      currency: 'EUR',
      clientId: 'AaU6_-mjz316lEGTU0ru9KoznPsudlcy8VFW3vghRKzZwN5CzoWAWmFWATKYjoQ2Wiz1kn0HSLnsqoSX',
      createOrderOnClient: (data) =>
        < ICreateOrderRequest > {
          intent: 'CAPTURE',
          purchase_units: [{
            amount: {
              currency_code: 'EUR',
              value: total,
            },
          }],
        },
      advanced: {
        commit: 'true'
      },
      style: {
        label: 'paypal',
        layout: 'vertical',
      },
      onApprove: (data, actions) => {
        console.log('onApprove - transaction was approved, but not authorized', data, actions);
        actions.order.get().then((details: any) => {
          console.log('Order details: ', details);
        });
      },
      onClientAuthorization: async (data) => {
        console.log('onClientAuthorization - inform your server at this point', data);
        let message = $localize `The order has been placed`;
        alert(message);
        if (applicationId) {
          await this.applicationService.updateApplicationStatus(applicationId, 'accepted')
          this.router.navigateByUrl('/my-applications');
        } else {
          await this.sponsorshipService.updateSponsorship(sponsorshipId, { payed: true })
          this.router.navigateByUrl('/sponsorships');
        }
        
      },
      onCancel: (data, actions) => {
        console.log('OnCancel', data, actions);
        let message = $localize `The order has been canceled`;
        alert(message);
      },
      onError: (err) => {
        console.log('OnError', err);
        let message = $localize `An error occurred during the transaction`;
        alert(message);
      },
      onClick(data, actions) {
        console.log('onClick', data, actions);
        let message = $localize `The order has been clicked`;
        alert(message);
      }
    };
  }
}
