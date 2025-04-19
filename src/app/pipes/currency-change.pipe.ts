import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyChange'
})
export class CurrencyChangePipe implements PipeTransform {

  private readonly EUR_TO_GBP_RATE = 1.2; // Puedes ajustar esta tasa según el mercado

  transform(value: number): string {
    const locale = localStorage.getItem('locale') || 'en';

    if (typeof value !== 'number') {
      value = parseFloat(value);
    }

    if (locale === 'en') {
      const converted = value / this.EUR_TO_GBP_RATE;
      return `£${converted.toFixed(2)}`;
    }

    return `${value.toFixed(2)} €`;
  }
}
