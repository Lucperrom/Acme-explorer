import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fieldTranslation'
})
export class FieldTranslationPipe implements PipeTransform {

  private translations: Record<string, Record<string, string>> = {
    en: {
      title: 'Title',
      description: 'Description',
      startDate: 'Start Date',
      endDate: 'End Date',
      price: 'Price',
    },
    es: {
      title: 'Título',
      description: 'Descripción',
      startDate: 'Fecha de inicio',
      endDate: 'Fecha de fin',
      price: 'Precio',
    }
  };

  transform(field: string): string {
    const locale = localStorage.getItem('locale') || 'en';
    return this.translations[locale]?.[field] || field;
  }
}
