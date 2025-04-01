import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service'
import { Actor } from 'src/app/models/actor.model';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit { 
  protected currentActor: Actor | undefined;
  protected activeRole: string = 'anonymous'

  constructor(private authService: AuthService, private router: Router) {
   }

   ngOnInit(): void {
    this.authService.loggedInUserSubject.asObservable().subscribe((loggedIn: boolean) => {
      if (loggedIn) {
        this.currentActor = this.authService.getCurrentActor();
        this.activeRole = this.currentActor.role;
        console.log(this.currentActor);
      }
    });
    
  }
  

  logout(): void {
    this.authService.logout().then(() => {
      this.currentActor = undefined;
      this.activeRole = 'anonymous';
      this.router.navigate(['/login']);
    });
  }

  changeLanguage(language:string){
    
  }
}
