import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Actor } from '../models/actor.model';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User, authState } from '@angular/fire/auth';
import { environment } from '../../environments/environment';
import { firstValueFrom, map, Observable, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedInUserSubject = new BehaviorSubject<boolean>(false);
  loggedInUser$ = this.loggedInUserSubject.asObservable();

  constructor(private auth: Auth, private http: HttpClient, private router: Router) {
    onAuthStateChanged(this.auth, (user) => {
      this.loggedInUserSubject.next(!!user);
    });
  }

  async signUp(actor: Actor) {
    createUserWithEmailAndPassword(this.auth, actor.email, actor.password)
      .then(async res => {
        console.log('You have successfully signed up with firebase', res);
        const url = `${environment.backendApiBaseUrl + '/actors'}`;
        const body = JSON.stringify(actor);
        const response = await firstValueFrom(this.http.post(url, body, httpOptions));
        console.log('Resolving fristValueFrom: ', response);
        this.router.navigate(['/trips']);
        return (response);
      })
  }

  getRoles(): string[] {
    return ['CLERK', 'ADMINISTRATOR', 'CONSUMER']
  }

  login(email: string, password: string) {
    return new Promise<any>((resolve, reject) => {
      signInWithEmailAndPassword(this.auth, email, password)
        .then(res => {
          this.router.navigate(['/trips']);
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
          console.log('You have successfully logged out', res);
          resolve(res);
        })
        .catch(err => {
          console.log('There was an error logging out', err);
          reject(err);
        });
    })
  }

  isLoggedIn(): boolean {
    console.log('Checking if user is logged in');
    let loggedIn = this.loggedInUserSubject.value;
    console.log('User is logged in: ', loggedIn);
    return loggedIn;
  }
}
