import { Injectable } from '@angular/core';
import {HttpHeaders, HttpClient} from '@angular/common/http';
import {Actor} from '../models/actor.model';
import {Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut} from '@angular/fire/auth';
import {environment} from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private auth: Auth, private http: HttpClient) { }

  async signUp(actor: Actor) {
    createUserWithEmailAndPassword(this.auth, actor.email, actor.password)
    .then(async res => {
      const url = `${environment.backendApiBaseUrl + '/actors'}`;
      const body = JSON.stringify(actor);
      const response = await firstValueFrom(this.http.post(url, body, httpOptions));
      return(response);
    })
  } 
  
  getRoles(): string[] {
    return ['CLERK', 'ADMINISTRATOR', 'CONSUMER']
  }

  login(email: string, password: string) {
    return new Promise<any>((resolve, reject) => {
      signInWithEmailAndPassword(this.auth, email, password)
      .then(res => {
        resolve(res);
      })
      .catch(err => {
        reject(err);
      });
    })
  }

  logout() {
    return new Promise<any>((resolve, reject) => {
      signOut(this.auth)
      .then(res => {
        resolve(res);
      })
      .catch(err => {
        reject(err);
      });
    })
  }
}
