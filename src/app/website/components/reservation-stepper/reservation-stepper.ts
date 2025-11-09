import { Component, computed, inject, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import {
  Appointment,
  StepData,
  TimeSlot,
  ContactInfo,
  StepConfig,
  SelectedServiceDialogData,
} from '../../../models/frontend.models';
import { AppointmentSelection } from './steps/appointment-selection/appointment-selection';
import { DatetimeSelection } from './steps/datetime-selection/datetime-selection';
import { ContactForm } from './steps/contact-form/contact-form';
import { ReservationSummary } from './steps/reservation-summary/reservation-summary';
import { CustomerService } from '../../../core/services/customer.service';
import { BookingService } from '../../../core/services/booking.service';
import { PublicBookingCreateRequest } from '../../../models/public-api.models';
import { catchError, switchMap, of } from 'rxjs';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-reservation-stepper',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    AppointmentSelection,
    DatetimeSelection,
    ContactForm,
    ReservationSummary,
  ],
  templateUrl: './reservation-stepper.html',
  styleUrl: './reservation-stepper.scss',
})
export class ReservationStepper {
  private readonly dialogRef = inject(MatDialogRef<ReservationStepper>);
  private readonly notification = inject(NotificationService);
  private readonly customerService = inject(CustomerService);
  private readonly bookingService = inject(BookingService);
  readonly data = inject(MAT_DIALOG_DATA, { optional: true }) as SelectedServiceDialogData | null;

  @ViewChild(DatetimeSelection) datetimeSelection?: DatetimeSelection;

  readonly steps: StepConfig[] = [
    {
      id: 'appointment',
      title: 'Recurso',
      subtitle: 'Selecciona tu preferencia de reserva',
      icon: 'star',
    },
    {
      id: 'datetime',
      title: 'Horario',
      subtitle: 'Elige cuándo quieres tu reserva',
      icon: 'schedule',
    },
    {
      id: 'contact',
      title: 'Tus datos',
      subtitle: 'Información para contactarte',
      icon: 'contact_mail',
    },
    {
      id: 'confirm',
      title: 'Resumen',
      subtitle: 'Revisa y confirma tu reserva',
      icon: 'check_circle',
    },
  ];

  readonly currentStepIndex = signal(0);
  readonly currentStep = computed(() => this.steps[this.currentStepIndex()]);
  readonly stepData = signal<StepData>({
    service: this.data?.selectedService || undefined,
    serviceId: this.data?.selectedService?.id || 0,
  });

  private readonly contactFormValid = signal(false);
  readonly isProcessingBooking = signal(false);

  nextStep() {
    if (this.currentStepIndex() < this.steps.length - 1 && this.canProceedToNextStep()) {
      this.currentStepIndex.update((index) => index + 1);
    }
  }

  previousStep() {
    if (this.currentStepIndex() > 0) {
      const currentIndex = this.currentStepIndex();

      this.stepData.update((data) => {
        const newData = { ...data };

        if (currentIndex === 1) {
          delete newData.selectedDate;
          delete newData.selectedTimeSlot;

          setTimeout(() => {
            this.datetimeSelection?.clearSelection();
          });
        }

        return newData;
      });

      this.currentStepIndex.update((index) => index - 1);
    }
  }

  canProceedToNextStep(): boolean {
    const currentIndex = this.currentStepIndex();
    const data = this.stepData();

    switch (currentIndex) {
      case 0:
        return !!data.appointment;
      case 1:
        return !!(data.selectedDate && data.selectedTimeSlot);
      case 2:
        return this.contactFormValid() && !!data.contactInfo;
      default:
        return true;
    }
  }

  onAppointmentSelected(appointment: Appointment) {
    this.stepData.update((data) => ({
      ...data,
      appointment,
    }));

    const currentData = this.stepData();
    if (currentData.appointment?.resourceServiceId !== appointment.resourceServiceId) {
      this.stepData.update((data) => ({
        ...data,
        selectedDate: undefined,
        selectedTimeSlot: undefined,
      }));
    }
  }

  onDatetimeSelected(selection: { date: string; timeSlot: TimeSlot }) {
    this.stepData.update((data) => ({
      ...data,
      selectedDate: selection.date,
      selectedTimeSlot: selection.timeSlot,
    }));
  }

  onDateChanged(selection: { date: string }) {
    this.stepData.update((data) => ({
      ...data,
      selectedDate: selection.date,
      selectedTimeSlot: undefined,
    }));
  }

  onContactInfoChanged(contactInfo: ContactInfo) {
    this.stepData.update((data) => ({
      ...data,
      contactInfo,
    }));
  }

  onContactFormValidityChanged(isValid: boolean) {
    this.contactFormValid.set(isValid);
  }

  confirmBooking() {
    if (this.isProcessingBooking()) return;
    const data = this.stepData();

    if (
      !data.service ||
      !data.appointment ||
      !data.selectedDate ||
      !data.selectedTimeSlot ||
      !data.contactInfo
    ) {
      this.notification.error('Faltan datos para completar la reserva');
      return;
    }

    this.isProcessingBooking.set(true);
    this.dialogRef.disableClose = true;

    const startDatetime = this.buildDatetime(data.selectedDate, data.selectedTimeSlot.time);
    const endDatetime = this.calculateEndDatetime(startDatetime, data.service.durationMin);

    this.customerService
      .upsertCustomer(data.contactInfo)
      .pipe(
        switchMap((customerResponse) => {
          const customer = this.customerService.mapToCustomer(customerResponse);

          const bookingRequest: PublicBookingCreateRequest = {
            customerId: customer.id!,
            resourceServiceId: data.appointment!.resourceServiceId,
            startDatetime: startDatetime,
            endDatetime: endDatetime,
            price: data.service!.price,
          };

          return this.bookingService.createBooking(bookingRequest);
        }),
        catchError((error) => {
          console.error('Error al crear la reserva:', error);
          this.isProcessingBooking.set(false);
          this.dialogRef.disableClose = false;
          this.notification.error('Error al crear la reserva. Por favor intenta nuevamente.');
          return of(null);
        }),
      )
      .subscribe((bookingResponse) => {
        if (bookingResponse) {
          this.dialogRef.close({ success: true, booking: bookingResponse });
          this.notification.success('¡Reserva registrada exitosamente!');
        }

        this.isProcessingBooking.set(false);
        this.dialogRef.disableClose = false;
      });
  }

  private buildDatetime(date: string, time: string): string {
    return `${date}T${time}:00`;
  }

  private calculateEndDatetime(startDatetime: string, durationMin: number): string {
    const start = new Date(startDatetime);
    const end = new Date(start.getTime() + durationMin * 60000);

    return end.toISOString().slice(0, 19);
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
