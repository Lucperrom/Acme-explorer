import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import axios from 'axios';
import { AuthService } from './auth.service';

export interface SavedList {
  id: string;
  name: string;
  tripTickers: string[];
  editTime: string;
  deleted?: boolean;
}

export interface UserSavedLists {
  id: string;
  savedLists: SavedList[];
}

const LOCAL_STORAGE_KEY = 'acme_current_user_saved_lists';
const backendURL = 'http://localhost:3000/saved-trips';

@Injectable({
  providedIn: 'root'
})
export class SavedTripsService {
  private savedListsSubject = new BehaviorSubject<SavedList[]>([]);
  savedLists$ = this.savedListsSubject.asObservable();

  constructor(private authService: AuthService) {
    this.initializeSavedLists();
  }

  public async initializeSavedLists(): Promise<void> {
    const userLists = await this.getUserLists();
    this.savedListsSubject.next(userLists?.savedLists.filter(list => !list.deleted) || []);
  }

  private getDefaultData(): UserSavedLists {
    const id = this.authService.isLoggedIn() ? this.authService.getCurrentActor()?.email || 'anonymous' : 'anonymous';
    return {
      id,
      savedLists: []
    };
  }

  private getLocalData(): UserSavedLists {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!data) {
      console.log('[SavedTripsService] No local data found. Creating default data.');
      const defaultData = this.getDefaultData();
      this.saveLocalData(defaultData);
      return defaultData;
    }

    const localData: UserSavedLists = JSON.parse(data);

    const currentId = this.authService.isLoggedIn() ? this.authService.getCurrentActor()?.email || 'anonymous' : 'anonymous';
    if (localData.id !== currentId && localData.id !== 'anonymous') {
      console.log('[SavedTripsService] User has changed. Clearing old data and creating new default data.');
      const defaultData = this.getDefaultData();
      this.saveLocalData(defaultData);
      return defaultData;
    }

