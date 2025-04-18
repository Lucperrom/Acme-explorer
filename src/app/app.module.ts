import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TripDisplayComponent } from './components/trip/trip-display/trip-display.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
import { TripListComponent } from './components/trip/trip-list/trip-list.component';
import { RegisterComponent } from './components/security/register/register.component';
import { LoginComponent } from './components/security/login/login.component';
import { environment } from 'src/environments/environment';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HomeComponent } from './components/home/home.component';
import { AuthGuard } from './guards/auth.guard';
import { MessageComponent } from './components/master/message/message.component';
import { FooterComponent } from './components/master/footer/footer.component';
import { DeniedAccessComponent } from './components/security/denied-access/denied-access.component';
import { ProfileEditComponent } from './components/profile-edit/profile-edit.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TermsAndConditionsComponent } from './components/terms-and-conditions/terms-and-conditions.component';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ApplicationTableComponent } from './components/application-table/application-table.component';
import { TripLoadComponent } from './components/trip/trip-load/trip-load.component';
import { TripFormComponent } from './components/trip/trip-form/trip-form.component';
import { ApplicationListComponent } from './components/application-list/application-list.component';
import { CommonModule } from '@angular/common';
import { TripForecastComponent } from './components/trip/trip-forecast/trip-forecast.component';
import { MaxPipe } from './pipes/max.pipe';
import { MinPipe } from './pipes/min.pipe';
import { SponsorshipListComponent } from './components/sponsorship/sponsorship-list/sponsorship-list.component';
import { SponsorshipEditComponent } from './components/sponsorship/sponsorship-edit/sponsorship-edit.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { NgxPayPalModule } from 'ngx-paypal';
import { CreateManagerComponent } from './components/security/create-manager/create-manager.component';
import { FinderComponent } from './components/finder/finder.component';
import { CubeComponent } from './components/cube/cube.component';

@NgModule({
  declarations: [
    AppComponent,
    TripDisplayComponent,
    TripListComponent,
    RegisterComponent,
    LoginComponent,
    NotFoundComponent,
    NavbarComponent,
    HomeComponent,
    MessageComponent,
    FooterComponent,
    DeniedAccessComponent,
    ProfileEditComponent,
    DashboardComponent,
    TermsAndConditionsComponent,
    ApplicationTableComponent,
    TripLoadComponent,
    TripFormComponent,
    ApplicationListComponent,
    TripForecastComponent,
    MaxPipe,
    MinPipe,
    SponsorshipListComponent,
    SponsorshipEditComponent,
    CheckoutComponent,
    CreateManagerComponent,
    FinderComponent,
    CubeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    FormsModule,
    HttpClientModule,
    NgxDatatableModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    NgbCarouselModule,
    NgxDatatableModule,
    NgxPayPalModule,
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    CommonModule,
  ],
  providers: [AuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
