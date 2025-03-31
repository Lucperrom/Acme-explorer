import { TestBed } from '@angular/core/testing';
import { TripService } from './trip.service';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Trip } from '../models/trip.model';
import { Firestore } from '@angular/fire/firestore';

describe('TripService', () => {

  let service: TripService;

  let testId = 'c79d682d-239f-476d-8228-7cfa7f4e46ba';
  let httpTestingController: HttpTestingController;

  let testTrip: Trip;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TripService, { provide: Firestore, useValue: {} }]
    });
  
    service = TestBed.inject(TripService);
    httpTestingController = TestBed.inject(HttpTestingController);
  
    // Initialize test object
    testTrip = new Trip();
    
    testTrip.ticker = "TRIP-2023-001";
    testTrip.title = "Amazing Adventure";
    testTrip.description = "An amazing adventure trip to explore the mountains.";
    testTrip.price = 1200.5;
    testTrip.requirements = ["Passport", "Travel Insurance"];
    testTrip.startDate = new Date("2023-12-01");
    testTrip.endDate = new Date("2023-12-10");
    testTrip.origin = "New York";
    testTrip.destinity = "Swiss Alps";
    testTrip.cancelledReason = "";
    testTrip.deleted = false;
    testTrip.pictures = ["../../assets/images/trip1.jpg"];
  });

  it('getTripById should return a correct trip observable', async () => {
    let remoteTrip: Trip | undefined;
    service.getTripById(testId).then((trip) => {
      remoteTrip = trip;
    });
  
    const request = httpTestingController.expectOne(`trips/${testId}`);
    request.flush(testTrip);
  
    expect(remoteTrip).toBeDefined();
    expect(remoteTrip?.ticker).toBe(testTrip.ticker);
    expect(remoteTrip?.title).toBe(testTrip.title);
    expect(remoteTrip?.price).toBe(testTrip.price);
    expect(remoteTrip?.origin).toBe(testTrip.origin);
    expect(remoteTrip?.destinity).toBe(testTrip.destinity);
    expect(remoteTrip?.pictures).toHaveSize(1);
  });

  it('should return an error when the server returns a 500', async () => {
    const status = 500;
    const statusText = 'Internal Server Error';
    const errorEvent = new ErrorEvent('API error');
  
    let actualError: HttpErrorResponse | undefined;
  
    service.getTripById(testId).catch((error) => {
      actualError = error;
    });
  
    httpTestingController.expectOne(`trips/${testId}`).error(errorEvent, { status, statusText });
  
    if (!actualError) {
      throw new Error('Error needs to be defined');
    }
  
    expect(actualError.error).toBe(errorEvent);
    expect(actualError.status).toBe(status);
    expect(actualError.statusText).toBe(statusText);
  });
});

