import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PriceFormatterService {
  private readonly locale = 'es-CL';
  private readonly currency = 'CLP';

  private readonly formatter = new Intl.NumberFormat(this.locale, {
    style: 'currency',
    currency: this.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  format(value: number | null | undefined): string {
    if (value == null || isNaN(value)) {
      return '$0';
    }
    return this.formatter.format(value);
  }

  parse(formattedValue: string): number {
    if (!formattedValue) return 0;
    const cleaned = formattedValue.replace(/[$.]/g, '').trim();
    return parseInt(cleaned, 10) || 0;
  }

  formatInput(value: string | number): string {
    const numericValue = typeof value === 'string' ? this.parse(value) : value;
    if (!numericValue) return '';
    return new Intl.NumberFormat(this.locale).format(numericValue);
  }
}
