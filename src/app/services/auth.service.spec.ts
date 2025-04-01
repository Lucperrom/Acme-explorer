import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import {provideAuth, getAuth} from '@angular/fire/auth';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { environment } from 'src/environments/environment';
import { AuthGuard } from '../guards/auth.guard';
import { HttpClientModule } from '@angular/common/http';
import { Actor } from '../models/actor.model';
import { Firestore, provideFirestore } from '@angular/fire/firestore';
import { getFirestore } from 'firebase/firestore';

let testUser = new Actor()
testUser.name = "John";
testUser.surname = "Doe";
testUser.email = 'newuser15@example.com',
testUser.password = 'password123';
testUser.role = 'CONSUMER';
testUser.phone = '123456789';

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('AuthService', () => {
  let service: AuthService;
  let auth: any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
        provideAuth(() => getAuth()),
        provideFirestore(() => getFirestore())
      ],
      providers: [AuthGuard, { provide: Firestore, useValue: {} }]
    });
    service = TestBed.inject(AuthService);
    auth = getAuth();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return roles', () => {
    expect(service.getRoles()).toEqual(['EXPLORER', 'MANAGER', 'SPONSOR']);
  });

  it('[+] should sign up successfully', async () => {
    // Ensure the test user is removed before starting the flow
    try {
      await service.removeUser(testUser.email, testUser.password);
      console.log('Test user deleted');
    } catch (error: any) {
      console.warn('Test user not found or already deleted:', error?.message);
    }
    await delay(200); // Delay after user deletion

    // Sign up
    const signUpResult = await service.signUp(testUser);
    console.log('Sign up successful');
    expect(signUpResult).toBeTruthy();
    await delay(200); // Delay after sign-up
  });

  it('[+] should log in successfully', async () => {
    // Log in
    const loginResult = await service.login(testUser.email, testUser.password);
    console.log('Login successful');
    expect(loginResult).toBeTruthy();
  });

  it('[+] should log out successfully', async () => {
    // Log out
    const logoutResult = await service.logout();
    console.log('Logout successful');
    expect(logoutResult).toBeTruthy();
  });

  it('[-] should fail to login with wrong credentials', async () => {
    const badLoginData = {
      email: 'wronguser@example.com',
      password: 'wrongpassword'
    };
    try {
      await service.login(badLoginData.email, badLoginData.password);
      fail('Expected login to fail, but it succeeded');
    } catch (error: any) {
      expect(error).toBeTruthy();
    }
    await delay(1000); // Delay after failed login
  });
});
