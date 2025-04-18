import { Component, OnInit } from '@angular/core';
import { FavouriteListService, SavedList } from 'src/app/services/favourite-list.service';
import { TripService } from 'src/app/services/trip.service';
import { Trip } from 'src/app/models/trip.model';
import { Router } from '@angular/router';
import { MessageService } from 'src/app/services/message.service';
import { BehaviorSubject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-saved-trips',
  templateUrl: './saved-trips.component.html',
  styleUrls: ['./saved-trips.component.css']
})
export class SavedTripsComponent implements OnInit {
  savedLists: SavedList[] = [];
  filteredLists: SavedList[] = [];
  trips: Trip[] = [];
  selectedList: SavedList | null = null;
  searchTerm: string = '';
  private savedListsSubject = new BehaviorSubject<SavedList[]>([]);

  constructor(
    private favouriteListService: FavouriteListService,
    private tripService: TripService,
    private router: Router,
    private messageService: MessageService
  ) {}

  async ngOnInit(): Promise<void> {
    this.loadSavedLists();
    this.trips = await this.tripService.getAllTrips(); // Load all trips once

    // Subscribe to reactive updates
    this.savedListsSubject.subscribe(lists => {
      this.savedLists = lists;
      this.filterLists();
    });
  }

  loadSavedLists(): void {
    const lists = this.favouriteListService.getAllLists();
    this.savedListsSubject.next(lists); // Push updates to the subject
  }

  filterLists(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredLists = this.savedLists.filter(list =>
      list.name.toLowerCase().includes(term)
    );
  }

  selectList(list: SavedList): void {
    this.selectedList = list;
  }

  getTripsForSelectedList(): Trip[] {
    if (!this.selectedList) return [];
    return this.trips.filter(trip => this.selectedList?.tripIds.includes(trip.ticker));
  }

  removeTrip(tripId: string): void {
    if (this.selectedList) {
      this.favouriteListService.removeTripFromList(this.selectedList.id, tripId);
      this.messageService.notifyMessage('Trip removed from the list', 'alert-success');
      this.selectedList.tripIds = this.selectedList.tripIds.filter(id => id !== tripId); // Update the UI immediately
      this.loadSavedLists(); // Reload lists reactively
    }
  }

  renameList(newName: string): void {
    if (this.selectedList && newName.trim()) {
      this.favouriteListService.renameList(this.selectedList.id, newName);
      this.messageService.notifyMessage('List renamed successfully', 'alert-success');
      this.loadSavedLists(); // Reload lists reactively
    }
  }

  deleteList(): void {
    if (this.selectedList) {
      this.favouriteListService.deleteList(this.selectedList.id);
      this.messageService.notifyMessage('List deleted successfully', 'alert-success');
      this.selectedList = null;
      this.loadSavedLists(); // Reload lists reactively
    }
  }

  navigateToTrip(tripId: string): void {
    this.router.navigate(['/trips', tripId]);
  }

  isTripUnavailable(trip: Trip): boolean {
    return !!trip.cancelledReason || new Date(trip.startDate) < new Date();
  }

  isTripStartingSoon(trip: Trip): boolean {
    const now = new Date();
    const startDate = new Date(trip.startDate);
    const diffInDays = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diffInDays > 0 && diffInDays <= 7;
  }

  trackByListId(index: number, list: SavedList): string {
    return list.id;
  }

  trackByTripTicker(index: number, trip: Trip): string {
    return trip.ticker;
  }
}
