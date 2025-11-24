import { Component, computed, input, output, signal, OnInit, inject, effect } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TimeSlot, CalendarDay } from '../../../../../models/frontend.models';
import { AvailabilityService } from '../../../../../core/services/availability.service';

@Component({
  selector: 'app-datetime-selection',
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './datetime-selection.html',
  styleUrl: './datetime-selection.scss',
})
export class DatetimeSelection implements OnInit {
  private readonly availabilityService = inject(AvailabilityService);

  selectedDate = input<string | null>(null);
  selectedTimeSlot = input<TimeSlot | null>(null);
  selectedAppointmentId = input<number>(0);

  datetimeSelected = output<{ date: string; timeSlot: TimeSlot }>();
  dateChanged = output<{ date: string }>();

  currentWeekStart = signal(this.getMonday(new Date()));
  selectedDateSignal = signal<string | null>(null);
  selectedTimeSlotSignal = signal<TimeSlot | null>(null);

  // Datos directos del servicio
  readonly weekDays = computed(() => {
    const availability = this.availabilityService.weekAvailability();
    return (
      availability?.weekSchedule.map((day) => day.shortName) || [
        'Lu',
        'Ma',
        'Mi',
        'Ju',
        'Vi',
        'Sa',
        'Do',
      ]
    );
  });

  readonly calendarHeader = computed(
    () => this.availabilityService.weekAvailability()?.weekHeader || '',
  );

  readonly calendarDays = computed(() => {
    const availability = this.availabilityService.weekAvailability();
    if (!availability) return [];

    const selectedDate = this.selectedDateSignal();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return availability.weekSchedule.map((daySchedule) => {
      const date = new Date(daySchedule.date + 'T00:00:00Z');

      return {
        date: daySchedule.date,
        dayOfWeek: daySchedule.dayNumber,
        dayNumber: date.getUTCDate(),
        isCurrentMonth: true,
        isToday: this.isSameDay(date, today),
        hasAvailability: daySchedule.isAvailable,
        isSelected: selectedDate === daySchedule.date,
        isUnavailable: !daySchedule.isAvailable,
      } as CalendarDay;
    });
  });

  readonly availableTimeSlots = computed(() => {
    const selectedDate = this.selectedDateSignal();
    if (!selectedDate) return [];

    const availability = this.availabilityService.weekAvailability();
    const daySchedule = availability?.weekSchedule.find((day) => day.date === selectedDate);

    if (!daySchedule?.isAvailable) return [];

    return daySchedule.timeSlots.map((time) => ({
      id: `${this.selectedAppointmentId()}-${selectedDate}-${time}`,
      appointmentId: this.selectedAppointmentId(),
      time,
      available: true,
      date: selectedDate,
    }));
  });

  readonly selectedDateString = computed(() => {
    const selected = this.selectedDateSignal();
    if (!selected) return '';

    const date = new Date(selected + 'T00:00:00Z');
    const timeSlot = this.selectedTimeSlotSignal();

    const formatted = date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });

    return timeSlot ? `${formatted} a las ${timeSlot.time}` : formatted;
  });

  readonly canGoToPreviousWeek = computed(
    () => this.availabilityService.weekAvailability()?.navigation.canGoPrevious || false,
  );

  readonly canGoToNextWeek = computed(
    () => this.availabilityService.weekAvailability()?.navigation.canGoNext ?? true,
  );

  constructor() {
    // Auto-cargar disponibilidad cuando cambia appointmentId o semana
    effect(() => {
      const appointmentId = this.selectedAppointmentId();
      const weekStart = this.currentWeekStart();

      if (appointmentId > 0) {
        const startDate = this.formatDateISO(weekStart);
        this.availabilityService.getWeekAvailability(appointmentId, startDate).subscribe();
      }
    });
  }

  ngOnInit() {
    this.selectedDateSignal.set(this.selectedDate());
    this.selectedTimeSlotSignal.set(this.selectedTimeSlot());
  }

  nextWeek() {
    if (!this.canGoToNextWeek()) return;
    this.currentWeekStart.update((date) => this.addDays(date, 7));
  }

  previousWeek() {
    if (!this.canGoToPreviousWeek()) return;
    this.currentWeekStart.update((date) => this.addDays(date, -7));
  }

  selectDate(day: CalendarDay) {
    if (day.isUnavailable || !day.hasAvailability) return;

    this.selectedDateSignal.set(day.date);
    this.selectedTimeSlotSignal.set(null);
    this.dateChanged.emit({ date: day.date });
  }

  selectTimeSlot(timeSlot: TimeSlot) {
    if (!timeSlot.available) return;

    this.selectedTimeSlotSignal.set(timeSlot);
    const selectedDate = this.selectedDateSignal();

    if (selectedDate) {
      this.datetimeSelected.emit({ date: selectedDate, timeSlot });
    }
  }

  clearSelection() {
    this.selectedDateSignal.set(null);
    this.selectedTimeSlotSignal.set(null);
  }

  clearTimeSlot() {
    this.selectedTimeSlotSignal.set(null);
  }

  // Utilidades simplificadas
  private getMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  private formatDateISO(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.toDateString() === date2.toDateString();
  }
}
