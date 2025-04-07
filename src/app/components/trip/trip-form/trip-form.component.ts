import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Actor } from 'src/app/models/actor.model';
import { AuthService } from 'src/app/services/auth.service';
import { MessageService } from 'src/app/services/message.service';
import { TripService } from 'src/app/services/trip.service';

@Component({
  selector: 'app-trip-form',
  templateUrl: './trip-form.component.html',
  styleUrls: ['./trip-form.component.css']
})
export class TripFormComponent implements OnInit {
  tripForm!: FormGroup;
  actor: Actor | null = null;

constructor(
    private tripService: TripService,
    private router: Router,
    private messageService: MessageService,
    private authService: AuthService) {}

  ngOnInit(): void {
    this.tripForm = new FormGroup({
      title: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      price: new FormControl({ value: 0, disabled: true }),
      startDate: new FormControl('', [Validators.required, this.futureDateValidator()]),
      endDate: new FormControl('', [Validators.required, this.endDateAfterStartDateValidator()]),
      stages: new FormArray([], [Validators.required, this.nonEmptyArrayValidator()]),
      requirements: new FormArray([], [Validators.required, this.nonEmptyArrayValidator()]),
      pictures: new FormArray([])
    });

    this.tripForm.get('stages')?.valueChanges.subscribe(() => this.updatePrice());
    this.actor = this.authService.getCurrentActor();
    if(!this.actor){
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
      const tripData = { ...this.tripForm.getRawValue(), managerId: this.actor?.email, managerName: `${this.actor?.name|| ''} ${this.actor?.surname || ''}`, createdAt: new Date() };
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