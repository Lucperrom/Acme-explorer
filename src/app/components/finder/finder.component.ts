  import { Component, OnInit } from '@angular/core';
  import { FormBuilder, FormGroup, Validators } from '@angular/forms';
  import { FinderService } from 'src/app/services/finder.service';
  import { AuthService } from 'src/app/services/auth.service';
  import { Trip } from 'src/app/models/trip.model';
  import { Finder } from 'src/app/models/finder.model';
  import { Actor } from 'src/app/models/actor.model';
  import { Router } from '@angular/router';
import { MessageService } from 'src/app/services/message.service';

  @Component({
    selector: 'app-finder',
    templateUrl: './finder.component.html',
    styleUrls: ['./finder.component.css']
  })
  export class FinderComponent implements OnInit {
    protected currentActor: Actor | null = null;
    finderForm!: FormGroup;
    trips: Trip[] = [];
    submitted = false;
    isDarkMode = false; 
    actorId = "";
    protected activeRole: string = 'anonymous';
    tripEditableMap: Map<string, boolean> = new Map();


    constructor(
      private fb: FormBuilder,
      private finderService: FinderService,
      private authService: AuthService,
      private router: Router,
      private messageService: MessageService
    ) {}

    ngOnInit(): void {
      this.finderForm = this.fb.group({
        keyWord: [''],
        minimumPrice: [0],
        maximumPrice: [0],
        startingDate: [''],
        endDate: [''],
        cacheTTL: [1, [Validators.required, Validators.min(1), Validators.max(24)]],
        maxResults: [10, [Validators.required, Validators.min(1), Validators.max(50)]]
      });
      this.isDarkMode = localStorage.getItem('darkMode') === 'true';
      const actorData = localStorage.getItem('currentActor');
      this.currentActor = actorData ? JSON.parse(actorData) as Actor : null;
      this.activeRole = this.currentActor?.role || '';

      this.actorId = this.authService.getCurrentActor()?.email || '';
      this.loadPreviousFinder(); 
    }

    isVisible(trip: Trip) {
      if(this.activeRole === 'MANAGER'){
        return !trip.deleted;
      }else{
        return !trip.deleted && (trip.cancelledReason == null || trip.cancelledReason === "") && !trip.deleted && trip.startDate.getTime() - new Date().getTime() > 0;
      }

    }

    isTripEditable(tripId: string): boolean {
      return this.tripEditableMap.get(tripId) || false;
    }

    
    isHighlighted(trip: Trip): boolean {
      return trip.startDate.getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000;
    }

    async loadPreviousFinder() {
      const finder = await this.finderService.getFinderByActorId(this.actorId); 
      if (finder) {
        this.finderForm.patchValue({
          keyWord: finder.keyWord,
          minimumPrice: this.currencyCode === 'GBP' ? finder.minimumPrice / 1.2 : finder.minimumPrice,
          maximumPrice: this.currencyCode === 'GBP' ? finder.maximumPrice / 1.2 : finder.maximumPrice,
          startingDate: finder.startingDate ? this.toDateInputValue(finder.startingDate) : '',
          endDate: finder.endDate ? this.toDateInputValue(finder.endDate) : '',
          cacheTTL: finder.cacheTTL,
          maxResults: finder.maxResults
        });
    
        const cacheString = localStorage.getItem('finderCache_' + this.actorId);
        if (cacheString) {
          const cache = JSON.parse(cacheString);
          const savedAt = new Date(cache.savedAt);
          const now = new Date();
          const ttlInMs = cache.ttl * 60 * 60 * 1000;
    
          if (now.getTime() - savedAt.getTime() < ttlInMs) {
            console.log("Usando viajes de la caché");
          
            const parsedTrips: Trip[] = cache.trips.map((trip: any) => ({
              ...trip,
              startDate: new Date(trip.startDate),
              endDate: new Date(trip.endDate)
            }));
          
            this.trips = parsedTrips;
            return;
          }
          
        }
      }
    }

    get currencyCode(): string {
      const locale = localStorage.getItem('locale');
      return locale === 'es' ? 'EUR' : 'GBP';
    }
    
    toDateInputValue(date: Date): string {
      return new Date(date).toISOString().split('T')[0];
    }

    goToTrip(tripId: string) {
      console.log("TripID: " +tripId )
      this.router.navigate(['/trips', tripId]);
    }

    async onSearch() {

      if (this.finderForm.invalid) {
        let msg = $localize`Form is invalid`;
        this.messageService.notifyMessage(msg, 'alert-danger');
        return;
      } 
      else{
        this.submitted = true;
        if (this.finderForm.invalid) return;
  
        const values = this.finderForm.value;
  
        const finder = new Finder({
          keyWord: values.keyWord,
          minimumPrice: this.currencyCode === 'GBP' ? values.minimumPrice * 1.2 : values.minimumPrice,
          maximumPrice: this.currencyCode === 'GBP' ? values.maximumPrice * 1.2 : values.maximumPrice,
          startingDate: isValidDate(values.startingDate) ? new Date(values.startingDate) : null,
          endDate: isValidDate(values.endDate) ? new Date(values.endDate) : null,
          cacheTTL: values.cacheTTL,
          maxResults: values.maxResults,
          actorId:  this.actorId
        });
  
  
        await this.finderService.saveFinder(finder); 
        this.trips = await this.finderService.searchTrips(finder); 
  
        const tripsForCache = this.trips.map(trip => {
          return {
            id: trip.id,
            title: trip.title,
            ticker: trip.ticker,
            description: trip.description,
            price: trip.price,
            requirements: trip.requirements,
            pictures: trip.pictures,
            cancelledReason: trip.cancelledReason,
            deleted: trip.deleted,
            managerId: trip.managerId,
            managerName: trip.managerName,
            startDate: trip.startDate.toISOString(), 
            endDate: trip.endDate.toISOString(),
            createdAt: trip.createdAt.toISOString(), 
            location: trip.location ? trip.location.toPlainObject() : null, 
            stages: trip.stages.map(stage => stage.toPlainObject()) 
          };
        });
  
        //Guardado en cache
        const cacheData = {
          trips: tripsForCache,
          savedAt: new Date().toISOString(),
          ttl: finder.cacheTTL
        };
        
        localStorage.setItem('finderCache_' + this.actorId, JSON.stringify(cacheData));
      }
    }

    async resetFinder() {
      this.finderForm.reset({
        keyWord: '',
        minimumPrice: 0,
        maximumPrice: 0,
        startingDate: '',
        endDate: '',
        cacheTTL: 1,
        maxResults: 10
      });
    
      this.trips = [];
    
      localStorage.removeItem('finderCache_' + this.actorId);
    
      const emptyFinder = new Finder({
        keyWord: '',
        minimumPrice: 0,
        maximumPrice: 0,
        startingDate: null,
        endDate: null,
        cacheTTL: 1,
        maxResults: 10,
        actorId: this.actorId
      });
    
      await this.finderService.saveFinder(emptyFinder);
    
      let msg = $localize`Finder reset successfully`;
      this.messageService.notifyMessage(msg, 'alert-info');
    }
    
}

function isValidDate(date: any): boolean {
  if (!date) return false;
  const parsed = new Date(date);
  return parsed instanceof Date && !isNaN(parsed.getTime());
}




