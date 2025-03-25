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
import {provideAuth, getAuth} from '@angular/fire/auth';
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
    TermsAndConditionsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    NgbCarouselModule,
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth())
  ],
  providers: [AuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
