import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/security/login/login.component';
import { RegisterComponent } from './components/security/register/register.component';
import { TripListComponent } from './components/trip/trip-list/trip-list.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { TripDisplayComponent } from './components/trip/trip-display/trip-display.component';
import { HomeComponent } from './components/home/home.component';
import { AuthGuard } from './guards/auth.guard';
import { ActorRoleGuard } from './guards/actor-role.guard';
import { DeniedAccessComponent } from './components/security/denied-access/denied-access.component';
const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [ActorRoleGuard], data: {expectedRole: 'anonymous'} },
  { path: 'register', component: RegisterComponent, canActivate: [ActorRoleGuard], data: {expectedRole: 'anonymous' }},
  { path: 'trips/:id', component: TripDisplayComponent, canActivate: [AuthGuard] }, // Ruta para un viaje específico
  { path: 'trips', children:[
    // {path: 'load', component: TripLoadComponent, canActivate: [ActorRoleGuard], data: {expectedRole: 'administrator' },
    //Crear TripEditComponent
    // {path: ':id', component: TripEditComponent},
    {path: '', component: TripListComponent}
   ]},

   //Crear ApplicationListComponent
  // { path: 'applications', component: ApplicationListComponent, children: [
  //   {path:'list-pending', component: ApplicationListComponent},
  //   {path:'list-rejected', component: ApplicationListComponent},
  //   {path:'list-due', component: ApplicationListComponent},
  //   {path:'list-accepted',component: ApplicationListComponent}
  // ]},
  //PENDIENTE
  // {path: 'terms-and-conditions', component: TermsAndConditionsComponent},,
  // {path: 'dashboard', component: DashboardComponent},
  { path: 'home', component: HomeComponent },
  { path: 'denied-access', component: DeniedAccessComponent},
  { path: '', redirectTo: '/trips', pathMatch: 'full' },
  { path: '**', component: NotFoundComponent },
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
