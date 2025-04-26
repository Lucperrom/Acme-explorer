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
import { Trip } from 'src/app/models/trip.model';
import { ActivatedRoute } from '@angular/router';
import { ApplicationService } from 'src/app/services/application.service';

@Component({
  selector: 'app-trip-form',
  templateUrl: './trip-form.component.html',
  styleUrls: ['./trip-form.component.css']
})

export class TripFormComponent implements AfterViewInit, OnInit {
  protected isEditMode: boolean = false;
  protected trip: Trip;
  protected tripId: string | null = null;
  tripForm!: FormGroup;
  actor: Actor | null = null;
  map!: L.Map;
  marker!: L.Marker;
  searchQuery: string = ''; // Add search query state
  isDarkMode = false;

  constructor(
    private tripService: TripService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private applicationService: ApplicationService, 
    private authService: AuthService) {
    this.trip = new Trip();
  }

  async ngOnInit(): Promise<void> {
    this.isDarkMode = localStorage.getItem('darkMode') === 'true';
    this.isEditMode = this.route.snapshot.routeConfig?.path?.includes('edit') ?? false;
    this.tripForm = new FormGroup({
      title: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      price: new FormControl({ value: 0, disabled: true }),
      startDate: new FormControl('', [Validators.required, this.futureDateValidator()]),
      endDate: new FormControl('', [Validators.required, this.endDateAfterStartDateValidator()]),
      stages: new FormArray([], [Validators.required, this.nonEmptyArrayValidator()]),
      requirements: new FormArray([], [Validators.required, this.nonEmptyArrayValidator()]),
      cancelledReason: new FormControl(''),
      deleted: new FormControl(false),  // Añadimos el campo deleted al formulario
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

    this.tripId = this.route.snapshot.paramMap.get('id');
    if (this.tripId) {
      this.trip = await this.tripService.getTripById(this.tripId);
      const startDate = this.trip.startDate ? new Date(this.trip.startDate) : new Date();
      const endDate = this.trip.endDate ? new Date(this.trip.endDate) : new Date();
      
      // Verifica que las fechas sean válidas
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.error('Fechas inválidas recibidas:', this.trip.startDate, this.trip.endDate);
        let msg = $localize `Invalid dates received`;
        this.messageService.notifyMessage(msg, 'alert-danger');
        return;
      }
      
      this.trip.startDate = startDate;
      this.trip.endDate = endDate;

      console.log(this.actor, this.trip.managerId);
      if (this.actor && this.isEditMode && this.actor?.email !== this.trip.managerId) {
        this.router.navigate(['/denied-access']);
      }

      const editable = await this.isEditable(this.trip);

      if (!editable) {
        this.router.navigate(['/denied-access']);
      }

      // Actualiza el formulario con los valores del viaje
      this.tripForm.patchValue({
        title: this.trip.title,
        description: this.trip.description,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        price: this.trip.price,
        cancelledReason: this.trip.cancelledReason || '',
        deleted: this.trip.deleted || false  // Inicializamos el campo deleted
      });

      // Setear localización si existe
      if (this.trip.location) {
        this.tripForm.get('location')?.patchValue({
          latitude: this.trip.location.latitude,
          longitude: this.trip.location.longitude,
          address: this.trip.location.address || ''
        });
      }


      // Setear stages
      this.stages.clear();
      if (this.trip.stages && Array.isArray(this.trip.stages)) {
        this.trip.stages.forEach(stage => {
          this.stages.push(new FormGroup({
            title: new FormControl(stage.title, Validators.required),
            description: new FormControl(stage.description, Validators.required),
            price: new FormControl(this.currencyCode === 'GBP' ? stage.price / 1.2 : stage.price, [Validators.required, Validators.min(0)])
          }));
        });
      }

      // Setear requirements
      this.requirements.clear();
      if (this.trip.requirements && Array.isArray(this.trip.requirements)) {
        this.trip.requirements.forEach(req => {
          this.requirements.push(new FormControl(req, Validators.required));
        });
      }

      // Setear pictures (si existen)
      this.pictures.clear();
      if (this.trip.pictures && Array.isArray(this.trip.pictures)) {
        this.trip.pictures.forEach(pic => {
          this.pictures.push(new FormControl(pic));
        });
      }
    }
  }

  nonEmptyArrayValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const array = control as FormArray;
      return array.length > 0 ? null : { emptyArray: true };
    };
  }

  prefillForm(): void {
    // Calculate dates (starting next month, ending a week later)
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() + 6); // In 6 months
    const startDateString = startDate.toISOString().split('T')[0];
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7); // One week after start date
    const endDateString = endDate.toISOString().split('T')[0];
    
    // Prefill main form fields with realistic data
    this.tripForm.patchValue({
      title: 'Explore the Costa Brava Coastline',
      description: 'Discover the breathtaking beauty of the Costa Brava with this week-long adventure. We will explore hidden coves, picturesque fishing villages, and enjoy the Mediterranean cuisine. Perfect for nature lovers and photography enthusiasts alike. The trip includes guided hiking tours, snorkeling sessions, and authentic local experiences.',
      startDate: startDateString,
      endDate: endDateString
    });

    // Clear and add realistic stages
    const stagesArray = this.tripForm.get('stages') as FormArray;
    stagesArray.clear();
    
    stagesArray.push(new FormGroup({
      title: new FormControl('Barcelona to Blanes', Validators.required),
      description: new FormControl('Departure from Barcelona to Blanes. Visit to the Marimurtra Botanical Garden and welcome dinner at a local seafood restaurant.', Validators.required),
      price: new FormControl(150, [Validators.required, Validators.min(0)])
    }));
    
    stagesArray.push(new FormGroup({
      title: new FormControl('Blanes to Tossa de Mar', Validators.required),
      description: new FormControl('Coastal hike from Blanes to Tossa de Mar with spectacular views. Visit to the ancient walled town and Vila Vella historic site.', Validators.required),
      price: new FormControl(120, [Validators.required, Validators.min(0)])
    }));
    
    stagesArray.push(new FormGroup({
      title: new FormControl('Tossa de Mar to Sant Feliu de Guíxols', Validators.required),
      description: new FormControl('Snorkeling experience in crystal clear waters and visit to the Monastery of Sant Feliu. Evening free for shopping and exploration.', Validators.required),
      price: new FormControl(180, [Validators.required, Validators.min(0)])
    }));

    // Clear and add realistic requirements
    const requirementsArray = this.tripForm.get('requirements') as FormArray;
    requirementsArray.clear();
    
    requirementsArray.push(new FormControl('Comfortable walking shoes for coastal hiking', Validators.required));
    requirementsArray.push(new FormControl('Swimwear and beach towel', Validators.required));
    requirementsArray.push(new FormControl('Sunscreen and hat for sun protection', Validators.required));
    requirementsArray.push(new FormControl('Light rain jacket (just in case)', Validators.required));
    
    // Add Barcelona as default location
    this.handleDefaultLocation();
  }

  // Helper method to set a default location for prefill (Barcelona)
  private async handleDefaultLocation(): Promise<void> {
    // Barcelona coordinates
    const latitude = 41.3851;
    const longitude = 2.1734;
    
    try {
      // Update map and form with Barcelona's location
      await this.updateLocation(latitude, longitude, 'Barcelona, Catalonia, Spain');
      
      if (this.map) {
        this.map.setView([latitude, longitude], 10);
      }
    } catch (error) {
      console.error('Error setting default location:', error);
    }
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

  // Add method to clear location data
  clearLocation(): void {
    const locationGroup = this.tripForm.get('location') as FormGroup;
    locationGroup.patchValue({
      latitude: null,
      longitude: null,
      address: ''
    });
    
    // Remove marker if exists
    if (this.marker) {
      this.map.removeLayer(this.marker);
      this.marker = undefined as unknown as L.Marker;
    }
    
    // Reset map view
    this.map.setView([0, 0], 2);
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
      return sum + parseFloat(price);
    }, 0);
    this.tripForm.get('price')?.setValue(total);
  }

  async onSubmit(): Promise<void> {
    console.log('Dates', this.tripForm.get('startDate')?.value, this.tripForm.get('endDate')?.value);
    console.log('Form Valid?', this.tripForm.valid);
    console.log('Form Errors:', this.tripForm.errors);

    // Mark all form controls as touched to trigger validation display
    this.markFormGroupTouched(this.tripForm);

    if (this.tripForm.invalid) {
      let msg = $localize `Please correct the errors before submitting`;
      this.messageService.notifyMessage(msg, 'alert-danger');
      return;
    }

    try {
        console.log('Form is valid, submitting...');
        const formData = this.tripForm.getRawValue();

        let startDate, endDate;
        try {
            startDate = new Date(formData.startDate);
            endDate = new Date(formData.endDate);
            
            // Validar que las fechas son válidas
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                throw new Error('Fechas inválidas');
            }
        } catch (error) {
            let msg = $localize `Error in date format`;
            this.messageService.notifyMessage(msg, 'alert-danger');
            console.error('Error al procesar fechas:', error, formData.startDate, formData.endDate);
            return;
        }

        if (this.currencyCode === 'GBP') {
            formData.price = (formData.price * 1.2).toFixed(2); // Convertir a GBP
            formData.stages.forEach((stage: any) => {
                stage.price = (stage.price * 1.2) // Convertir a GBP
            });
        }


        const tripData = {
            ...formData,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            managerId: this.actor?.email,
            managerName: `${this.actor?.name || ''} ${this.actor?.surname || ''}`,
            ticker: this.trip?.ticker || this.generateTicker(),
            deleted: this.trip?.deleted || false // Aseguramos que el campo deleted se mantiene
        };

        // Asegura que cancelledReason se actualiza con el valor del formulario
        if (this.tripId && formData.cancelledReason !== undefined) {
            tripData.cancelledReason = formData.cancelledReason;
        }

        let tripId;
        if (this.tripId) {
            await this.tripService.updateTrip(this.tripId, tripData);
            tripId = this.tripId;
            let msg = $localize `Trip updated successfully`;
            this.messageService.notifyMessage(msg, 'alert-success');
        } else {
            tripId = await this.tripService.createTrip({
                ...tripData, 
                createdAt: new Date().toISOString(),
                cancelledReason: "",
                deleted: false // Al crear un nuevo viaje, deleted siempre es false
            });
            let msg = $localize `Trip created successfully`;
            this.messageService.notifyMessage(msg, 'alert-success');
        }

        this.router.navigate(['/trips', tripId]);
        this.tripForm.reset();
    } catch (error) {
        let msg = this.tripId ? $localize `Error updating trip` : $localize `Error creating trip`;
        this.messageService.notifyMessage(msg, 'alert-danger');
        console.error(msg, error);
    }
  }

  // Helper method to mark all controls in a form group as touched
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          } else {
            arrayControl.markAsTouched();
          }
        });
      } else {
        control.markAsTouched();
      }
    });
  }

  // Error message handling methods
  getErrorMessage(controlName: string): string {
    const control = this.tripForm.get(controlName);
    if (!control || !control.errors || !control.touched) return '';
    
    if (control.hasError('required')) return $localize `This field is required`;
    if (control.hasError('notInFuture')) return $localize `Date must be in the future`;
    if (control.hasError('endBeforeStart')) return $localize `End date must be after start date`;
    if (control.hasError('min')) return $localize `Value must be greater than or equal to 0`;
    
    return $localize `Invalid field`;
  }

  getStageErrorMessage(stageIndex: number, fieldName: string): string {
    const stage = this.stages.at(stageIndex) as FormGroup;
    const control = stage.get(fieldName);
    if (!control || !control.errors || !control.touched) return '';
    
    if (control.hasError('required')) return $localize `This field is required`;
    if (control.hasError('min')) return $localize `Value must be greater than or equal to 0`;
    
    return $localize `Invalid field`;
  }

  // Generate ticker
  private generateTicker(): string {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const letters = Array.from({ length: 4 }, () =>
      String.fromCharCode(65 + Math.floor(Math.random() * 26))
    ).join('');
    return `${yy}${mm}${dd}-${letters}`;
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

  get currencyCode(): string {
    const locale = localStorage.getItem('locale');
    return locale === 'es' ? 'EUR' : 'GBP';
  }

  async isEditable(trip: Trip): Promise<boolean> {
      const timeReason = trip.startDate.getTime() - new Date().getTime() > 10 * 24 * 60 * 60 * 1000;
      if (!timeReason) return false;
  
      try {
        const applications = await this.applicationService.getAllApplicationsByTripId(trip.id);
        const hasAccepted = applications.some(app => 
          app.status.toLowerCase() === 'accepted'
        );
        console.log("hasAccepted: ", hasAccepted);
        return !hasAccepted;
      } catch (error) {
        console.error('Error checking cancelability:', error);
        return false;
      }
    }
}