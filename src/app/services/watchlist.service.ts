import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';

const LOCAL_STORAGE_KEY = 'acme_watchlist';

interface UserWatchlist {
  id: string;
  tripTickers: string[];
}

@Injectable({
  providedIn: 'root'
})
export class WatchlistService {
  private watchlistSubject = new BehaviorSubject<string[]>([]);
  watchlist$ = this.watchlistSubject.asObservable();

  constructor(private authService: AuthService) {
    this.reinitializeWatchlist();
  }

  private getDefaultData(): UserWatchlist {
    const id = this.authService.isLoggedIn() ? this.authService.getCurrentActor()?.email || 'anonymous' : 'anonymous';
    return {
      id,
      tripTickers: []
    };
  }

  private getLocalData(): UserWatchlist {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!data) {
      const defaultData = this.getDefaultData();
      this.saveLocalData(defaultData);
      return defaultData;
    }

    const localData: UserWatchlist = JSON.parse(data);
    const currentId = this.authService.isLoggedIn() ? this.authService.getCurrentActor()?.email || 'anonymous' : 'anonymous';

    if (localData.id !== currentId) {
      const defaultData = this.getDefaultData();
      this.saveLocalData(defaultData);
      return defaultData;
    }

    return localData;
  }

  private saveLocalData(data: UserWatchlist): void {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    this.watchlistSubject.next(data.tripTickers);
  }

  private reinitializeWatchlist(): void {
    const localData = this.getLocalData();
    this.watchlistSubject.next(localData.tripTickers);
  }

  addTripToWatchlist(tripTicker: string): void {
    const localData = this.getLocalData();
    if (localData.tripTickers.includes(tripTicker)) {
      console.warn(`[WatchlistService] Trip "${tripTicker}" is already in the watchlist.`);
      throw new Error('This trip is already in your watchlist.');
    }
    localData.tripTickers.push(tripTicker);
    this.saveLocalData(localData);
    console.log(`[WatchlistService] Trip "${tripTicker}" added to watchlist.`);
  }

  removeTripFromWatchlist(tripTicker: string): void {
    const localData = this.getLocalData();
    localData.tripTickers = localData.tripTickers.filter(ticker => ticker !== tripTicker);
    this.saveLocalData(localData);
    console.log(`[WatchlistService] Trip "${tripTicker}" removed from watchlist.`);
  }

  getWatchlist(): string[] {
    this.reinitializeWatchlist(); // Ensure the watchlist is always up-to-date
    return this.watchlistSubject.getValue();
  }
}
