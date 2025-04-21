import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SavedTripsService, SavedList } from 'src/app/services/saved-trips.service';
import { MessageService } from 'src/app/services/message.service'; // Import the message service

@Component({
  selector: 'app-list-manager',
  templateUrl: './list-manager.component.html',
  styleUrls: ['./list-manager.component.css']
})
export class ListManagerComponent implements OnInit {
  @Input() maxVisible: number = 5;
  @Output() listSelectedEmmiter = new EventEmitter<SavedList>();

  lists: SavedList[] = [];
  searchTerm: string = '';
  showAllLists: boolean = false;
  isDarkMode: boolean = false;

  constructor(
    private savedTripsService: SavedTripsService,
    private messageService: MessageService // Inject the message service
  ) {}

  ngOnInit(): void {
    this.savedTripsService.initializeSavedLists();// Triggers the sync
    this.isDarkMode = localStorage.getItem('darkMode') === 'true';

    this.savedTripsService.savedLists$.subscribe(lists => {
      this.lists = lists;
    });
  }

  get filteredLists(): SavedList[] {
    return this.lists.filter(list =>
      list.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  get visibleLists(): SavedList[] {
    return this.showAllLists ? this.filteredLists : this.filteredLists.slice(0, this.maxVisible);
  }

  toggleShowAll(): void {
    this.showAllLists = !this.showAllLists;
  }

  async createList(newListName: string): Promise<void> {
    const trimmedName = newListName.trim();
    if (trimmedName) {
      try {
        await this.savedTripsService.createList(trimmedName);
        let msg = $localize`List created successfully!`;
        this.messageService.notifyMessage(msg, 'alert-success'); // Success message
      } catch (error: any) {
        console.error('Error creating list:', error.message);
        let msg = $localize`Failed to create list`;
        this.messageService.notifyMessage(msg, 'alert-danger'); // Error message
      }
    }
  }

  async deleteList(list: SavedList): Promise<void> {
    try {
      await this.savedTripsService.deleteList(list.id);
      let msg = $localize`List deleted successfully!`;
      this.messageService.notifyMessage(msg, 'alert-success'); // Success message
    } catch (error) {
      console.error('Error deleting list:', error);
      let msg = $localize`Failed to delete the list`;
      this.messageService.notifyMessage(msg, 'alert-danger'); // Error message
    }
  }

  selectList(list: SavedList): void {
    this.listSelectedEmmiter.emit(list);
  }
}
