import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'min'
})
export class MinPipe implements PipeTransform {
  transform(array: any[], field: string): number {
    if (!array || array.length === 0) return NaN;
    return Math.min(...array.map(item => item[field]));
  }
}
