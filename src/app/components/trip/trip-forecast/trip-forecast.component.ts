import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TripService } from 'src/app/services/trip.service';
import { MeteoService } from 'src/app/services/meteo.service';

@Component({
  selector: 'app-trip-forecast',
  templateUrl: './trip-forecast.component.html',
  styleUrls: ['./trip-forecast.component.css']
})
export class TripForecastComponent implements OnInit {
  forecastData: any[] | null = null;
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private tripService: TripService,
    private meteoService: MeteoService
  ) {}

  async ngOnInit(): Promise<void> {
    const tripId = this.route.snapshot.paramMap.get('id');
    if (!tripId) {
      this.errorMessage = 'Invalid trip ID.';
      return;
    }

    try {
      const trip = await this.tripService.getTripById(tripId);
      if (trip?.location?.latitude && trip?.location?.longitude) {
        console.log('Trip Location:', trip.location);
        console.log('Fetching forecast data for trip:', tripId);
        const response = await this.meteoService.getForecast(
          trip.location.latitude,
          trip.location.longitude
        );
        console.log('Weather Data:', response);

        // Correctly map the forecast data
        this.forecastData = response.data.daily.time.map((time: string, index: number) => ({
          date: time,
          maxTemp: response.data.daily.temperature_2m_max[index],
          minTemp: response.data.daily.temperature_2m_min[index],
          rainSum: response.data.daily.rain_sum[index],
          precipProb: response.data.daily.precipitation_probability_max[index]
        }));
      } else {
        this.errorMessage = 'No forecast data available for this trip.';
      }
    } catch (error) {
      console.error('Error fetching forecast data:', error);
      this.errorMessage = 'An error occurred while fetching the forecast data.';
    }
  }
}