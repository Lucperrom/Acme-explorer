import { Component, OnInit, Type } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'src/app/services/message.service';
import { SponsorshipService } from 'src/app/services/sponsorship.service';
import { AuthService } from 'src/app/services/auth.service';
import { Actor } from 'src/app/models/actor.model';

@Component({
  selector: 'app-sponsorship-edit',
  templateUrl: './sponsorship-edit.component.html',
  styleUrls: ['./sponsorship-edit.component.css']
})
export class SponsorshipEditComponent implements OnInit {
  sponsorshipForm!: FormGroup;
  sponsorshipId: string | null = null;
  isEditMode: boolean = false;
  errorMessage: string = '';
  tripTickers: string = '';
  sponsorId: string = '';
  payed: boolean = false;
  rate: number = 0;
  message: string = '';
  protected currentActor: Actor | null = null;
  isDarkMode = false;

  constructor(
    private sponsorshipService: SponsorshipService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    this.isDarkMode = localStorage.getItem('darkMode') === 'true';
    this.currentActor = this.authService.getCurrentActor();
    this.isEditMode = this.route.snapshot.routeConfig?.path?.includes('edit') ?? false;
    
    // Solo configurar el 'tripTickers' si no estamos en modo edición
    if (!this.isEditMode) {
      this.tripTickers = this.route.snapshot.paramMap.get('tripTicker') || '';
      this.sponsorId = this.currentActor?.email || '';
      console.log('TripTickers:', this.tripTickers); // Verificar si se obtiene correctamente
    }

    // Crear formulario reactivo
    this.sponsorshipForm = new FormGroup({
      url: new FormControl('', Validators.required),
      link: new FormControl('', Validators.required),
      rate: new FormControl(0, [Validators.required, Validators.min(0)]),
      payed: new FormControl(false),
      tripId: new FormControl('', Validators.required),
      sponsorId: new FormControl('', Validators.required)
    });

    // Si estamos en modo edición, cargamos la sponsorship
    this.sponsorshipId = this.route.snapshot.paramMap.get('id');
    if (this.sponsorshipId) {
      const sponsorship = await this.sponsorshipService.getSponsorshipById(this.sponsorshipId);
      console.log('Sponsorship loaded', sponsorship);
      this.tripTickers = sponsorship.tripId;
      this.sponsorId = sponsorship.sponsorId;
      this.payed = sponsorship.payed;
      this.rate = sponsorship.rate;

      if (sponsorship.sponsorId !== this.currentActor?.email) {
        this.router.navigate(['/denied-access']);
      }
      console.log(sponsorship.sponsorId, this.currentActor?.email);

      if (sponsorship.payed) {
        this.router.navigate(['/denied-access']);
      }

      this.sponsorshipForm.patchValue({
        url: sponsorship.url,
        link: sponsorship.link,
        rate: sponsorship.rate,
        payed: sponsorship.payed,
        tripId: sponsorship.tripId,
        sponsorId: sponsorship.sponsorId
      });
    } else {
      // Si es un "create", setear valores predeterminados
      const currentUserEmail = this.authService.getCurrentActor()?.email || '';
      console.log('Current User Email:', currentUserEmail); // Verificar que se obtiene el email correctamente

      this.sponsorshipForm.patchValue({
        rate: this.rate, // Default value for rate
        payed: this.payed,
        tripId: this.tripTickers, // Set the tripId passed in the route
        sponsorId: this.sponsorId // Set sponsorId to the current user email
      });
    }
  }

  // Manejo de selección de archivo
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      // Actualizar el formulario con la URL del archivo cargado (base64)
      this.sponsorshipForm.patchValue({
        url: reader.result // Almacena la representación base64 del archivo
      });
    };

    reader.readAsDataURL(file); // Convierte el archivo a base64
  }

  // Abre el input de archivos cuando el usuario hace clic en el botón
  triggerFileInput(): void {
    const fileInput = document.getElementById('url') as HTMLInputElement;
    this.message = '';
    if (fileInput) fileInput.click();
  }

  // Elimina el archivo y actualiza el campo de previsualización
  removeFile(): void {
    this.sponsorshipForm.patchValue({ url: '' });
  }

  // Enviar formulario
  async onSubmit(): Promise<void> {
    if (this.sponsorshipForm.invalid) {
      this.sponsorshipForm.markAllAsTouched();
      let msg = $localize `Invalid form`;
      this.messageService.notifyMessage(msg, 'alert-danger');
      return;
    }

    const formData = {
      ...this.sponsorshipForm.getRawValue(),
      tripId: this.tripTickers, 
      payed: this.payed, // Esto podría ser algo que se pueda editar, dependiendo de tus necesidades.
      rate: this.rate, // O el valor que se deba asignar
      sponsorId: this.sponsorId // Esto podría ser algo que se pueda editar, dependiendo de tus necesidades.
    };

    try {
      if (this.sponsorshipId) {
        if(this.currentActor?.role.toLowerCase() === 'administrator') {
          formData.rate = this.sponsorshipForm.get('rate')?.value
        }
        await this.sponsorshipService.updateSponsorship(this.sponsorshipId, formData);
        let msg = $localize `Sponsorship updated successfully`;
        this.messageService.notifyMessage(msg, 'alert-success');
      } else {
        await this.sponsorshipService.createSponsorship(formData);
        let msg = $localize `Sponsorship created successfully`;
        this.messageService.notifyMessage(msg, 'alert-success');
      }
      this.router.navigate(['/sponsorships']);
    } catch (error: unknown) {
      console.error('Error al guardar sponsorship:', error);
      console.log(typeof(error as Error).message);
      if(error instanceof Error && error.message.includes('url')){
        let msg = $localize `The file is too large. Please select a smaller file.`;
        this.message=msg;
      }
      let msg = $localize `Error saving sponsorship`;
      this.messageService.notifyMessage(msg, 'alert-danger');
    }
  }
}