import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SavedList, SavedTripsService } from 'src/app/services/saved-trips.service';
import { MessageService } from 'src/app/services/message.service'; // Assuming you have a MessageService

@Component({
  selector: 'app-add-to-list',
  templateUrl: './add-to-list.component.html',
  styleUrls: ['./add-to-list.component.css']
})
export class AddToListComponent {
  @Input()
  tripTicker!: string;
  savedTripsService: SavedTripsService;
  messageService: MessageService;

  isOpen = false;

  constructor(savedTripsService: SavedTripsService, messageService: MessageService) {
    this.savedTripsService = savedTripsService;
    this.messageService = messageService;
  }

  openAddToListModal(): void {
    this.isOpen = true;
  }

  closeModal(): void {
    this.isOpen = false;
  }

  async onListSelected(list: SavedList): Promise<void> {
    try {
      await this.savedTripsService.addTripToList(list.id, this.tripTicker);
      this.messageService.notifyMessage('Trip added to list successfully', 'alert-success');
    } catch (error) {
      this.messageService.notifyMessage(`Failed to add trip to list: ${error}`, 'alert-danger');
    }
    this.closeModal();
  }
}
