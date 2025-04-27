import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApplicationListComponent } from './application-list.component';
import { ApplicationService } from 'src/app/services/application.service';
import { AuthService } from 'src/app/services/auth.service';
import { TripService } from 'src/app/services/trip.service';
import { MessageService } from 'src/app/services/message.service';
import { Firestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';

describe('ApplicationListComponent', () => {
  let component: ApplicationListComponent;
  let fixture: ComponentFixture<ApplicationListComponent>;
  let mockApplicationService: any;
  let mockAuthService: any;
  let mockTripService: any;
  let mockMessageService: any;
  let mockFirestore: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockApplicationService = {
      getAllApplicationsByExplorerId: jasmine.createSpy('getAllApplicationsByExplorerId').and.returnValue(Promise.resolve([])),
      getAllApplicationsByManagerId: jasmine.createSpy('getAllApplicationsByManagerId').and.returnValue(Promise.resolve([])),
      updateApplicationStatus: jasmine.createSpy('updateApplicationStatus').and.returnValue(Promise.resolve())
    };

    mockAuthService = {
      getCurrentActor: jasmine.createSpy('getCurrentActor').and.returnValue({ role: 'manager', email: 'manager@example.com' })
    };

    mockTripService = {
      getTripById: jasmine.createSpy('getTripById').and.returnValue(Promise.resolve({ title: 'Test Trip' }))
    };

    mockMessageService = {
      notifyMessage: jasmine.createSpy('notifyMessage')
    };

    mockFirestore = {
      collection: jasmine.createSpy('collection').and.returnValue({}),
      doc: jasmine.createSpy('doc').and.returnValue({}),
      getDocs: jasmine.createSpy('getDocs').and.returnValue(Promise.resolve({ docs: [] })),
      getDoc: jasmine.createSpy('getDoc').and.returnValue(Promise.resolve({ exists: () => true, data: () => ({ title: 'Mock Trip' }) }))
    };

    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    await TestBed.configureTestingModule({
      declarations: [ApplicationListComponent],
      providers: [
        { provide: ApplicationService, useValue: mockApplicationService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: TripService, useValue: mockTripService },
        { provide: MessageService, useValue: mockMessageService },
        { provide: Firestore, useValue: mockFirestore }, // Proveedor funcional para Firestore
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should combine filters for status and trip title', () => {
    component.applications = [
      { status: 'pending', trip: { title: 'Trip 1' } },
      { status: 'accepted', trip: { title: 'Trip 2' } },
      { status: 'pending', trip: { title: 'Trip 2' } }
    ];

    component.selectedStatus = 'pending';
    component.selectedTripTitle = 'Trip 2';
    component.filterApplications();

    expect(component.filteredApplications.length).toBe(1);
    expect(component.filteredApplications[0].status).toBe('pending');
    expect(component.filteredApplications[0].trip.title).toBe('Trip 2');
  });

  it('should refresh applications', async () => {
    mockApplicationService.getAllApplicationsByManagerId.and.returnValue(Promise.resolve([
      { tripId: 'trip1', status: 'pending' }
    ]));

    await component.refreshApplications();

    expect(mockApplicationService.getAllApplicationsByManagerId).toHaveBeenCalledWith('manager@example.com');
    expect(component.applications.length).toBe(1);
  });

  it('should notify when rejecting an application without a reason', () => {
    component.rejectReason = '';
    component.rejectApplication({});

    expect(mockMessageService.notifyMessage).toHaveBeenCalledWith("Please provide a reason for rejection", "alert-danger");
  });

  it('should update application status to rejected with a reason', async () => {
    component.rejectReason = 'Not eligible';
    const application = { id: 'app1' };

    await component.rejectApplication(application);

    expect(mockApplicationService.updateApplicationStatus).toHaveBeenCalledWith(
      application.id,
      'rejected',
      { ...application, rejectReason: 'Not eligible' }
    );
    expect(component.rejectReason).toBe('');
  });

  it('should navigate to checkout page when paying for an application', async () => {
    component.actor = { role: 'explorer' }; // Ensure the actor is an explorer
    const application = { id: 'app1', trip: { price: 100 } };

    component.payForApplication(application);

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/checkout-application'], {
      queryParams: { total: 100, applicationId: 'app1' }
    });
  });

  it('should list applications of a trip that has at least two applications', async () => {
    component.applications = [
      { trip: { title: 'Trip 1' }, status: 'pending' },
      { trip: { title: 'Trip 1' }, status: 'accepted' },
      { trip: { title: 'Trip 2' }, status: 'pending' }
    ];

    component.selectedTripTitle = 'Trip 1';
    component.filterByTripTitle();

    expect(component.filteredApplications.length).toBe(2);
    expect(component.filteredApplications.every(app => app.trip.title === 'Trip 1')).toBeTrue();
  });

  it('should list no applications for a trip that has no applications', async () => {
    component.applications = [
      { trip: { title: 'Trip 1' }, status: 'pending' },
      { trip: { title: 'Trip 2' }, status: 'accepted' }
    ];

    component.selectedTripTitle = 'Trip 3'; // Trip 3 has no applications
    component.filterByTripTitle();

    expect(component.filteredApplications.length).toBe(0);
  });
});
