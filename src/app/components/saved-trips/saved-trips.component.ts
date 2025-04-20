import { Component, OnInit } from '@angular/core';
import { SavedTripsService, SavedList } from 'src/app/services/saved-trips.service';
import { MessageService } from 'src/app/services/message.service';
import { TripService } from 'src/app/services/trip.service';
import { Trip } from 'src/app/models/trip.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-saved-trips',
  templateUrl: './saved-trips.component.html',
  styleUrls: ['./saved-trips.component.css']
})
export class SavedTripsComponent implements OnInit {
  savedLists: SavedList[] = [];
  filteredLists: SavedList[] = [];
  selectedList: SavedList | null = null;
  filter: string = '';
  selectedListTrips: Trip[] = [];
  allTrips: Trip[] = [];

  constructor(
    private savedTripsService: SavedTripsService,
    private tripService: TripService,
    private messageService: MessageService,
    private router: Router // Add Router
  ) {}

  ngOnInit(): void {
    this.savedTripsService.savedLists$.subscribe(lists => {
      this.savedLists = lists;
      this.applyFilter();
    });
    this.fetchAllTrips();
  }

  fetchAllTrips(): void {
    this.tripService.getAllTrips().then(trips => {
      this.allTrips = trips;
      this.updateActiveTripList();
    });
  }

  applyFilter(): void {
    const lowerCaseFilter = this.filter.toLowerCase();
    this.filteredLists = this.savedLists.filter(list =>
      list.name.toLowerCase().includes(lowerCaseFilter)
    );
  }

  onListSelected(list: SavedList): void {
    this.selectedList = list;
    console.log('Selected list:', list);
    this.updateActiveTripList(); // Ensure trips are loaded when a list is selected
  }

  async renameSelectedList(newName: string): Promise<void> {
    if (!this.selectedList) return;

    try {
      await this.savedTripsService.renameList(this.selectedList.id, newName);
      this.selectedList.name = newName;
      this.applyFilter();
      this.messageService.notifyMessage('List renamed successfully', 'alert-success');
    } catch (error) {
      console.error('Error renaming list:', error);
      this.messageService.notifyMessage('Failed to rename list', 'alert-danger');
    }
  }

  async removeTripFromSelectedList(tripTicker: string): Promise<void> {
    if (!this.selectedList) return;

    try {
      await this.savedTripsService.removeTripFromList(this.selectedList.id, tripTicker);
      this.selectedList.tripTickers = this.selectedList.tripTickers.filter(id => id !== tripTicker);
      this.selectedListTrips = this.selectedListTrips.filter(trip => trip.ticker !== tripTicker); // Update the displayed trips
      this.messageService.notifyMessage('Trip removed from list', 'alert-success');
    } catch (error) {
      console.error('Error removing trip from list:', error);
      this.messageService.notifyMessage('Failed to remove trip from list', 'alert-danger');
    }
  }

  getTripStatus(trip: Trip): string {
    const currentDate = new Date();
    const tripStartDate = new Date(trip.startDate);
    const tripEndDate = new Date(trip.endDate);

    if (trip.deleted) {
      return 'deleted';
    } else if (trip.cancelledReason && trip.cancelledReason !== '') {
      return 'canceled';
    } else if (tripEndDate < currentDate) {
      return 'expired';
    } else if ((tripStartDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24) <= 7) {
      return 'highlighted';
    } else {
      return '';
    }
  }

  async updateActiveTripList(): Promise<any[]> {
    if (!this.selectedList) {
      console.log('No list selected.');
      return [];
    }
    console.log('Filtering trips for selected list.');

    // Filter trips by selected list tickers and exclude deleted trips
    this.selectedListTrips = this.allTrips.filter(
      trip => this.selectedList?.tripTickers?.includes(trip.ticker) && !trip.deleted
    );

    return this.selectedListTrips;
  }

  navigateToTrip(tripId: string): void {
    this.router.navigate(['/trips', tripId]);
  }
}
