import { TestBed } from '@angular/core/testing';
import { ApplicationService } from './application.service';
import { Firestore } from '@angular/fire/firestore';

describe('ApplicationService', () => {
  let service: ApplicationService;
  let mockFirestore: any;

  beforeEach(() => {
    mockFirestore = {
      collection: jasmine.createSpy('collection').and.returnValue({}),
      doc: jasmine.createSpy('doc').and.returnValue({}),
      getDocs: jasmine.createSpy('getDocs').and.returnValue(Promise.resolve({ docs: [] })),
      getDoc: jasmine.createSpy('getDoc').and.returnValue(Promise.resolve({ exists: () => true, data: () => ({}) }))
    };

    TestBed.configureTestingModule({
      providers: [
        ApplicationService,
        { provide: Firestore, useValue: mockFirestore } // Proveedor funcional para Firestore
      ]
    });
    service = TestBed.inject(ApplicationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
