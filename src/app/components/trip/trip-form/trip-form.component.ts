import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Actor } from 'src/app/models/actor.model';
import { AuthService } from 'src/app/services/auth.service';
import { MessageService } from 'src/app/services/message.service';
import { TripService } from 'src/app/services/trip.service';
import { Trip } from 'src/app/models/trip.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-trip-form',
  templateUrl: './trip-form.component.html',
  styleUrls: ['./trip-form.component.css']
})

export class TripFormComponent implements OnInit {
  protected isEditMode: boolean = false;
  protected trip: Trip;
  protected tripId: string | null = null;
  tripForm!: FormGroup;
  actor: Actor | null = null;

  constructor(
    private tripService: TripService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private authService: AuthService) {
    this.trip = new Trip();
  }

  async ngOnInit(): Promise<void> {
    this.isEditMode = this.route.snapshot.routeConfig?.path?.includes('edit') ?? false;
    this.tripForm = new FormGroup({
      title: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      price: new FormControl({ value: 0, disabled: true }),
      startDate: new FormControl('', [Validators.required, this.futureDateValidator()]),
      endDate: new FormControl('', [Validators.required, this.endDateAfterStartDateValidator()]),
      stages: new FormArray([], [Validators.required, this.nonEmptyArrayValidator()]),
      requirements: new FormArray([], [Validators.required, this.nonEmptyArrayValidator()]),
      pictures: new FormArray([]),
      cancelledReason: new FormControl(''),
      deleted: new FormControl(false)  // Añadimos el campo deleted al formulario
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
        this.messageService.notifyMessage('Fechas inválidas en el viaje', 'alert-danger');
        return;
      }
      
      this.trip.startDate = startDate;
      this.trip.endDate = endDate;

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

      // Setear stages
      this.stages.clear();
      if (this.trip.stages && Array.isArray(this.trip.stages)) {
        this.trip.stages.forEach(stage => {
          this.stages.push(new FormGroup({
            title: new FormControl(stage.title, Validators.required),
            description: new FormControl(stage.description, Validators.required),
            price: new FormControl(stage.price, [Validators.required, Validators.min(0)])
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

  get stages(): FormArray {
    return this.tripForm.get('stages') as FormArray;
  }

  get requirements(): FormArray {
    return this.tripForm.get('requirements') as FormArray;
  }

  get pictures(): FormArray {
    return this.tripForm.get('pictures') as FormArray;
  }

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

  async deleteTrip(): Promise<void> {
    if (!this.tripId) {
      this.messageService.notifyMessage('No se puede borrar un viaje que no existe', 'alert-danger');
      return;
    }

    if (confirm('¿Está seguro de que desea eliminar este viaje?')) {
      try {
        // Establecer deleted a true
        await this.tripService.updateTrip(this.tripId, {
          deleted: true
        });
        
        
        this.messageService.notifyMessage('Viaje eliminado correctamente', 'alert-success');
        // Redireccionar a la lista de viajes
        this.router.navigate(['/trips']);
      } catch (error) {
        this.messageService.notifyMessage('Error al eliminar el viaje', 'alert-danger');
        console.error('Error al eliminar el viaje:', error);
      }
    }
  }

  async onSubmit(): Promise<void> {
    console.log('Dates', this.tripForm.get('startDate')?.value, this.tripForm.get('endDate')?.value);
    console.log('Form Valid?', this.tripForm.valid);
    console.log('Form Errors:', this.tripForm.errors);
  
    if (this.tripForm.invalid) {
      this.tripForm.markAllAsTouched();
      this.messageService.notifyMessage('Invalid form, please fix the errors', 'alert-danger');
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
        this.messageService.notifyMessage('Error en el formato de las fechas', 'alert-danger');
        console.error('Error al procesar fechas:', error, formData.startDate, formData.endDate);
        return;
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
        this.messageService.notifyMessage('Viaje actualizado correctamente', 'alert-success');
      } else {
        tripId = await this.tripService.createTrip({
          ...tripData, 
          createdAt: new Date().toISOString(),
          cancelledReason: "",
          deleted: false // Al crear un nuevo viaje, deleted siempre es false
        });
        this.messageService.notifyMessage('Viaje creado correctamente', 'alert-success');
      }

      this.router.navigate(['/trips', tripId]);
      this.tripForm.reset();
    } catch (error) {
      const action = this.tripId ? 'updating' : 'creating';
      this.messageService.notifyMessage(`Error ${action} trip`, 'alert-danger');
      console.error(`Error ${action} trip:`, error);
    }
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
}