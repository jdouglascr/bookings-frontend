import { Component, computed, input, output, signal, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {
  AppointmentAvailability,
  TimeSlot,
  CalendarDay,
} from '../../../../../models/reservation.models';

@Component({
  selector: 'app-datetime-selection',
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './datetime-selection.html',
  styleUrl: './datetime-selection.scss',
})
export class DatetimeSelection implements OnInit {
  selectedDate = input<string | null>(null);
  selectedTimeSlot = input<TimeSlot | null>(null);
  selectedAppointmentId = input<number>(0);

  datetimeSelected = output<{ date: string; timeSlot: TimeSlot }>();
  dateChanged = output<{ date: string }>();

  // Signal corregido con los días correctos bloqueados
  appointmentAvailability = signal<AppointmentAvailability>({
    appointmentId: 1,
    currentWeekHeader: '23 - 29, Septiembre 2024',
    navigation: {
      canGoPrevious: false,
      canGoNext: true,
    },
    weekSchedule: [
      {
        dayOfWeek: 'Domingo',
        shortName: 'Do',
        dayNumber: 0, // Domingo = 0
        isAvailable: false, // Domingo bloqueado
        timeSlots: [],
      },
      {
        dayOfWeek: 'Lunes',
        shortName: 'Lu',
        dayNumber: 1, // Lunes = 1
        isAvailable: true,
        timeSlots: [
          '09:00',
          '10:00',
          '11:00',
          '12:00',
          '13:00',
          '14:00',
          '15:00',
          '16:00',
          '17:00',
          '18:00',
        ],
      },
      {
        dayOfWeek: 'Martes',
        shortName: 'Ma',
        dayNumber: 2, // Martes = 2
        isAvailable: true,
        timeSlots: [
          '09:00',
          '10:00',
          '11:00',
          '12:00',
          '13:00',
          '14:00',
          '15:00',
          '16:00',
          '17:00',
          '18:00',
        ],
      },
      {
        dayOfWeek: 'Miércoles',
        shortName: 'Mi',
        dayNumber: 3, // Miércoles = 3
        isAvailable: true,
        timeSlots: [
          '09:00',
          '10:00',
          '11:00',
          '12:00',
          '13:00',
          '14:00',
          '15:00',
          '16:00',
          '17:00',
          '18:00',
        ],
      },
      {
        dayOfWeek: 'Jueves',
        shortName: 'Ju',
        dayNumber: 4, // Jueves = 4
        isAvailable: true,
        timeSlots: [
          '09:00',
          '10:00',
          '11:00',
          '12:00',
          '13:00',
          '14:00',
          '15:00',
          '16:00',
          '17:00',
          '18:00',
        ],
      },
      {
        dayOfWeek: 'Viernes',
        shortName: 'Vi',
        dayNumber: 5, // Viernes = 5
        isAvailable: true,
        timeSlots: [
          '09:00',
          '10:00',
          '11:00',
          '12:00',
          '13:00',
          '14:00',
          '15:00',
          '16:00',
          '17:00',
          '18:00',
        ],
      },
      {
        dayOfWeek: 'Sábado',
        shortName: 'Sa',
        dayNumber: 6, // Sábado = 6
        isAvailable: false, // Sábado bloqueado
        timeSlots: [],
      },
    ],
  });

  currentDate = signal(this.getCurrentWeekStart());
  selectedDateSignal = signal<string | null>(null);
  selectedTimeSlotSignal = signal<TimeSlot | null>(null);

  // Ordenar los días de lunes a domingo
  readonly weekDays = computed(() => {
    const schedule = this.appointmentAvailability().weekSchedule;
    // Reordenar: empezar desde lunes (1) hasta domingo (0)
    const orderedDays = [1, 2, 3, 4, 5, 6, 0]; // Lu, Ma, Mi, Ju, Vi, Sa, Do
    return orderedDays.map((dayNum) => {
      const day = schedule.find((d) => d.dayNumber === dayNum);
      return day ? day.shortName : '';
    });
  });

  readonly calendarHeader = computed(() => {
    return this.appointmentAvailability().currentWeekHeader;
  });

  readonly selectedDateString = computed(() => {
    const selected = this.selectedDateSignal();
    const timeSlot = this.selectedTimeSlotSignal();
    if (!selected) return '';

    const date = new Date(selected + 'T00:00:00.000Z');
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

    const dateString = `${day} ${month} ${year}`;
    return timeSlot ? `${dateString} a las ${timeSlot.time}` : dateString;
  });

  // Modificado para mostrar lunes a domingo
  readonly calendarDays = computed(() => {
    const startOfWeek = this.currentDate();
    const selectedDate = this.selectedDateSignal();
    const availability = this.appointmentAvailability();

    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Generar 7 días empezando desde lunes
    for (let i = 0; i < 7; i++) {
      const currentDatePointer = new Date(startOfWeek);
      currentDatePointer.setDate(startOfWeek.getDate() + i);

      // IMPORTANTE: Usar getDay() para consistencia con availableTimeSlots
      const dayOfWeek = currentDatePointer.getDay();
      const weekSchedule = availability.weekSchedule.find((ws) => ws.dayNumber === dayOfWeek);
      const dateString = this.formatDateToISO(currentDatePointer);

      days.push({
        date: dateString,
        dayOfWeek: dayOfWeek,
        dayNumber: currentDatePointer.getDate(),
        isCurrentMonth: true,
        isToday: this.isSameDay(currentDatePointer, today),
        hasAvailability: weekSchedule?.isAvailable || false,
        isSelected: selectedDate ? selectedDate === dateString : false,
        isUnavailable: !(weekSchedule?.isAvailable || false),
      });
    }

    return days;
  });

  readonly availableTimeSlots = computed(() => {
    const selectedDate = this.selectedDateSignal();
    if (!selectedDate) return [];

    // IMPORTANTE: Usar UTC para evitar problemas de zona horaria
    const date = new Date(selectedDate + 'T00:00:00.000Z');
    const dayOfWeek = date.getUTCDay();
    const availability = this.appointmentAvailability();
    const weekSchedule = availability.weekSchedule.find((ws) => ws.dayNumber === dayOfWeek);

    if (!weekSchedule?.isAvailable) return [];

    return weekSchedule.timeSlots.map((timeSlot) => ({
      id: `${this.selectedAppointmentId()}-${selectedDate}-${timeSlot}`,
      appointmentId: this.selectedAppointmentId(),
      time: timeSlot,
      available: true,
      date: selectedDate,
    }));
  });

  readonly canGoToPreviousWeek = computed(() => {
    return this.appointmentAvailability().navigation.canGoPrevious;
  });

  readonly canGoToNextWeek = computed(() => {
    return this.appointmentAvailability().navigation.canGoNext;
  });

  ngOnInit() {
    this.selectedDateSignal.set(this.selectedDate());
    this.selectedTimeSlotSignal.set(this.selectedTimeSlot());

    if (this.selectedDate()) {
      this.navigateToDateWeek(this.selectedDate()!);
    }
  }

  // Modificado para calcular el lunes como inicio de semana
  private getCurrentWeekStart(): Date {
    const today = new Date();
    const dayOfWeek = today.getDay();

    // Calcular cuántos días hay que restar para llegar al lunes
    // Si es domingo (0), restar 6 días; si es lunes (1), restar 0; etc.
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);
    return monday;
  }

  private navigateToDateWeek(dateString: string): void {
    const targetDate = new Date(dateString + 'T00:00:00.000Z');
    const targetDayOfWeek = targetDate.getUTCDay();

    // Calcular el lunes de la semana de la fecha objetivo
    const mondayOffset = targetDayOfWeek === 0 ? -6 : 1 - targetDayOfWeek;
    const mondayOfTargetWeek = new Date(targetDate);
    mondayOfTargetWeek.setUTCDate(targetDate.getUTCDate() + mondayOffset);
    mondayOfTargetWeek.setUTCHours(0, 0, 0, 0);

    const localMondayOfTargetWeek = new Date(
      mondayOfTargetWeek.getUTCFullYear(),
      mondayOfTargetWeek.getUTCMonth(),
      mondayOfTargetWeek.getUTCDate(),
      0,
      0,
      0,
      0,
    );

    this.currentDate.set(localMondayOfTargetWeek);
  }

  private formatDateToISO(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  }

  nextWeek() {
    if (!this.canGoToNextWeek()) return;

    const newDate = new Date(this.currentDate());
    newDate.setDate(newDate.getDate() + 7);
    this.currentDate.set(newDate);

    // Aquí harías la llamada al backend para obtener los datos de la nueva semana
    // this.loadWeekData(newDate);
  }

  previousWeek() {
    if (!this.canGoToPreviousWeek()) return;

    const newDate = new Date(this.currentDate());
    newDate.setDate(newDate.getDate() - 7);
    this.currentDate.set(newDate);

    // Aquí harías la llamada al backend para obtener los datos de la nueva semana
    // this.loadWeekData(newDate);
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
      this.datetimeSelected.emit({
        date: selectedDate,
        timeSlot,
      });
    }
  }

  clearSelection() {
    this.selectedDateSignal.set(null);
    this.selectedTimeSlotSignal.set(null);
  }

  clearTimeSlot() {
    this.selectedTimeSlotSignal.set(null);
  }
}
