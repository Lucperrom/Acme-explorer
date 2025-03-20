// import { ComponentFixture, TestBed } from '@angular/core/testing';

// import { RegisterComponent } from './register.component';
// import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
// import { HttpClientModule } from '@angular/common/http';
// import { provideAuth } from '@angular/fire/auth';
// import { getAuth } from 'firebase/auth';
// import { environment } from 'src/environments/environment';
// import { AuthGuard } from 'src/app/guards/auth.guard';
// import { AuthService } from 'src/app/services/auth.service';

// describe('RegisterComponent', () => {
//   let component: RegisterComponent;
//   let fixture: ComponentFixture<RegisterComponent>;
//   let service: AuthService;

//   beforeEach(async () => {
//     await TestBed.configureTestingModule({
//       declarations: [ RegisterComponent ],
//       imports: [
//                 HttpClientModule,
//                 provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
//                 provideAuth(() => getAuth())
//               ],
//               providers: [AuthGuard]
//     })
//     .compileComponents();

//     service = TestBed.inject(AuthService);
//     fixture = TestBed.createComponent(RegisterComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
// });
