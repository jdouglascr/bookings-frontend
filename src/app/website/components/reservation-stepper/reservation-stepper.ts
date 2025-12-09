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
  Service,
  ReservationStepperData,
} from '../../../models/frontend.models';
import { AppointmentSelection } from './steps/appointment-selection/appointment-selection';
import { ServiceSelection } from './steps/service-selection/service-selection';
import { DatetimeSelection } from './steps/datetime-selection/datetime-selection';
import { ContactForm } from './steps/contact-form/contact-form';
import { ReservationSummary } from './steps/reservation-summary/reservation-summary';
import { CustomerService } from '../../../core/services/customer.service';
import { BookingService } from '../../../core/services/booking.service';
import { ResourcesService } from '../../../core/services/resources.service';
import { PublicBookingCreateRequest } from '../../../models/public-api.models';
import { catchError, switchMap, of } from 'rxjs';
import { NotificationService } from '../../../core/services/notification.service';
import { CustomerRequest } from '../../../models/private-api.models';

@Component({
  selector: 'app-reservation-stepper',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    AppointmentSelection,
    ServiceSelection,
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
  private readonly resourcesService = inject(ResourcesService);
  readonly data = inject(MAT_DIALOG_DATA, { optional: true }) as ReservationStepperData | null;

  @ViewChild(DatetimeSelection) datetimeSelection?: DatetimeSelection;

  readonly mode = signal<'public' | 'admin'>(this.data?.mode || 'public');

  readonly steps = computed<StepConfig[]>(() => {
    if (this.mode() === 'admin') {
      return [
        {
          id: 'service',
          title: 'Servicio',
          subtitle: 'Selecciona el servicio',
          icon: 'star',
        },
        {
          id: 'datetime',
          title: 'Horario',
          subtitle: 'Elige cuándo quieres la reserva',
          icon: 'schedule',
        },
        {
          id: 'contact',
          title: 'Cliente',
          subtitle: 'Información del cliente',
          icon: 'contact_mail',
        },
        {
          id: 'confirm',
          title: 'Resumen',
          subtitle: 'Revisa y confirma la reserva',
          icon: 'check_circle',
        },
      ];
    }

    return [
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
  });

  readonly currentStepIndex = signal(0);
  readonly currentStep = computed(() => this.steps()[this.currentStepIndex()]);
  readonly stepData = signal<StepData>({
    service: this.data?.selectedService,
    serviceId: this.data?.selectedService?.id,
    resourceId: this.data?.selectedResourceId,
  });

  private readonly contactFormValid = signal(false);
  readonly isProcessingBooking = signal(false);

  nextStep() {
    if (this.currentStepIndex() < this.steps().length - 1 && this.canProceedToNextStep()) {
      this.currentStepIndex.update((index) => index + 1);
    }
  }

  previousStep() {
    if (this.currentStepIndex() > 0) {
      const currentIndex = this.currentStepIndex();

      this.stepData.update((data) => {
        const newData = { ...data };

        if (currentIndex === 1 || currentIndex === 2) {
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
    const currentStep = this.currentStep();
    const data = this.stepData();

    switch (currentStep.id) {
      case 'service':
        return !!(data.service && data.resourceServiceId);
      case 'appointment':
        return !!data.appointment;
      case 'datetime':
        return !!(data.selectedDate && data.selectedTimeSlot);
      case 'contact':
        return this.contactFormValid() && !!data.contactInfo;
      default:
        return true;
    }
  }

  onServiceSelected(service: Service) {
    const resourceId = this.stepData().resourceId;

    if (!resourceId) {
      this.notification.error('Error: No se encontró el recurso');
      return;
    }

    this.resourcesService.loadResourcesByService(service.id);

    const checkResourcesLoaded = setInterval(() => {
      if (!this.resourcesService.isLoading()) {
        clearInterval(checkResourcesLoaded);

        const publicResources = this.resourcesService.resources();
        const matchingResource = publicResources.find((pr) => pr.resourceId === resourceId);

        if (!matchingResource) {
          this.notification.error('Este recurso no ofrece el servicio seleccionado');
          return;
        }

        this.stepData.update((data) => ({
          ...data,
          service,
          serviceId: service.id,
          resourceServiceId: matchingResource.resourceServiceId,
          selectedDate: undefined,
          selectedTimeSlot: undefined,
        }));
      }
    }, 50);
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

    if (!data.service || !data.selectedDate || !data.selectedTimeSlot || !data.contactInfo) {
      this.notification.error('Faltan datos para completar la reserva');
      return;
    }

    if (this.mode() === 'public' && !data.appointment) {
      this.notification.error('Falta seleccionar el recurso');
      return;
    }

    if (this.mode() === 'admin' && !data.resourceServiceId) {
      this.notification.error('Error al obtener la información del recurso');
      return;
    }

    this.isProcessingBooking.set(true);
    this.dialogRef.disableClose = true;

    const startDatetime = this.buildDatetime(data.selectedDate, data.selectedTimeSlot.time);
    const endDatetime = this.calculateEndDatetime(startDatetime, data.service.durationMin);

    const customerRequest: CustomerRequest = {
      firstName: data.contactInfo.firstName,
      lastName: data.contactInfo.lastName,
      email: data.contactInfo.email,
      phone: data.contactInfo.phone,
    };

    this.customerService
      .upsertCustomer(customerRequest)
      .pipe(
        switchMap((customer) => {
          const resourceServiceId = this.getResourceServiceId();

          if (resourceServiceId === 0) {
            throw new Error('No se pudo determinar el resourceServiceId');
          }

          const publicBookingRequest: PublicBookingCreateRequest = {
            customerId: customer.id,
            resourceServiceId: resourceServiceId,
            startDatetime: startDatetime,
            endDatetime: endDatetime,
            price: data.service!.price,
          };

          return this.bookingService.createPublicBooking(publicBookingRequest);
        }),
        catchError((error) => {
          console.error('Error al crear la reserva:', error);
          this.isProcessingBooking.set(false);
          this.dialogRef.disableClose = false;
          this.notification.error('Error al crear la reserva. Por favor intenta nuevamente.');
          return of(null);
        }),
      )
      .subscribe((response) => {
        if (response) {
          this.dialogRef.close({ success: true, booking: response });
          this.notification.success('¡Reserva registrada exitosamente!');
        }

        this.isProcessingBooking.set(false);
        this.dialogRef.disableClose = false;
      });
  }

  private getResourceServiceId(): number {
    const data = this.stepData();

    if (this.mode() === 'public') {
      return data.appointment?.resourceServiceId || 0;
    }

    return data.resourceServiceId || 0;
  }

  private buildDatetime(date: string, time: string): string {
    return `${date}T${time}:00`;
  }

  private calculateEndDatetime(startDatetime: string, durationMin: number): string {
    const [date, time] = startDatetime.split('T');
    const [hours, minutes] = time.split(':').map(Number);

    const totalMinutes = hours * 60 + minutes + durationMin;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;

    const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}:00`;

    return `${date}T${endTime}`;
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
