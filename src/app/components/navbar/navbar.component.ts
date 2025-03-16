import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service'
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit { 
  protected isLoggedIn = false;

  constructor(private authService: AuthService, private router: Router) {
   }

  ngOnInit(): void {
    this.authService.loggedInUser$.subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
    });
  }

  logout(): void {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    });
  }
  
}