    return localData;
  }

  private saveLocalData(data: UserSavedLists): void {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  }

  private async fetchAndMergeSavedLists(): Promise<void> {
    if (!this.authService.isLoggedIn()) {
      console.warn('[SavedTripsService] User is not logged in. Cannot fetch saved lists from server.');
      return;
    }

    const id = this.authService.getCurrentActor()?.email || 'anonymous';
    try {
      const response = await axios.get<UserSavedLists>(`${backendURL}/${id}`);
      const remoteData = response.data;

      console.log('[SavedTripsService] Synced data from server for id:',id, remoteData);
      const localData = this.getLocalData();
      const mergedLists = this.mergeLists(localData.savedLists, remoteData.savedLists);
      this.saveLocalData({ id, savedLists: mergedLists });
      this.savedListsSubject.next(mergedLists.filter(list => !list.deleted));
    } catch (err) {
      console.error('[SavedTripsService] Failed to sync from server:', err);
    }
  }

  private async tryToSyncToServer(): Promise<void> {
    console.log('[SavedTripsService] Attempting to sync to server...');
    if (!this.authService.isLoggedIn()) {
      console.warn('[SavedTripsService] User is not logged in. Cannot sync to server.');
      return;
    }

    const id = this.authService.getCurrentActor()?.email || 'anonymous';
    const localData = this.getLocalData();
    let mustCreateAnEntry = false;

    try {
      let remoteData: UserSavedLists | null = null;

      try {
        const response = await axios.get<UserSavedLists>(`${backendURL}/${id}`);
        remoteData = response.data;
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          console.warn('[SavedTripsService] No server data found for user. Proceeding to create new data.');
          mustCreateAnEntry = true;
        } else {
          console.error('[SavedTripsService] Error fetching server data:');
          throw err;
        }
      }

      const mergedLists = this.mergeLists(localData.savedLists, remoteData?.savedLists || []);
      const updatedData: UserSavedLists = { id, savedLists: mergedLists };

      if (mustCreateAnEntry) {
        await axios.post(backendURL, updatedData);
        console.log('[SavedTripsService] Created new data on server.');
      } else {
        await axios.put(`${backendURL}/${id}`, updatedData);
        console.log('[SavedTripsService] Updated data on server.');
      }
      this.savedListsSubject.next(mergedLists.filter(list => !list.deleted));
    } catch (err) {
      console.error('[SavedTripsService] Failed to sync to server:', err);
    }
    console.log('[SavedTripsService] Sync to server completed.');
  }

  private mergeLists(localLists: SavedList[], remoteLists: SavedList[]): SavedList[] {
    if (!Array.isArray(remoteLists)) {
      console.error('[mergeLists] remoteLists is not an array:', remoteLists);
      return localLists;
    }
    const merged: SavedList[] = [];
    const allLists = [...localLists, ...remoteLists];
    const uniqueIds = Array.from(new Set(allLists.map(list => list.id)));

    console.log('[mergeLists] Unique IDs:', uniqueIds);

    uniqueIds.forEach(id => {
      const localList = localLists.find(list => list.id === id);
      const remoteList = remoteLists.find(list => list.id === id);

      if (localList && remoteList) {
        const newerList = new Date(localList.editTime) > new Date(remoteList.editTime) ? localList : remoteList;
        console.log(`[mergeLists] Merging list "${id}" - Using newer list: "${newerList.name}"`);
        merged.push(newerList);
      } else if (localList) {
        console.log(`[mergeLists] Adding local list "${localList.name}"`);
        merged.push(localList);
      } else if (remoteList) {
        console.log(`[mergeLists] Adding remote list "${remoteList.name}"`);
        merged.push(remoteList);
      }
    });

    const filteredMerged = merged.filter(list => !list.deleted);
    console.log('[mergeLists] Final merged list names:', filteredMerged.map(list => list.name));

    return filteredMerged;
  }

  private async getUserLists(): Promise<UserSavedLists | null> {
    try {
      await this.fetchAndMergeSavedLists();
      return this.getLocalData();
    } catch (error) {
      console.error('[SavedTripsService] Failed to get user lists:', error);
      return null;
    }
  }


  async getListById(id: string): Promise<SavedList | undefined> {
    const userLists = await this.getUserLists();
    return userLists ? userLists.savedLists.find(list => list.id === id && !list.deleted) : undefined;
  }

  async createList(name: string): Promise<SavedList> {
    const userLists = await this.getUserLists();
    if (!userLists) {
      console.error('[SavedTripsService] Failed to retrieve user lists.');
      throw new Error('Unable to retrieve your saved lists. Please try again later.');
    }

    if (userLists.savedLists.some(list => list.name.toLowerCase() === name.toLowerCase())) {
      console.warn('[SavedTripsService] A list with this name already exists.');
      throw new Error('A list with this name already exists.');
    }

    const newList: SavedList = {
      id: `list-${Date.now()}`,
      name,
      tripTickers: [],
      editTime: new Date().toISOString(),
      deleted: false
    };
    userLists.savedLists.push(newList);
    this.saveLocalData(userLists);
    this.savedListsSubject.next(userLists.savedLists.filter(list => !list.deleted));

    console.log('[SavedTripsService] New list created locally:', newList);
    await this.tryToSyncToServer();
    console.log('[SavedTripsService] New list synced to server:', newList);

    return newList;
  }

  async addTripToList(listId: string, tripId: string): Promise<void> {
    console.log(`[SavedTripsService] Attempting to add trip "${tripId}" to list "${listId}"`);
    
    await this.fetchAndMergeSavedLists();

    const userLists = this.getLocalData();
    const list = userLists.savedLists.find(list => list.id === listId && !list.deleted);

    if (!list) {
      console.error(`[SavedTripsService] List "${listId}" not found.`);
      throw new Error('The selected list does not exist.');
    }

    if (list.tripTickers.includes(tripId)) {
      console.warn(`[SavedTripsService] Trip "${tripId}" is already in the list "${list.name}".`);
      throw new Error(`This trip is already in the list "${list.name}".`);
    }

    list.tripTickers.push(tripId);
    list.editTime = new Date().toISOString();
    this.saveLocalData(userLists);
    this.savedListsSubject.next(userLists.savedLists.filter(list => !list.deleted));

    console.log(`[SavedTripsService] Trip "${tripId}" added to list "${list.name}" locally.`);
    await this.tryToSyncToServer();
    console.log(`[SavedTripsService] Trip "${tripId}" synced to server for list "${list.name}".`);
  }

  async removeTripFromList(listId: string, tripId: string): Promise<void> {
    const userLists = await this.getUserLists();
    if (!userLists) {
      console.error('[SavedTripsService] Failed to retrieve user lists.');
      throw new Error('Unable to retrieve your saved lists. Please try again later.');
    }

    const list = userLists.savedLists.find(list => list.id === listId && !list.deleted);
    if (!list) {
      console.error(`[SavedTripsService] List "${listId}" not found.`);
      throw new Error('The selected list does not exist.');
    }

    if (!list.tripTickers.includes(tripId)) {
      console.warn(`[SavedTripsService] Trip "${tripId}" is not in the list "${list.name}".`);
      throw new Error(`This trip is not in the list "${list.name}".`);
    }

    list.tripTickers = list.tripTickers.filter(id => id !== tripId);
    list.editTime = new Date().toISOString();
    this.saveLocalData(userLists);
    this.savedListsSubject.next(userLists.savedLists.filter(list => !list.deleted));

    console.log(`[SavedTripsService] Trip "${tripId}" removed from list "${list.name}" locally.`);
    await this.tryToSyncToServer();
    console.log(`[SavedTripsService] Trip "${tripId}" removal synced to server for list "${list.name}".`);
  }

  async renameList(id: string, newName: string): Promise<void> {
    if (!newName.trim()) {
      console.error('[SavedTripsService] List name cannot be empty.');
      throw new Error('List name cannot be empty.');
    }

    const userLists = await this.getUserLists();
    if (!userLists) {
      console.error('[SavedTripsService] Failed to retrieve user lists.');
      throw new Error('Unable to retrieve your saved lists. Please try again later.');
    }

    const list = userLists.savedLists.find(list => list.id === id && !list.deleted);
    if (!list) {
      console.error(`[SavedTripsService] List "${id}" not found.`);
      throw new Error('The selected list does not exist.');
    }

    if (userLists.savedLists.some(l => l.name.toLowerCase() === newName.toLowerCase() && l.id !== id)) {
      console.warn('[SavedTripsService] A list with this name already exists.');
      throw new Error('A list with this name already exists.');
    }

    list.name = newName;
    list.editTime = new Date().toISOString();
    this.saveLocalData(userLists);
    this.savedListsSubject.next(userLists.savedLists.filter(list => !list.deleted));

    console.log(`[SavedTripsService] Renamed list "${id}" to "${newName}" locally.`);
    await this.tryToSyncToServer();
    console.log(`[SavedTripsService] Renamed list "${id}" synced to server.`);
  }

  async deleteList(id: string): Promise<void> {
    const userLists = await this.getUserLists();
    if (!userLists) {
      console.error('[SavedTripsService] Failed to retrieve user lists.');
      throw new Error('Unable to retrieve your saved lists. Please try again later.');
    }

    const list = userLists.savedLists.find(list => list.id === id);
    if (!list) {
      console.error(`[SavedTripsService] List "${id}" not found.`);
      throw new Error('The selected list does not exist.');
    }

    list.deleted = true;
    list.editTime = new Date().toISOString();
    this.saveLocalData(userLists);
    this.savedListsSubject.next(userLists.savedLists.filter(list => !list.deleted));

    console.log(`[SavedTripsService] Marked list "${id}" as deleted locally.`);
    await this.tryToSyncToServer();
    console.log(`[SavedTripsService] Marked list "${id}" as deleted on server.`);
  }
}
