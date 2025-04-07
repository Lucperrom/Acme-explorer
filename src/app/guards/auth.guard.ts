import { Injectable } from '@angular/core';
import { CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) { }

  canActivate(route: any, state: RouterStateSnapshot): Observable<boolean> {
    return this.authService.loggedInUserSubject.asObservable().pipe(
      map(isLoggedIn => {
        if (!isLoggedIn) {
          console.log('User is not logged in. Redirecting to login page with returnUrl:', state.url);
          this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } }); // Pass returnUrl
          return false; // Block access
        }
        return true; // Allow access
      })
    );
  }
}
