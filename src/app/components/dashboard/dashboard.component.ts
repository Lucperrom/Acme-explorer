import { Component, OnInit } from '@angular/core';
import { DashboardService } from 'src/app/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  tripsStats: any = {};
  applicationsStats: any = {};
  priceStats: any = {};
  applicationsByStatus: any = {};

  constructor(private dashboardService: DashboardService) { }

  ngOnInit(): void {
    this.loadTripStatistics();
    this.loadApplicationStatistics();
    this.loadPriceStatistics();
    this.loadApplicationsByStatus();
  }

  private async loadTripStatistics(): Promise<void> {
    this.tripsStats = await this.dashboardService.getTripStatistics();
  }
  private async loadApplicationStatistics(): Promise<void> {
    this.applicationsStats = await this.dashboardService.getApplicationStatistics();
  }
  private async loadPriceStatistics(): Promise<void> {
    this.priceStats = await this.dashboardService.getPriceStatistics();
  }
  private async loadApplicationsByStatus(): Promise<void> {
    this.applicationsByStatus = await this.dashboardService.getApplicationsByStatus();
  }

}
