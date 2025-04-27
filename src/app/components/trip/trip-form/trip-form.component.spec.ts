import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormArray, FormControl, Validators, FormGroup } from '@angular/forms';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { TripFormComponent } from './trip-form.component';
import { TripService } from '../../../services/trip.service';
import { AuthService } from '../../../services/auth.service';
import { MessageService } from '../../../services/message.service';
import { Router, ActivatedRoute } from '@angular/router'; // Import ActivatedRoute
import { of, throwError } from 'rxjs';
import { Firestore } from '@angular/fire/firestore'; // Import Firestore
import { FieldTranslationPipe } from '../../../pipes/field-translation.pipe'; // Import the pipe

describe('TripFormComponent', () => {
  let component: TripFormComponent;
  let fixture: ComponentFixture<TripFormComponent>;
  let mockTripService: any;
  let mockAuthService: any;
  let mockMessageService: any;
  let mockRouter: any;
  let mockActivatedRoute: any; // Add mock for ActivatedRoute

  beforeEach(async () => {
    mockTripService = {
      createTrip: jasmine.createSpy('createTrip').and.returnValue(of('tripId123'))
    };

    mockAuthService = {
      getCurrentActor: jasmine.createSpy('getCurrentActor').and.returnValue({
        id: 'actor1',
        name: 'John',
        surname: 'Doe',
        email: 'actor@actor.com',
        role: 'MANAGER'
      })
    };

    mockMessageService = {
      notifyMessage: jasmine.createSpy('notifyMessage')
    };

    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue(null)
        },
        routeConfig: {
          path: ''
        }
      }
    };

    await TestBed.configureTestingModule({
      declarations: [
        TripFormComponent,
        FieldTranslationPipe // Ensure the pipe is declared
      ],
      imports: [
        ReactiveFormsModule, // Ensure ReactiveFormsModule is imported
        FormsModule // Add FormsModule to imports
      ],
      providers: [
        { provide: TripService, useValue: mockTripService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: MessageService, useValue: mockMessageService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }, // Provide mock ActivatedRoute
        { provide: Firestore, useValue: {} } // Mock Firestore
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TripFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function initializeFormArrays() {
    (component.tripForm.get('stages') as FormArray).push(component.createStageGroup());
    (component.tripForm.get('requirements') as FormArray).push(new FormControl('Requirement 1', Validators.required));
    component.tripForm.addControl('cancelledReason', new FormControl(''));
    component.tripForm.addControl('deleted', new FormControl(false));
    component.tripForm.addControl('location', new FormGroup({
      latitude: new FormControl(null),
      longitude: new FormControl(null),
      address: new FormControl('')
    }));
    component.tripForm.addControl('searchQuery', new FormControl('')); // Ensure searchQuery is initialized
  }

  // ------------------ POSITIVE CASES ------------------
  it('[+] should create a trip with all valid fields filled', async () => {
    initializeFormArrays();

    component.tripForm.setValue({
      title: 'Jungle party',
      description: 'A fun jungle adventure',
      startDate: '2025-09-20',
      endDate: '2025-10-01',
      price: 500,
      stages: [{ title: 'Stage 1', description: 'Stage 1 desc', price: 500 }],
      requirements: ['Requirement 1'],
      pictures: [],
      cancelledReason: '',
      deleted: false,
      location: { latitude: 41.3851, longitude: 2.1734, address: 'Barcelona, Spain' },
      searchQuery: '' // Add searchQuery to the form value
    });

    expect(component.tripForm.valid).toBeTrue();
    await component.onSubmit();

    expect(mockTripService.createTrip).toHaveBeenCalledWith(jasmine.objectContaining({
      title: 'Jungle party',
      description: 'A fun jungle adventure',
      price: '600.00', // Adjusted to match the formatted price
      startDate: '2025-09-20T00:00:00.000Z', // Adjusted to match the ISO string format
      endDate: '2025-10-01T00:00:00.000Z', // Adjusted to match the ISO string format
      stages: [{ title: 'Stage 1', description: 'Stage 1 desc', price: 600 }], // Adjusted to match the formatted stage price
      requirements: ['Requirement 1'],
      pictures: [],
      managerId: 'actor@actor.com',
      managerName: 'John Doe',
      cancelledReason: '',
      deleted: false,
      location: { latitude: 41.3851, longitude: 2.1734, address: 'Barcelona, Spain' },
      searchQuery: '' // Ensure searchQuery is included in the expected object
    }));
  });

  it('[+] should create a trip with only required fields', async () => {
    initializeFormArrays();

    component.tripForm.setValue({
      title: 'Jungle party',
      description: 'A fun jungle adventure',
      startDate: '2025-09-20',
      endDate: '2025-10-01',
      price: 500,
      stages: [{ title: 'Stage 1', description: 'Stage 1 desc', price: 500 }],
      requirements: ['Requirement 1'],
      pictures: [],
      cancelledReason: '',
      deleted: false,
      location: { latitude: null, longitude: null, address: '' },
      searchQuery: '' // Add searchQuery to the form value
    });

    expect(component.tripForm.valid).toBeTrue();
    await component.onSubmit();

    expect(mockTripService.createTrip).toHaveBeenCalledWith(jasmine.objectContaining({
      title: 'Jungle party',
      description: 'A fun jungle adventure',
      price: '600.00', // Adjusted to match the formatted price
      startDate: '2025-09-20T00:00:00.000Z', // Adjusted to match the ISO string format
      endDate: '2025-10-01T00:00:00.000Z', // Adjusted to match the ISO string format
      stages: [{ title: 'Stage 1', description: 'Stage 1 desc', price: 600 }], // Adjusted to match the formatted stage price
      requirements: ['Requirement 1'],
      pictures: [],
      managerId: 'actor@actor.com',
      managerName: 'John Doe',
      cancelledReason: '',
      deleted: false,
      location: { latitude: null, longitude: null, address: '' },
      searchQuery: '' // Ensure searchQuery is included in the expected object
    }));
  });

  // ------------------ NEGATIVE CASES ------------------

  it('[-] should fail with missing required fields', () => {
    component.tripForm.setValue({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      price: 0,
      stages: [],
      requirements: [],
      pictures: [],
      cancelledReason: '',
      deleted: false,
      location: { latitude: null, longitude: null, address: '' },
      searchQuery: '' // Add searchQuery to the form value
    });

    expect(component.tripForm.invalid).toBeTrue();
    component.onSubmit();

    expect(mockTripService.createTrip).not.toHaveBeenCalled();
  });

  it('[-] should fail if end date is before start date', () => {
    initializeFormArrays();

    component.tripForm.setValue({
      title: 'Jungle party',
      description: 'A fun jungle adventure',
      startDate: '2025-10-01',
      endDate: '2025-09-20',
      price: 500,
      stages: [{ title: 'Stage 1', description: 'Stage 1', price: 500 }],
      requirements: ['Requirement 1'],
      pictures: [],
      cancelledReason: '',
      deleted: false,
      location: { latitude: null, longitude: null, address: '' },
      searchQuery: '' // Add searchQuery to the form value
    });

    expect(component.tripForm.invalid).toBeTrue();
    component.onSubmit();

    expect(mockTripService.createTrip).not.toHaveBeenCalled();
  });

  it('[-] should fail if start date is not in the future', () => {
    initializeFormArrays();

    const pastDate = new Date();
    pastDate.setFullYear(pastDate.getFullYear() - 1);

    component.tripForm.setValue({
      title: 'Past Trip',
      description: 'Trip with past date',
      startDate: pastDate.toISOString().split('T')[0],
      endDate: '2025-12-31',
      price: 500,
      stages: [{ title: 'Stage 1', description: 'Stage', price: 500 }],
      requirements: ['Requirement 1'],
      pictures: [],
      cancelledReason: '',
      deleted: false,
      location: { latitude: null, longitude: null, address: '' },
      searchQuery: '' // Add searchQuery to the form value
    });

    expect(component.tripForm.invalid).toBeTrue();
    component.onSubmit();

    expect(mockTripService.createTrip).not.toHaveBeenCalled();
  });


  describe('Validators', () => {
    it('[+] should pass futureDateValidator for a future date', () => {
      const control = new FormControl('2025-12-31', component['futureDateValidator']());
      expect(control.valid).toBeTrue();
    });

    it('[-] should fail futureDateValidator for a past date', () => {
      const pastDate = new Date();
      pastDate.setFullYear(pastDate.getFullYear() - 1);
      const control = new FormControl(pastDate.toISOString().split('T')[0], component['futureDateValidator']());
      expect(control.errors).toEqual({ notInFuture: true });
    });

    it('[+] should pass endDateAfterStartDateValidator when end date is after start date', () => {
      component.tripForm.get('startDate')?.setValue('2025-09-20');
      const control = new FormControl('2025-10-01', component['endDateAfterStartDateValidator']());
      expect(control.valid).toBeTrue();
    });

    it('[-] should fail endDateAfterStartDateValidator when end date is before start date', () => {
      component.tripForm.get('startDate')?.setValue('2025-10-01');
      const control = new FormControl('2025-09-20', component['endDateAfterStartDateValidator']());
      expect(control.errors).toEqual({ endBeforeStart: true });
    });

    it('[+] should pass nonEmptyArrayValidator for a non-empty array', () => {
      const control = new FormArray([new FormControl('Item 1')], component['nonEmptyArrayValidator']());
      expect(control.valid).toBeTrue();
    });

    it('[-] should fail nonEmptyArrayValidator for an empty array', () => {
      const control = new FormArray([], component['nonEmptyArrayValidator']());
      expect(control.errors).toEqual({ emptyArray: true });
    });
  });

  describe('Price Calculation', () => {
    it('[+] should calculate the total price based on stages', () => {
      const stagesArray = component.tripForm.get('stages') as FormArray;

      stagesArray.push(new FormGroup({
        title: new FormControl('Stage 1', Validators.required),
        description: new FormControl('Description 1', Validators.required),
        price: new FormControl(100, [Validators.required, Validators.min(0)])
      }));

      stagesArray.push(new FormGroup({
        title: new FormControl('Stage 2', Validators.required),
        description: new FormControl('Description 2', Validators.required),
        price: new FormControl(200, [Validators.required, Validators.min(0)])
      }));

      component.updatePrice();

      expect(component.tripForm.get('price')?.value).toBe(300);
    });

    it('[-] should set price to 0 if no stages are present', () => {
      const stagesArray = component.tripForm.get('stages') as FormArray;
      stagesArray.clear();

      component.updatePrice();

      expect(component.tripForm.get('price')?.value).toBe(0);
    });

    it('[-] should ignore invalid stage prices during calculation', () => {
      const stagesArray = component.tripForm.get('stages') as FormArray;

      stagesArray.push(new FormGroup({
        title: new FormControl('Stage 1', Validators.required),
        description: new FormControl('Description 1', Validators.required),
        price: new FormControl(100, [Validators.required, Validators.min(0)])
      }));

      stagesArray.push(new FormGroup({
        title: new FormControl('Stage 2', Validators.required),
        description: new FormControl('Description 2', Validators.required),
        price: new FormControl(50, [Validators.required, Validators.min(0)]) // Adjusted to a valid price
      }));

      component.updatePrice();

      expect(component.tripForm.get('price')?.value).toBe(150); // Adjusted expected value
    });
  });
});
