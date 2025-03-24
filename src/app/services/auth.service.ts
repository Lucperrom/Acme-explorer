import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Actor } from '../models/actor.model';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User, authState, deleteUser } from '@angular/fire/auth';
import { environment } from '../../environments/environment';
import { firstValueFrom, map, Observable, BehaviorSubject, Subject } from 'rxjs';
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
  private currentActor!: Actor;
  private loginStatus = new Subject<Boolean>();

  constructor(private auth: Auth, private http: HttpClient, private router: Router) {
    onAuthStateChanged(this.auth, (user) => {
      this.loggedInUserSubject.next(!!user);
    });
  }
  
  async signUp(actor: Actor) {
    try {
      const res = await createUserWithEmailAndPassword(this.auth, actor.email, actor.password);
      console.log('You have successfully signed up with firebase', res);
      const url = `${environment.backendApiBaseUrl + '/actors'}`;
      const body = JSON.stringify(actor);
      const response = await firstValueFrom(this.http.post(url, body, httpOptions));
      console.log('Resolving firstValueFrom: ', response);
      return true; // Removed navigation
    } catch (err) {
      console.error('There was an error signing up with firebase', err);
      throw err;
    }
  }

  getRoles(): string[] {
    return ['CLERK', 'ADMINISTRATOR', 'CONSUMER']
  }

  login(email: string, password: string) {
    return new Promise<any>((resolve, reject) => {
      signInWithEmailAndPassword(this.auth, email, password)
        .then(async _ => {
          const url = environment.backendApiBaseUrl + `/actors?email=` + email;
          const actor = await firstValueFrom(this.http.get<Actor[]>(url))
          this.currentActor = actor[0];
          this.loginStatus.next(true);
          resolve(true); // Removed navigation
        })
        .catch(err => {
          reject(err);
        });
    })
  }

  getCurrentActor(): Actor {
    return this.currentActor;
  }

  logout() {
    return new Promise<any>((resolve, reject) => {
      signOut(this.auth)
        .then(res => {
          this.loginStatus.next(false)
          console.log('You have successfully logged out');
          resolve(res);
        })
        .catch(err => {
          console.log('There was an error logging out', err);
          reject(err);
        });
    })
  }

  removeUser(email?: string, password?: string) {
    return new Promise<any>(async (resolve, reject) => {
      try {
        let userToDelete: User | null = null;
        // Defaults to delete the currently logged in user
        if (email && password) {
          const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
          userToDelete = userCredential.user;
        } else {
          userToDelete = this.auth.currentUser;
        }

        if (userToDelete) {
          await deleteUser(userToDelete);
          console.log('User successfully deleted');
          resolve(true);
        } else {
          reject('No user to delete');
        }
      } catch (err) {
        console.error('Error deleting user', err);
        reject(err);
      }
    });
  }

  isLoggedIn(): boolean {
    console.log('Checking if user is logged in');
    let loggedIn = this.loggedInUserSubject.value;
    console.log('User is logged in: ', loggedIn);
    return loggedIn;
  }
  
  getStatus(): Observable<Boolean> {
    return this.loginStatus.asObservable();
  }
}
