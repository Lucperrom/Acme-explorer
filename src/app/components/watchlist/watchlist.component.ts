import { Component, OnInit, OnDestroy } from '@angular/core';
import { WatchlistService } from 'src/app/services/watchlist.service';
import { TripService } from 'src/app/services/trip.service';
import { Trip } from 'src/app/models/trip.model';
import { interval, Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.css']
})
export class WatchlistComponent implements OnInit, OnDestroy {
  watchlist: string[] = [];
  trips: Trip[] = [];
  unavailableTickers: string[] = [];
  loading = true;
  countdownSubscription: Subscription | null = null;

  constructor(
    private watchlistService: WatchlistService,
    private tripService: TripService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadWatchlist();
    this.startCountdownUpdates();
  }

  ngOnDestroy(): void {
    this.stopCountdownUpdates();
  }

  private async loadWatchlist(): Promise<void> {
    this.watchlist = this.watchlistService.getWatchlist();
    try {
      const allTrips = await this.tripService.getAllTrips();
      this.trips = allTrips.filter(trip => this.watchlist.includes(trip.ticker));
      this.unavailableTickers = this.watchlist.filter(ticker => !this.trips.some(trip => trip.ticker === ticker));
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      this.loading = false;
    }
  }

  getCountdown(trip: Trip): string {
    const distance = new Date(trip.startDate).getTime() - new Date().getTime();
    if (distance < 0) {
      return $localize`The trip has already started`;
    }
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

  private startCountdownUpdates(): void {
    this.countdownSubscription = interval(1000).subscribe(() => {
      // Trigger UI updates by recalculating countdowns
    });
  }

  private stopCountdownUpdates(): void {
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
  }

  navigateToTrip(tripId: string): void {
    this.router.navigate(['/trips', tripId]);
  }

  removeFromWatchlist(tripTicker: string): void {
    this.watchlistService.removeTripFromWatchlist(tripTicker);
    this.trips = this.trips.filter(trip => trip.ticker !== tripTicker);
    this.unavailableTickers = this.unavailableTickers.filter(ticker => ticker !== tripTicker);
  }
}
