import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Actor } from '../models/actor.model';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User, authState, deleteUser } from '@angular/fire/auth';
import { environment } from '../../environments/environment';
import { firstValueFrom, map, Observable, BehaviorSubject, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { addDoc, collection, Firestore, query, where, getDocs } from '@angular/fire/firestore';

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

  constructor(private auth: Auth, private firestore: Firestore,private http: HttpClient, private router: Router) {
    onAuthStateChanged(this.auth, (user) => {
      this.loggedInUserSubject.next(!!user);
    });
  }
  
  async signUp(actor: Actor) {
  
    return new Promise<any>((resolve, reject) => {
      createUserWithEmailAndPassword(this.auth, actor.email, actor.password).then( async res => {
        console.log('You have succesfully signed up with Firebase!', res);
        const actorRef = collection(this.firestore, 'actors');
        addDoc(actorRef, actor).then((docRef) => {
          console.log("Document written with ID: ", docRef.id);
          resolve(actor);
        }).catch((error) => {
          console.error("Error adding document: ", error);
          reject();
        });
      }).catch(error => {
        console.log('Something is wrong, check on details: ', error.message);
        reject(error);
      })
    })



    // try {
    //   const res = await createUserWithEmailAndPassword(this.auth, actor.email, actor.password);
    //   console.log('You have successfully signed up with firebase', res);
    //   const url = `${environment.backendApiBaseUrl + '/actors'}`;
    //   const body = JSON.stringify(actor);
    //   const response = await firstValueFrom(this.http.post(url, body, httpOptions));
    //   console.log('Resolving firstValueFrom: ', response);
    //   return true; // Removed navigation
    // } catch (err) {
    //   console.error('There was an error signing up with firebase', err);
    //   throw err;
    // }
  }

  getRoles(): string[] {
    return ['EXPLORER', 'ADMINISTRATOR', 'MANAGER', 'SPONSOR']
  }

  async login(email: string, password: string) {
    const response = await signInWithEmailAndPassword(this.auth, email, password)
    console.log(response)
    const actorRef = collection(this.firestore, 'actors');
    const q = query(actorRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    console.log(querySnapshot);
    querySnapshot.forEach((doc) => {
      let actor = this.getCurrentActorFromDoc(doc)
      this.currentActor = actor
      this.loginStatus.next(true)
      console.log(doc)
      return(doc.data())
    })
  }

  getCurrentActor(): Actor {
    return this.currentActor;
  }
  getCurrentActorFromDoc(doc: any): Actor {
    const data = doc.data();
    let actor = new Actor()
    actor.id = data['id']
    actor.name = data['name']
    actor.email = data['email']
    actor.password = data['password']
    actor.role=data['role']
    actor.surname = data['surname']
    actor.phone = data['phone']
    return actor;
  }

  logout() {
    return new Promise<any>((resolve, reject) => {
      signOut(this.auth)
        .then(res => {
          this.loginStatus.next(false)
          this.currentActor = new Actor();
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
