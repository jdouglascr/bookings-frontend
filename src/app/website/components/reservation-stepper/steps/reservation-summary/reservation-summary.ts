import { Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { StepData } from '../../../../../models/reservation.models';

@Component({
  selector: 'app-reservation-summary',
  imports: [MatIconModule],
  templateUrl: './reservation-summary.html',
  styleUrl: './reservation-summary.scss',
})
export class ReservationSummary {
  stepData = input.required<StepData>();

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

  readonly formatPhoneNumber = computed(() => {
    const phone = this.stepData().contactInfo?.phone;
    if (!phone) return '';

    if (phone.length === 9) {
      return `${phone.slice(0, 1)} ${phone.slice(1, 5)} ${phone.slice(5)}`;
    }

    return phone;
  });
}
