import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service'
import { Actor } from 'src/app/models/actor.model';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { TripService } from 'src/app/services/trip.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit { 
  protected currentActor: Actor | null = null;
  protected activeRole: string = 'anonymous';
  isDarkMode: boolean = false;
  @Output() search = new EventEmitter<string>();
  searchTerm: string = '';

  constructor(private authService: AuthService, private tripService : TripService, private router: Router) {
   }
   onSearch(event: Event): void {
    event.preventDefault();
    this.tripService.setSearchTerm(this.searchTerm.trim());
    this.tripService.searchTerm$.subscribe((term) => {
      this.searchTerm = term;
    });
  }
   ngOnInit(): void {
    const alreadyReloaded = sessionStorage.getItem('reloaded');

    this.isDarkMode = localStorage.getItem('darkMode') === 'true';
    console.log(localStorage.getItem('darkMode'))
    this.authService.loggedInUserSubject.asObservable().subscribe((loggedIn: boolean) => {
      if (loggedIn) {
        this.currentActor = this.authService.getCurrentActor();
        this.activeRole = this.currentActor?.role || 'anonymous';
        console.log(this.currentActor);
      }
    });
    
  }
  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', this.isDarkMode.toString());
    location.reload();
  }
  

  logout(): void {
    this.authService.logout().then(() => {
      this.currentActor = null;
      this.activeRole = 'anonymous';
      this.router.navigate(['/login']);
    });
  }

  changeLanguage(language:string){
    
  }
}
