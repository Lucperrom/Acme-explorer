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
import { ProfileEditComponent } from './components/profile-edit/profile-edit.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TermsAndConditionsComponent } from './components/terms-and-conditions/terms-and-conditions.component';
import { TripLoadComponent } from './components/trip/trip-load/trip-load.component';
import { TripFormComponent } from './components/trip/trip-form/trip-form.component';
const routes: Routes = [
  { path: 'profile/:id', component: ProfileEditComponent },
  { path: 'login', component: LoginComponent, canActivate: [ActorRoleGuard], data: {expectedRole: 'anonymous'} },
  { path: 'register', component: RegisterComponent, canActivate: [ActorRoleGuard], data: {expectedRole: 'anonymous' }},
  { path: 'trips', children:[
    { path: 'load', component: TripLoadComponent, canActivate: [ActorRoleGuard], data: {expectedRole: 'administrator' }},
    {path: 'create', component: TripFormComponent, canActivate: [ActorRoleGuard], data: {expectedRole: 'manager', mode: 'post' }},
    {path: ':id', component: TripDisplayComponent, canActivate: [AuthGuard]},
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
  { path: 'terms-and-conditions', component: TermsAndConditionsComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [ActorRoleGuard], data: {expectedRole: 'administrator'} },
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
