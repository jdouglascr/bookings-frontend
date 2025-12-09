import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog } from '@angular/material/dialog';
import { BookingService } from '../../../core/services/booking.service';
import { ResourcesService } from '../../../core/services/resources.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PriceFormatterService } from '../../../core/services/prices-formatter.service';
import { DataTable } from '../../components/data-table/data-table';
import { TableColumn, TableAction, ReservationStepperData } from '../../../models/frontend.models';
import { CalendarDay, CalendarWeek, BookingResponse } from '../../../models/private-api.models';
import { BookingStatusDialog } from '../../components/booking-status-dialog/booking-status-dialog';
import { ReservationStepper } from '../../../website/components/reservation-stepper/reservation-stepper';

@Component({
  selector: 'app-calendar-page',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTabsModule,
    DataTable,
  ],
  templateUrl: './calendar-page.html',
  styleUrl: './calendar-page.scss',
})
export class CalendarPage implements OnInit {
  private readonly bookingService = inject(BookingService);
  private readonly resourcesService = inject(ResourcesService);
  private readonly notification = inject(NotificationService);
  private readonly priceFormatter = inject(PriceFormatterService);
  private readonly dialog = inject(MatDialog);

  resources = this.resourcesService.privateResources;
  calendarBookings = this.bookingService.calendarBookings;
  isInitialLoading = signal(true);
  isLoadingBookings = signal(false);
  selectedResourceId = signal<number | null>(null);
  currentWeek = signal<CalendarWeek>(this.getCurrentWeek());

  tableColumns = signal<TableColumn<BookingResponse>[]>([
    {
      key: 'time',
      label: 'Horario',
      getValue: (booking) =>
        `${this.formatTime(booking.startDatetime)} - ${this.formatTime(booking.endDatetime)}`,
    },
    {
      key: 'service',
      label: 'Servicio',
      getValue: (booking) => booking.serviceName,
    },
    {
      key: 'customer',
      label: 'Cliente',
      getValue: (booking) => booking.customerName,
    },
    {
      key: 'phone',
      label: 'Teléfono',
      getValue: (booking) => booking.customerPhone || '-',
    },
    {
      key: 'email',
      label: 'Email',
      getValue: (booking) => booking.customerEmail,
    },
    {
      key: 'price',
      label: 'Precio',
      getValue: (booking) => this.formatPrice(booking.price),
    },
    {
      key: 'status',
      label: 'Estado',
      getValue: (booking) => booking.status,
    },
  ]);

  tableActions = signal<TableAction<BookingResponse>[]>([
    {
      icon: 'edit',
      tooltip: 'Cambiar estado',
      handler: (booking) => this.openStatusDialog(booking),
    },
  ]);

  weekDays = computed<CalendarDay[]>(() => {
    const week = this.currentWeek();
    const bookings = this.calendarBookings();
    const days: CalendarDay[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(week.weekStart);
      date.setDate(date.getDate() + i);

      const dayBookings = this.isInitialLoading()
        ? []
        : bookings.filter((booking) => {
            const bookingDate = new Date(booking.startDatetime);
            return this.isSameDay(bookingDate, date);
          });

      days.push({
        date,
        dateLabel: this.formatDayLabel(date),
        dayNumber: date.getDate(),
        isToday: this.isToday(date),
        bookings: dayBookings,
      });
    }

    return days;
  });

  ngOnInit(): void {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    this.isInitialLoading.set(true);

    this.resourcesService.getAllResources().subscribe({
      next: (resources) => {
        if (resources.length > 0) {
          this.selectedResourceId.set(resources[0].id);
          this.loadCalendarBookings();
        } else {
          this.isInitialLoading.set(false);
        }
      },
      error: () => {
        this.isInitialLoading.set(false);
        this.notification.error('Error al cargar recursos');
      },
    });
  }

  onResourceChange(resourceId: number): void {
    this.selectedResourceId.set(resourceId);
    this.loadCalendarBookings();
  }

