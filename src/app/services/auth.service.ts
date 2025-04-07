import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Actor } from '../models/actor.model';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User, authState, deleteUser } from '@angular/fire/auth';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
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
  public loggedInUserSubject = new BehaviorSubject<boolean>(false);
  private currentActor!: Actor|null;
  constructor(private auth: Auth, private firestore: Firestore, private http: HttpClient, private router: Router) {
    const actorData = localStorage.getItem('currentActor');
    if (actorData) {
      this.currentActor = JSON.parse(actorData);
      this.loggedInUserSubject.next(true); 
    } else {
      this.loggedInUserSubject.next(false); 
    }

    onAuthStateChanged(this.auth, async (user) => {
      console.log("Calling on Auth State Changed: ");
      if (user) {
        const localUser: String | null = localStorage.getItem('currentActor');
        console.log("localUser: ", localUser);
        if(localUser != null) {
          console.log("User already logged in: ", localUser);
          this.loggedInUserSubject.next(true);
          return;
        }
        const actorRef = collection(this.firestore, 'actors');
        const userQuery = query(actorRef, where("email", "==", user.email));
        const querySnapshot = await getDocs(userQuery);
        this.currentActor = this.getCurrentActorFromDoc(querySnapshot.docs[0]);
        // Avoid storing the password in localStorage
        localStorage.setItem('currentActor', this.currentActor.toJSON(true));
        this.loggedInUserSubject.next(true);
        
      } else {
        this.loggedInUserSubject.next(false);
        this.currentActor = null;
        localStorage.removeItem('currentActor'); 
      }
    });
  }

  async signUp(actor: Actor) {
    return new Promise<any>((resolve, reject) => {
      createUserWithEmailAndPassword(this.auth, actor.email, actor.password).then(async res => {
        console.log('You have successfully signed up with Firebase!', res);
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
      });
    });
  }

  getRoles(): string[] {
    return ['EXPLORER', 'ADMINISTRATOR', 'MANAGER', 'SPONSOR'];
  }

  async login(email: string, password: string) {
    const response = await signInWithEmailAndPassword(this.auth, email, password);
    console.log(response);
    const actorRef = collection(this.firestore, 'actors');
    const q = query(actorRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      let actor = this.getCurrentActorFromDoc(doc);
      this.currentActor = actor;
      localStorage.setItem('currentActor', actor.toJSON(true)); 
      this.loggedInUserSubject.next(true); 
      console.log(doc);
      return doc.data();
    });
  }

  getCurrentActor(): Actor|null {
    return this.currentActor;
  }

  getCurrentActorFromDoc(doc: any): Actor {
    const data = doc.data();
    let actor = new Actor();
    actor.id = data['id'];
    actor.name = data['name'];
    actor.email = data['email'];
    actor.password = data['password'];
    actor.role = data['role'];
    actor.surname = data['surname'];
    actor.phone = data['phone'];
    return actor;
  }

  logout() {
    return new Promise<any>((resolve, reject) => {
      signOut(this.auth)
        .then(res => {
          this.loggedInUserSubject.next(false);
          this.currentActor = null;
          localStorage.removeItem('currentActor'); 
          console.log('You have successfully logged out');
          resolve(res);
        })
        .catch(err => {
          console.log('There was an error logging out', err);
          reject(err);
        });
    });
  }

  removeUser(email?: string, password?: string) {
    return new Promise<any>(async (resolve, reject) => {
      try {
        let userToDelete: User | null = null;
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
    return this.loggedInUserSubject.value; // Ensure this reflects the correct state
  }

  getStatus(): Observable<Boolean> {
    return this.loggedInUserSubject.asObservable();
  }
}