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
    this.authService.getStatus().subscribe((loggedIn:Boolean) => {
      if (loggedIn) {
        this.currentActor = this.authService.getCurrentActor();
        this.activeRole = this.currentActor.role.toString().toLowerCase()
      }
    })

  }

  logout(): void {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    });
  }

  changeLanguage(language:string){
    
  }
}
