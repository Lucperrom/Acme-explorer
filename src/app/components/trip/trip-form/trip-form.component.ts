import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Trip } from 'src/app/models/trip.model';
import { MessageService } from 'src/app/services/message.service';
import { TripService } from 'src/app/services/trip.service';

@Component({
  selector: 'app-trip-form',
  templateUrl: './trip-form.component.html',
  styleUrls: ['./trip-form.component.css']
})
export class TripFormComponent implements OnInit {

  tripForm: FormGroup;

  constructor(private fb: FormBuilder, private tripService: TripService, private router: Router, private messageService: MessageService) {
    this.tripForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      requirements: this.fb.array([this.fb.control('', Validators.required)]),
      pictures: this.fb.array([])
    });
  }

  ngOnInit(): void {
  }

  get requirements(): FormArray {
    return this.tripForm.get('requirements') as FormArray;
  }

  get pictures(): FormArray {
    return this.tripForm.get('pictures') as FormArray;
  }

  addRequirement() {
    this.requirements.push(this.fb.control('', Validators.required));
  }

  removeRequirement(index: number) {
    if (this.requirements.length > 1) {
      this.requirements.removeAt(index);
    }
  }

  triggerFileInput() {
    const fileInput = document.getElementById('pictures') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();  // Simula un clic en el input de tipo file
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        const reader = new FileReader();
  
        reader.onload = () => {
          // Añadimos la imagen al FormArray para ser utilizada en el carrusel
          this.pictures.push(this.fb.control(reader.result));
  
          // El FormArray mantiene las imágenes seleccionadas y permite manipularlas en el carrusel
        };

        reader.readAsDataURL(file);
      }
      input.value = '';
    }
  }
  
  removePicture(index: number) {
    // Eliminar la imagen del FormArray (carrusel)
    this.pictures.removeAt(index);
    // Eliminar la imagen también del input de archivos, actualizando el FormControl
    const input = document.getElementById('pictures') as HTMLInputElement;
    if (input && input.files) {
      // Crear un nuevo array de archivos sin la imagen eliminada
      const filesArray = Array.from(input.files);
      filesArray.splice(index, 1);
  
      // Reemplazar los archivos actuales por el nuevo array
      const dataTransfer = new DataTransfer();
      filesArray.forEach(file => dataTransfer.items.add(file));
      input.files = dataTransfer.files;
    }
  }
  

  async onSubmit() {
    if (this.tripForm.invalid) {
      this.messageService.notifyMessage('Invalid form', 'alert-danger');
      return;
    }
    try {
      console.log(this.tripForm.value)
      const trip = new Trip(this.tripForm.value);
      console.log('Trip data:', trip);
      const tripId = await this.tripService.createTrip(trip);
      this.messageService.notifyMessage('Trip created successfully', 'alert-success');
      this.router.navigate(['/trips', tripId]);
      console.log('Trip created with ID:', tripId);
      this.tripForm.reset();
    } catch (error) {
      this.messageService.notifyMessage('Error creating trip', 'alert-danger');
      console.error('Error creating trip:', error);
    }
  }

}
