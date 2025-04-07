import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TripListComponent } from './trip-list.component';
import { TripService } from '../../../services/trip.service';
import { AuthService } from '../../../services/auth.service';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

describe('TripListComponent', () => {
  let component: TripListComponent;
  let fixture: ComponentFixture<TripListComponent>;
  let mockTripService: any;
  let mockAuthService: any;

  beforeEach(async () => {
    mockTripService = {
      getAllTrips: jasmine.createSpy('getAllTrips').and.returnValue(Promise.resolve([
        { id: '1', title: 'Trip 1', description: 'Description 1', price: 100, startDate: new Date(), endDate: new Date(), pictures: [], deleted: false, cancelledReason: '', managerName: 'Manager 1', createdAt: new Date() },
        { id: '2', title: 'Trip 2', description: 'Description 2', price: 200, startDate: new Date(), endDate: new Date(), pictures: [], deleted: false, cancelledReason: '', managerName: 'Manager 2', createdAt: new Date() },
        { id: '3', title: 'Trip 3', description: 'Description 3', price: 300, startDate: new Date(), endDate: new Date(), pictures: [], deleted: false, cancelledReason: '', managerName: 'Manager 3', createdAt: new Date() }
      ]))
    };

    mockAuthService = {
      getActor: jasmine.createSpy('getActor').and.returnValue(of({
        id: 'actor1',
        name: 'John Doe',
        role: 'MANAGER'
      }))
    };

    await TestBed.configureTestingModule({
      declarations: [TripListComponent],
      imports: [RouterTestingModule, NgbCarouselModule, FontAwesomeModule],
      providers: [
        { provide: TripService, useValue: mockTripService },
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TripListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });


  it('should display trips correctly', async () => {
    await fixture.whenStable(); // Wait for async operations
    fixture.detectChanges(); // Trigger change detection

    const tripCards = fixture.debugElement.queryAll(By.css('.card'));
    expect(tripCards.length).toBe(3);
  });
});
