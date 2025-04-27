import { TestBed } from '@angular/core/testing';
import { TripService } from './trip.service';
import { Firestore } from '@angular/fire/firestore';
import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule
import { MeteoService } from './meteo.service'; // Import MeteoService
import { Trip } from '../models/trip.model';



describe('TripService', () => {
  let service: TripService;
  let firestoreMock: any;

  let testTripData: any;

  let testId = 'c79d682d-239f-476d-8228-7cfa7f4e46ba';
  let testTrip: Trip;

  beforeEach(() => {
    // Simulamos los datos de Firestore
    testTripData = {
      ticker: "TRIP-2023-001",
      title: "Amazing Adventure",
      description: "An amazing adventure trip to explore the mountains.",
      price: 1200.5,
      requirements: ["Passport", "Travel Insurance"],
      startDate: "2023-12-01T00:00:00Z",
      endDate: "2023-12-10T00:00:00Z",
      cancelledReason: "",
      deleted: false,
      pictures: ["https://example.com/image1.jpg"]
    };

    firestoreMock = {
      doc: jasmine.createSpy().and.returnValue({}),
      getDoc: jasmine.createSpy().and.returnValue(Promise.resolve({ exists: () => true, data: () => testTripData })),
    };

    TestBed.configureTestingModule({
      imports: [HttpClientModule], // Add HttpClientModule here
      providers: [
        TripService,
        MeteoService, // Provide MeteoService
        { provide: Firestore, useValue: firestoreMock },
      ],
    });

    service = TestBed.inject(TripService);
  });

  it('getCurrentTripFromDoc should correctly map data to Trip', () => {
    const docMock = { data: () => testTripData, id: 'some-id' };
    const trip = service['getCurrentTripFromDoc'](docMock);

    expect(trip.id).toBe('some-id');
    expect(trip.ticker).toBe(testTripData.ticker);
    expect(trip.title).toBe(testTripData.title);
    expect(trip.price).toBe(testTripData.price);
    expect(trip.pictures.length).toBe(1);
    expect(trip.deleted).toBe(false);
  });

  it('should return an empty object when the trip does not exist', async () => {
    firestoreMock.getDoc.and.returnValue(Promise.resolve({ exists: () => false }));

    const trip = await service.getTripById(testId);

    expect(trip).toEqual({} as Trip);
  });
});
