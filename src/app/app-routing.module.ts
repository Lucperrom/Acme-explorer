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
import { TripForecastComponent } from './components/trip/trip-forecast/trip-forecast.component';
import { ApplicationListComponent } from './components/application-list/application-list.component';
import { SponsorshipListComponent } from './components/sponsorship/sponsorship-list/sponsorship-list.component';
import { SponsorshipEditComponent } from './components/sponsorship/sponsorship-edit/sponsorship-edit.component';
import { CheckoutComponent } from './components/checkout/checkout.component';

const routes: Routes = [
  { path: 'profile/:id', component: ProfileEditComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent, canActivate: [ActorRoleGuard], data: {expectedRole: 'anonymous'} },
  { path: 'register', component: RegisterComponent, canActivate: [ActorRoleGuard], data: {expectedRole: 'anonymous' }},
  {
    path: 'forecast', children: [
      { path: ':id', component: TripForecastComponent },
    ]
  },
  { path: 'trips', children:[
    { path: 'load', component: TripLoadComponent, canActivate: [AuthGuard,ActorRoleGuard], data: {expectedRole: 'administrator' }},
    {path: 'create', component: TripFormComponent, canActivate: [AuthGuard,ActorRoleGuard], data: {expectedRole: 'manager', mode: 'post' }},
    {path: ':id', component: TripDisplayComponent},
    {path: '', component: TripListComponent},
    {path: 'edit/:id', component: TripFormComponent, canActivate: [AuthGuard,ActorRoleGuard], data: {expectedRole: 'manager', mode: 'put' }},

   ]},
  { path: 'applications', component: ApplicationListComponent, canActivate: [AuthGuard,ActorRoleGuard], data: {expectedRole: 'manager'} },
  { path: 'my-applications', component: ApplicationListComponent, canActivate: [AuthGuard,ActorRoleGuard], data: {expectedRole: 'explorer'} },
   //Crear ApplicationListComponent
  // { path: 'applications', component: ApplicationListComponent, children: [
  //   {path:'list-pending', component: ApplicationListComponent},
  //   {path:'list-rejected', component: ApplicationListComponent},
  //   {path:'list-due', component: ApplicationListComponent},
  //   {path:'list-accepted',component: ApplicationListComponent}
  // ]},
  //PENDIENTE
  {path: 'checkout', component: CheckoutComponent, canActivate: [AuthGuard,ActorRoleGuard], data: {expectedRole: 'sponsor'} },
  { path: 'sponsorships', children:[
    {path: 'create/:tripTicker', component: SponsorshipEditComponent, canActivate: [AuthGuard,ActorRoleGuard], data: {expectedRole: 'sponsor', mode: 'post' }},
    // {path: ':id', component: TripDisplayComponent},
    {path: '', component: SponsorshipListComponent, canActivate: [AuthGuard,ActorRoleGuard], data: {expectedRole: 'sponsor|administrator' }},
    {path: 'edit/:id', component: SponsorshipEditComponent, canActivate: [AuthGuard,ActorRoleGuard], data: {expectedRole: 'sponsor|administrator', mode: 'put' }},
   ]},
  { path: 'terms-and-conditions', component: TermsAndConditionsComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard, ActorRoleGuard], data: { expectedRole: 'administrator' } },
  { path: 'home', component: HomeComponent },
  { path: 'denied-access', component: DeniedAccessComponent },
  { path: '', redirectTo: '/trips', pathMatch: 'full' },
  { path: '**', component: NotFoundComponent },
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
