import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { AuthService } from "../services/auth.service";

@Injectable({
    providedIn: 'root'
})
export class ActorRoleGuard implements CanActivate {

    constructor(private authService: AuthService, private router: Router){

    }

    canActivate(
        route: ActivatedRouteSnapshot, 
        state: RouterStateSnapshot
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        return new Promise((resolve) => {
            const expectedRole = route.data['expectedRole'];
            const currentActor = this.authService.getCurrentActor();
            let result = false;

            if (currentActor && currentActor.role) {
                const activeRole = new RegExp(currentActor.role.toString(), 'i');
                if (expectedRole.search(activeRole) !== -1) {
                    result = true;
                } else {
                    this.router.navigate(['denied-access'], {
                        queryParams: { previousURL: state.url }
                    });
                }
                resolve(result);
            } else {
                // 🔧 FIX: indexOf devuelve -1 si no encuentra el string
                if (expectedRole.includes('anonymous')) {
                    result = true;
                } else {
                    this.router.navigate(['login'], {
                        queryParams: { returnUrl: state.url }
                    });
                }
                resolve(result);
            }
        });
    }
}