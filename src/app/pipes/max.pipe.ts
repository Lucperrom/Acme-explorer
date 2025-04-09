import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'max'
})
export class MaxPipe implements PipeTransform {
  transform(array: any[], field: string): number {
    if (!array || array.length === 0) return NaN;
    return Math.max(...array.map(item => item[field]));
  }
}
