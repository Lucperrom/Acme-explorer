import { AfterViewInit, Component, OnInit } from '@angular/core';
import {
  AbstractControl, FormArray, FormControl, FormGroup, ValidationErrors,
  ValidatorFn, Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { Actor } from 'src/app/models/actor.model';
import { Location } from 'src/app/models/location.model';
import { AuthService } from 'src/app/services/auth.service';
import { MessageService } from 'src/app/services/message.service';
import { TripService } from 'src/app/services/trip.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-trip-form',
  templateUrl: './trip-form.component.html',
  styleUrls: ['./trip-form.component.css']
})
export class TripFormComponent implements AfterViewInit, OnInit {
  tripForm!: FormGroup;
  actor: Actor | null = null;
  map!: L.Map;
  marker!: L.Marker;
  searchQuery: string = ''; // Add search query state

  constructor(
    private tripService: TripService,
    private router: Router,
    private messageService: MessageService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.tripForm = new FormGroup({
      title: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      price: new FormControl({ value: 0, disabled: true }),
      startDate: new FormControl('', [Validators.required, this.futureDateValidator()]),
      endDate: new FormControl('', [Validators.required, this.endDateAfterStartDateValidator()]),
      stages: new FormArray([], [Validators.required, this.nonEmptyArrayValidator()]),
      requirements: new FormArray([], [Validators.required, this.nonEmptyArrayValidator()]),
      pictures: new FormArray([]),
      location: new FormGroup({
        latitude: new FormControl(null), // Latitude field
        longitude: new FormControl(null), // Longitude field
        address: new FormControl('') // Address field
      }),
      searchQuery: new FormControl('') // Add searchQuery as a FormControl
    });

    this.tripForm.get('stages')?.valueChanges.subscribe(() => this.updatePrice());
    this.actor = this.authService.getCurrentActor();
    if (!this.actor) {
      console.log('No actor found. Creating a trip is not possible. Redirecting to login page.');
      this.router.navigate(['/login']);
      return;
    }
  }

  nonEmptyArrayValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const array = control as FormArray;
      return array.length > 0 ? null : { emptyArray: true };
    };
  }

  prefillForm(): void {
    this.tripForm.patchValue({
      title: 'Sample Trip Title',
      description: 'This is a sample trip description.',
      startDate: '2027-01-01',
      endDate: '2027-12-31'
    });

    const stagesArray = this.tripForm.get('stages') as FormArray;
    stagesArray.clear();
    stagesArray.push(new FormGroup({
      title: new FormControl('Stage 1', Validators.required),
      description: new FormControl('Description for Stage 1', Validators.required),
      price: new FormControl(100, [Validators.required, Validators.min(0)])
    }));

    const requirementsArray = this.tripForm.get('requirements') as FormArray;
    requirementsArray.clear();
    requirementsArray.push(new FormControl('Requirement 1', Validators.required));
  }


  ngAfterViewInit(): void {
    this.initializeMap();
  }

  initializeMap(): void {
    const customIcon = L.icon({
      iconUrl: '/assets/images/marker.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41]
    });

    // Ensure the map is initialized only once
    if (!this.map) {
      this.map = L.map('map').setView([0, 0], 2);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map);

      this.map.on('click', async (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        await this.updateLocation(lat, lng);
        this.map.setView([lat, lng], 13);
      });
    }

    this.map.invalidateSize();

    // Update marker position if form values change
    this.tripForm.get('location')?.valueChanges.subscribe((loc: any) => {
      if (loc.latitude && loc.longitude) {
        if (this.marker) {
          this.marker.setLatLng([loc.latitude, loc.longitude]);
        } else {
          this.marker = L.marker([loc.latitude, loc.longitude], { icon: customIcon }).addTo(this.map);
        }
        this.map.setView([loc.latitude, loc.longitude], 13);
      }
    });
  }

  async updateLocation(lat: number, lng: number, address?: string): Promise<void> {
    const locationGroup = this.tripForm.get('location') as FormGroup;
    locationGroup.get('latitude')?.setValue(lat);
    locationGroup.get('longitude')?.setValue(lng);
    try {
      if (!address) {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await res.json();
        address = data.display_name || '';
      }
      locationGroup.get('address')?.setValue(address);
    } catch (error) {
      console.error('Error fetching address:', error);
      locationGroup.get('address')?.setValue('');
    }
  }

  async handleSearch(): Promise<void> {
    const searchQuery = this.tripForm.get('searchQuery')?.value;
    if (!searchQuery.trim()) {
      console.warn('Search query is empty.');
      return;
    }

    try {
      const encodedQuery = encodeURIComponent(searchQuery.trim());
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}`);
      const data = await response.json();

      if (data.length > 0) {
        const { lat, lon, display_name } = data[0];
        this.map.setView([parseFloat(lat), parseFloat(lon)], 13);
        await this.updateLocation(parseFloat(lat), parseFloat(lon), display_name);
      } else {
        console.warn('No results found for the search query.');
      }
    } catch (error) {
      console.error('Error searching for location:', error);
    }
  }

  onSearch(event: Event): void {
    event.preventDefault(); // Prevent form submission
    const input = event.target as HTMLInputElement;
    this.searchQuery = input.value;

    if (this.searchQuery.trim()) {
      this.handleSearch();
    }
  }

  // Utility Getters
  get stages(): FormArray {
    return this.tripForm.get('stages') as FormArray;
  }

  get requirements(): FormArray {
    return this.tripForm.get('requirements') as FormArray;
  }

  get pictures(): FormArray {
    return this.tripForm.get('pictures') as FormArray;
  }

  // Stage & Requirement Management
  createStageGroup(): FormGroup {
    return new FormGroup({
      title: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
      price: new FormControl(0, [Validators.required, Validators.min(0)])
    });
  }

  addStage(): void {
    this.stages.push(this.createStageGroup());
    this.updatePrice();
  }

  removeStage(index: number): void {
    this.stages.removeAt(index);
    this.updatePrice();
  }

  addRequirement(): void {
    this.requirements.push(new FormControl('', Validators.required));
  }

  removeRequirement(index: number): void {
    this.requirements.removeAt(index);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    Array.from(input.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        this.pictures.push(new FormControl(reader.result));
      };
      reader.readAsDataURL(file);
    });
  }

  triggerFileInput(): void {
    const fileInput = document.getElementById('pictures') as HTMLInputElement;
    fileInput.click();
  }

  removePicture(index: number): void {
    this.pictures.removeAt(index);
  }

  updatePrice(): void {
    const total = this.stages.controls.reduce((sum, control) => {
      const price = control.get('price')?.value || 0;
      return sum + price;
    }, 0);
    this.tripForm.get('price')?.setValue(total);
  }

  async onSubmit(): Promise<void> {
    console.log('Form Valid?', this.tripForm.valid);
    console.log('Form Errors:', this.tripForm.errors);
  
    if (this.tripForm.invalid) {
      this.tripForm.markAllAsTouched();
      this.messageService.notifyMessage('Invalid form, please fix the errors', 'alert-danger');
      return;
    }

    try {
      console.log('Form is valid, submitting...');
      const tripData = {
        ...this.tripForm.getRawValue(),
        managerId: this.actor?.email,
        managerName: `${this.actor?.name || ''} ${this.actor?.surname || ''}`,
        createdAt: new Date()
      };
      console.log('Trip Data:', tripData);
      const tripId = await this.tripService.createTrip(tripData);
      this.messageService.notifyMessage('Trip created successfully', 'alert-success');
      this.router.navigate(['/trips', tripId]);
      this.tripForm.reset();
    } catch (error) {
      this.messageService.notifyMessage('Error creating trip', 'alert-danger');
      console.error('Error creating trip:', error);
    }
  }


  // Custom Validators
  private futureDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const inputDate = new Date(control.value);
      const today = new Date();
      return inputDate > today ? null : { notInFuture: true };
    };
  }

  private endDateAfterStartDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const startDate = new Date(this.tripForm?.get('startDate')?.value);
      const endDate = new Date(control.value);
      return endDate > startDate ? null : { endBeforeStart: true };
    };
  }
}