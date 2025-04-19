import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusTranslate',
  pure: false
})
export class StatusTranslatePipe implements PipeTransform {
  transform(value: string): string {
    const currentLocale = localStorage.getItem('locale') || 'en'; // Corrige el nombre de la clave

    const translations: { [key: string]: { [key: string]: string } } = {
      en: {
        pending: 'PENDING',
        accepted: 'ACCEPTED',
        rejected: 'REJECTED',
        due: 'DUE',
        unknown: 'UNKNOWN'
      },
      es: {
        pending: 'PENDIENTE',
        accepted: 'ACEPTADO',
        rejected: 'RECHAZADO',
        due: 'APTO',
        unknown: 'DESCONOCIDO'
      }
    };

    return translations[currentLocale]?.[value] || translations[currentLocale]?.['unknown'] || 'UNKNOWN';
  }
}