  private loadCalendarBookings(): void {
    const resourceId = this.selectedResourceId();
    if (!resourceId) return;

    const isInitial = this.isInitialLoading();
    if (!isInitial) {
      this.isLoadingBookings.set(true);
    }

    const week = this.currentWeek();
    this.bookingService
      .getBookingsForCalendar({
        resourceId,
        startDate: week.weekStart.toISOString(),
        endDate: week.weekEnd.toISOString(),
      })
      .subscribe({
        next: () => {
          this.isInitialLoading.set(false);
          this.isLoadingBookings.set(false);
        },
        error: () => {
          this.isInitialLoading.set(false);
          this.isLoadingBookings.set(false);
        },
      });
  }

  previousWeek(): void {
    const current = this.currentWeek();
    const newStart = new Date(current.weekStart);
    newStart.setDate(newStart.getDate() - 7);
    this.currentWeek.set(this.getWeekFromDate(newStart));
    this.loadCalendarBookings();
  }

  nextWeek(): void {
    const current = this.currentWeek();
    const newStart = new Date(current.weekStart);
    newStart.setDate(newStart.getDate() + 7);
    this.currentWeek.set(this.getWeekFromDate(newStart));
    this.loadCalendarBookings();
  }

  goToCurrentWeek(): void {
    this.currentWeek.set(this.getCurrentWeek());
    this.loadCalendarBookings();
  }

  private getCurrentWeek(): CalendarWeek {
    return this.getWeekFromDate(new Date());
  }

  private getWeekFromDate(date: Date): CalendarWeek {
    const weekStart = new Date(date);
    const day = weekStart.getDay();
    const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    return {
      weekStart,
      weekEnd,
      weekLabel: this.formatWeekLabel(weekStart, weekEnd),
    };
  }

  private formatWeekLabel(start: Date, end: Date): string {
    const startDay = start.getDate();
    const endDate = new Date(end);
    endDate.setDate(endDate.getDate() - 1);
    const endDay = endDate.getDate();
    const month = start.toLocaleDateString('es-CL', { month: 'short' }).replace('.', '');
    const year = start.getFullYear();
    return `${startDay} - ${endDay} ${month} ${year}`;
  }

  private formatDayLabel(date: Date): string {
    const dayName = date.toLocaleDateString('es-CL', { weekday: 'long' });
    const dayNumber = date.getDate();
    return `${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${dayNumber}`;
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  private isToday(date: Date): boolean {
    return this.isSameDay(date, new Date());
  }

  formatTime(datetime: string): string {
    const date = new Date(datetime);
    return date.toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  formatPrice(price: number): string {
    return this.priceFormatter.format(price);
  }

  getDayName(date: Date): string {
    const dayNames = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
    return dayNames[date.getDay()];
  }

  getInitialTabIndex(): number {
    const days = this.weekDays();
    const todayIndex = days.findIndex((day) => day.isToday);
    return todayIndex !== -1 ? todayIndex : 0;
  }

  openCreateBookingDialog(): void {
    const resourceId = this.selectedResourceId();
    if (!resourceId) return;

    const dialogRef = this.dialog.open(ReservationStepper, {
      width: '800px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      panelClass: ['reservation-dialog'],
      disableClose: false,
      data: {
        mode: 'admin',
        selectedResourceId: resourceId,
      } as ReservationStepperData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.success) {
        this.notification.success('Reserva creada exitosamente');
        this.loadCalendarBookings();
      }
    });
  }

  openStatusDialog(booking: BookingResponse): void {
    const dialogRef = this.dialog.open(BookingStatusDialog, {
      data: { booking },
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((status: string) => {
      if (status && status !== booking.status) {
        this.changeBookingStatus(booking.id, status);
      }
    });
  }

  private changeBookingStatus(bookingId: number, status: string): void {
    this.bookingService.updateBookingStatus(bookingId, { status }).subscribe({
      next: () => {
        this.notification.success('Estado actualizado exitosamente');
        this.loadCalendarBookings();
      },
      error: (err) => {
        this.notification.error(err.error?.message || 'Error al actualizar estado');
      },
    });
  }
}
