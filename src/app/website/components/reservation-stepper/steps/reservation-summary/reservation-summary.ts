import { Component, computed, input, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { StepData } from '../../../../../models/frontend.models';
import { PriceFormatterService } from '../../../../../core/services/prices-formatter.service';

@Component({
  selector: 'app-reservation-summary',
  imports: [MatIconModule],
  templateUrl: './reservation-summary.html',
  styleUrl: './reservation-summary.scss',
})
export class ReservationSummary {
  stepData = input.required<StepData>();
  readonly priceFormatter = inject(PriceFormatterService);

  readonly formatSelectedDate = computed(() => {
    const selectedDate = this.stepData().selectedDate;
    if (!selectedDate) return '';

    const date = new Date(selectedDate + 'T00:00:00.000Z');
    const day = date.getUTCDate().toString().padStart(2, '0');
    const monthNames = [
      'enero',
      'febrero',
      'marzo',
      'abril',
      'mayo',
      'junio',
      'julio',
      'agosto',
      'septiembre',
      'octubre',
      'noviembre',
      'diciembre',
    ];
    const month = monthNames[date.getUTCMonth()];
    const year = date.getUTCFullYear();

    const dayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const dayName = dayNames[date.getUTCDay()];

    return `${dayName}, ${day} de ${month} de ${year}`;
  });
}
