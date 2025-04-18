import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface SavedList {
  id: string;
  name: string;
  tripIds: string[];
  editTime: string; // ISO timestamp for conflict resolution
}

const LOCAL_STORAGE_KEY = 'acme_saved_lists';
const backendURL = 'http://localhost:3000/saved-trips';

@Injectable({
  providedIn: 'root'
})
export class FavouriteListService {
  private isLoggedIn = false; // Replace with actual authentication logic

  constructor(private http: HttpClient) {}

  private getLocalLists(): SavedList[] {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!data) {
      console.log('[FavouriteListService] No saved lists found in local storage. Creating default "Favourites" list.');
      const defaultList: SavedList = {
        id: `list-${Date.now()}`,
        name: 'Favourites',
        tripIds: [],
        editTime: new Date().toISOString()
      };
      this.saveLocalLists([defaultList]);
      return [defaultList];
    }
    console.log('[FavouriteListService] Loaded saved lists from local storage.');
    return JSON.parse(data);
  }

  private saveLocalLists(lists: SavedList[]): void {
    console.log('[FavouriteListService] Saving lists to local storage:', lists);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(lists));
  }

  private generateId(): string {
    return `list-${Date.now()}`; // Generate a unique ID based on the current timestamp
  }

  getAllLists(): SavedList[] {
    const localLists = this.getLocalLists();
    if (this.isLoggedIn) {
      console.log('[FavouriteListService] User is logged in. Syncing with server.');
      this.syncWithServer();
    }
    return localLists;
  }

  getListById(id: string): SavedList | undefined {
    return this.getLocalLists().find(list => list.id === id);
  }

  createList(name: string): SavedList {
    if (!name.trim()) {
      throw new Error('List name cannot be empty.');
    }

    const localLists = this.getLocalLists();
    if (localLists.some(list => list.name.toLowerCase() === name.toLowerCase())) {
      throw new Error('A list with this name already exists.');
    }

    const newList: SavedList = {
      id: this.generateId(),
      name,
      tripIds: [],
      editTime: new Date().toISOString()
    };
    localLists.push(newList);
    this.saveLocalLists(localLists);
    console.log(`[FavouriteListService] Created new list: "${name}"`);

    if (this.isLoggedIn) {
      this.http.post(backendURL, newList).subscribe();
    }

    return newList;
  }

  renameList(id: string, newName: string): void {
    if (!newName.trim()) {
      throw new Error('List name cannot be empty.');
    }

    const localLists = this.getLocalLists();
    const list = localLists.find(list => list.id === id);
    if (!list) {
      throw new Error('List not found.');
    }

    if (localLists.some(l => l.name.toLowerCase() === newName.toLowerCase() && l.id !== id)) {
      throw new Error('A list with this name already exists.');
    }

    list.name = newName;
    list.editTime = new Date().toISOString();
    this.saveLocalLists(localLists);
    console.log(`[FavouriteListService] Renamed list to: "${newName}"`);

    if (this.isLoggedIn) {
      this.http.put(`${backendURL}/${id}`, list).subscribe();
    }
  }

  deleteList(id: string): void {
    const localLists = this.getLocalLists().filter(list => list.id !== id);
    this.saveLocalLists(localLists);
    console.log(`[FavouriteListService] Deleted list with ID: "${id}"`);

    if (this.isLoggedIn) {
      this.http.delete(`${backendURL}/${id}`).subscribe();
    }
  }

  addTripToList(listId: string, tripId: string): void {
    const localLists = this.getLocalLists();
    const list = localLists.find(list => list.id === listId);
    if (!list) {
      throw new Error('List not found.');
    }

    if (!list.tripIds.includes(tripId)) {
      list.tripIds.push(tripId);
      list.editTime = new Date().toISOString();
      this.saveLocalLists(localLists);
      console.log(`[FavouriteListService] Added trip "${tripId}" to list "${list.name}"`);

      if (this.isLoggedIn) {
        this.http.put(`${backendURL}/${listId}`, list).subscribe();
      }
    }
  }

  removeTripFromList(listId: string, tripId: string): void {
    const localLists = this.getLocalLists();
    const list = localLists.find(list => list.id === listId);
    if (!list) {
      throw new Error('List not found.');
    }

    list.tripIds = list.tripIds.filter(id => id !== tripId);
    list.editTime = new Date().toISOString();
    this.saveLocalLists(localLists);
    console.log(`[FavouriteListService] Removed trip "${tripId}" from list "${list.name}"`);

    if (this.isLoggedIn) {
      this.http.put(`${backendURL}/${listId}`, list).subscribe();
    }
  }

  getListsContainingTrip(tripId: string): SavedList[] {
    return this.getLocalLists().filter(list => list.tripIds.includes(tripId));
  }

  syncWithServer(): void {
    if (!this.isLoggedIn) return;

    const localLists = this.getLocalLists();
    this.http.get<SavedList[]>(backendURL).subscribe(remoteLists => {
      console.log('[FavouriteListService] Syncing with server. Remote lists:', remoteLists);

      const mergedLists = this.mergeLists(localLists, remoteLists);
      this.saveLocalLists(mergedLists);

      mergedLists.forEach(list => {
        this.http.put(`${backendURL}/${list.id}`, list).subscribe();
      });
    });
  }

  loadFromServer(): void {
    if (!this.isLoggedIn) return;

    this.http.get<SavedList[]>(backendURL).subscribe(serverLists => {
      this.saveLocalLists(serverLists);
    });
  }

  private mergeLists(localLists: SavedList[], remoteLists: SavedList[]): SavedList[] {
    const merged: SavedList[] = [];

    // Merge lists by name, keeping the newer version
    const allLists = [...localLists, ...remoteLists];
    const uniqueNames = Array.from(new Set(allLists.map(list => list.name)));

    uniqueNames.forEach(name => {
      const localList = localLists.find(list => list.name === name);
      const remoteList = remoteLists.find(list => list.name === name);

      if (localList && remoteList) {
        const newerList = new Date(localList.editTime) > new Date(remoteList.editTime) ? localList : remoteList;
        merged.push(newerList);
      } else if (localList) {
        merged.push(localList);
      } else if (remoteList) {
        merged.push(remoteList);
      }
    });

    console.log('[FavouriteListService] Merged lists:', merged);
    return merged;
  }
}
