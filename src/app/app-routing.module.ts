import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/security/login/login.component';
import { RegisterComponent } from './components/security/register/register.component';
import { TripListComponent } from './components/trip/trip-list/trip-list.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { TripDisplayComponent } from './components/trip/trip-display/trip-display.component';
import { HomeComponent } from './components/home/home.component';
import { AuthGuard } from './guards/auth.guard';
const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'trips/:id', component: TripDisplayComponent, canActivate: [AuthGuard] }, // Ruta para un viaje específico
  { path: 'trips', component: TripListComponent, canActivate: [AuthGuard] },
  { path: 'home', component: HomeComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', component: NotFoundComponent },
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
