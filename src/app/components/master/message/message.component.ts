import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { InfoMessage } from 'src/app/models/info-message.model';
import { MessageService } from 'src/app/services/message.service';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnInit {
  protected infoMessage!: string;
  protected cssClass!: string;
  protected showMessage!: boolean;
  protected subscription!: Subscription
  constructor(private messageService:MessageService) { }

  ngOnInit(): void {
    this.subscription = this.messageService.getMessage().subscribe(
      (data:InfoMessage | null) => {
        if(data) {
          this.infoMessage = data.message;
          this.cssClass = data.cssClass;
          this.showMessage = true;
        }
        else{
          this.showMessage = false;
        }
      }
    )
  }


  ngOnDestroy(){
    this.subscription.unsubscribe();
  }
}
