import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class MeteoService {
  private readonly meteoApiUrl = 'https://api.open-meteo.com/v1/forecast';

  constructor(private http: HttpClient) {}

  async getForecast(latitude: number, longitude: number): Promise<any> {
    const params = new HttpParams()
      .set('latitude', latitude.toString())
      .set('longitude', longitude.toString())
      .set('daily', 'temperature_2m_max,temperature_2m_min,rain_sum,precipitation_probability_max')
      .set('timezone', 'auto');
    let url = this.meteoApiUrl + '?' + params.toString();
    console.log('Meteo API URL:', url);
    return await axios.get(url)
  }
}
