import { ComponentFixture, TestBed } from "@angular/core/testing";
import { TripDisplayComponent } from "./trip-display.component";
import { ActivatedRoute } from "@angular/router";
import { Trip } from "src/app/models/trip.model";
import { of } from "rxjs";
import { ActivatedRouteStub } from "../../shared/activatedRouteStub";
import { Firestore } from '@angular/fire/firestore';
import { TripService } from "src/app/services/trip.service";

describe('TripDisplayComponent', () => {
    let component: TripDisplayComponent;
    let fixture: ComponentFixture<TripDisplayComponent>;
    let activatedRouteStub: ActivatedRouteStub;
    let tripServiceSpy: jasmine.SpyObj<TripService>;
    let testTrip: Trip;

    beforeEach(async () => {
        activatedRouteStub = new ActivatedRouteStub();
        activatedRouteStub.testParams = { id: '123' };

        testTrip = new Trip();
        testTrip.title = "Test Trip";
        testTrip.description = "Test Description";
        testTrip.price = 50;

        tripServiceSpy = jasmine.createSpyObj('TripService', ['getTripById']);
        tripServiceSpy.getTripById.and.returnValue(Promise.resolve(testTrip));

        await TestBed.configureTestingModule({
            declarations: [TripDisplayComponent],
            providers: [
                { provide: ActivatedRoute, useValue: activatedRouteStub },
                { provide: TripService, useValue: tripServiceSpy },
                { provide: Firestore, useValue: {} } // Mock Firestore
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(TripDisplayComponent);
        component = fixture.componentInstance;
    });

    it('should create', async () => {
        await component.ngOnInit(); // Ensure async data loads
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('should have correct id', async () => {
        await component.ngOnInit();
        fixture.detectChanges();
        expect(component.getTripId()).toBe('123'); // Use () for method
    });

    it('should have correct title', async () => {
        await component.ngOnInit();
        fixture.detectChanges();
        expect(component.getName()).toBe(testTrip.title);
    });

    it('should have correct description', async () => {
        await component.ngOnInit();
        fixture.detectChanges();
        expect(component.getDescription()).toBe(testTrip.description);
    });

    it('should have correct price', async () => {
        await component.ngOnInit();
        fixture.detectChanges();
        expect(component.getPrice()).toBe(testTrip.price);
    });
});
