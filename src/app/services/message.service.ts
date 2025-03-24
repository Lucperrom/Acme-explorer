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

  notifyMessage(code: string, typeMessage: string){
    this.message.next(new InfoMessage(code, typeMessage))
  }

  removeMessage(){
    this.message.next(null)
  }

  getMessage(): Observable<InfoMessage | null>{
    return this.message.asObservable();
  }
}
