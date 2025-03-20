import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import {provideAuth, getAuth} from '@angular/fire/auth';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { environment } from 'src/environments/environment';
import { AuthGuard } from '../guards/auth.guard';
import { HttpClientModule } from '@angular/common/http';
import { Actor } from '../models/actor.model';

describe('AuthService', () => {
  let service: AuthService;
  let auth: any;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
          HttpClientModule,
          provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
          provideAuth(() => getAuth())
        ],
        providers: [AuthGuard]
    })
    service = TestBed.inject(AuthService);
    auth = getAuth();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return roles', () => {
    expect(service.getRoles()).toEqual(['CLERK', 'ADMINISTRATOR', 'CONSUMER']);
  });

  // it('should sign up, log in, and log out', async () => {
  //   // Create an instance of Actor
  //   const actor = new Actor();
  //   actor.name = 'Test Name';
  //   actor.surname = 'Test Surname';
  //   actor.phone = '123456789';
  //   actor.role = 'ADMINISTRATOR';
  //   actor.email = 'newuser15@example.com';
  //   actor.password = 'password123';

  //   await service.signUp(actor);

  //   const responseLogOut = await service.logout();
  //   console.log(responseLogOut)

  //   const responseLogin = await service.login(actor.email, actor.password);
  //   expect(responseLogin).toBeDefined();
  //   const user = auth.currentUser;
  //   console.log('User: ', user);
  //   expect(user).toBeDefined();

    // // Delete the user
    // if (user) {
    //   await user.delete();
    
    //   // Verifica si el usuario ha sido eliminado correctamente
    //   const refreshedUser = auth.currentUser; 
    //   expect(refreshedUser).toBeNull(); // Ahora sí debe ser null
    // }
  // });
});
