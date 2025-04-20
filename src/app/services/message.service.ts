import { Injectable } from '@angular/core';
import { InfoMessage } from '../models/info-message.model';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private message: Subject<InfoMessage | null>;
  constructor() { 

    this.message = new Subject<InfoMessage | null>();
  }

  private timeoutId: any;

  notifyMessage(code: string, typeMessage: string){
    this.message.next(new InfoMessage(code, typeMessage));
    const secondsToShow = 3;

    // Clear the previous timeout if it exists
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    // Set a new timeout to remove the message after a certain period
    this.timeoutId = setTimeout(() => this.removeMessage(), secondsToShow * 1000);
  }

  removeMessage(){
    this.message.next(null)
  }

  getMessage(): Observable<InfoMessage | null>{
    return this.message.asObservable();
  }
}
