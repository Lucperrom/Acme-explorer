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
  // This are trips that are not in the system anymore
  unavailableTickers: string[] = [];

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
      this.updateActiveTripList();
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
      let msg = $localize`List renamed successfully`;
      this.messageService.notifyMessage(msg, 'alert-success');
    } catch (error) {
      console.error('Error renaming list:', error);
      let msg = $localize`Failed to rename list`;
      this.messageService.notifyMessage(msg, 'alert-danger');
    }
  }

  async removeTripFromSelectedList(tripTicker: string): Promise<void> {
    if (!this.selectedList) return;

    try {
      await this.savedTripsService.removeTripFromList(this.selectedList.id, tripTicker);
      this.selectedList.tripTickers = this.selectedList.tripTickers.filter(id => id !== tripTicker);
      this.selectedListTrips = this.selectedListTrips.filter(trip => trip.ticker !== tripTicker); // Update the displayed trips
      if (this.unavailableTickers.includes(tripTicker)) {
        this.unavailableTickers = this.unavailableTickers.filter(t => t !== tripTicker);
      }
      let msg = $localize`Trip removed from list successfully`;
      this.messageService.notifyMessage(msg, 'alert-success');
    } catch (error) {
      console.error('Error removing trip from list:', error);
      let msg = $localize`Failed to remove trip from list`;
      this.messageService.notifyMessage(msg, 'alert-danger');
    }
  }


  async updateActiveTripList(): Promise<any[]> {
    if (!this.selectedList) {
      console.log('No list selected.');
      return [];
    }
    console.log('Filtering trips for selected list.');

    // Initialize unavailableTickers with all tickers from the selected list
    this.unavailableTickers = [...(this.selectedList?.tripTickers || [])];

    // Filter trips by selected list tickers and exclude deleted trips
    this.selectedListTrips = this.allTrips.filter(trip => {
      if (this.selectedList?.tripTickers?.includes(trip.ticker) && !trip.deleted) {
      // Remove the trip ticker from unavailableTickers if it is valid
      this.unavailableTickers = this.unavailableTickers.filter(ticker => ticker !== trip.ticker);
      return true;
      }
      return false;
    });


    return this.selectedListTrips;
  }

  navigateToTrip(tripId: string): void {
    this.router.navigate(['/trips', tripId]);
  }
}
