import { Component, computed, inject, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  Appointment,
  StepData,
  TimeSlot,
  Service,
  ContactInfo,
  Booking,
  Customer,
} from '../../../models/reservation.models';
import { AppointmentSelection } from './steps/appointment-selection/appointment-selection';
import { DatetimeSelection } from './steps/datetime-selection/datetime-selection';
import { ContactForm } from './steps/contact-form/contact-form';
import { ReservationSummary } from './steps/reservation-summary/reservation-summary';

interface StepConfig {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
}

interface DialogData {
  selectedService: Service;
}

@Component({
  selector: 'app-reservation-stepper',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
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
  private readonly snackBar = inject(MatSnackBar);
  readonly data = inject(MAT_DIALOG_DATA, { optional: true }) as DialogData | null;

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
    if (currentData.appointment?.id !== appointment.id) {
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
      console.error('Faltan datos para completar la reserva');
      return;
    }

    this.isProcessingBooking.set(true);
    this.dialogRef.disableClose = true;

    const startTime = data.selectedTimeSlot.time;
    const endTime = this.calculateEndTime(startTime, data.service.durationMin);

    const customer: Customer = {
      id: 1,
      id_business: 1,
      first_name: data.contactInfo.firstName,
      last_name: data.contactInfo.lastName,
      email: data.contactInfo.email,
      phone: data.contactInfo.phone,
    };

    const booking: Booking = {
      id: 1,
      id_customer: customer.id!,
      id_appointment_service: 1,
      date: data.selectedDate,
      start_time: startTime + ':00',
      end_time: endTime + ':00',
      price: data.service.price,
      status: 'pending',
    };

    setTimeout(() => {
      console.log('='.repeat(60));
      console.log('RESERVA CREADA EXITOSAMENTE');
      console.log('='.repeat(60));
      console.log('\n📋 DATOS DEL CLIENTE:');
      console.log(JSON.stringify(customer, null, 2));
      console.log('\n📅 DATOS DE LA RESERVA:');
      console.log(JSON.stringify(booking, null, 2));
      console.log('\n' + '='.repeat(60));

      this.dialogRef.close({ success: true, customer, booking });

      this.snackBar.open('¡Reserva registrada exitosamente! ✓', 'Cerrar', {
        duration: 5000,
        horizontalPosition: 'right',
        verticalPosition: 'bottom',
        panelClass: ['success-snackbar'],
      });
    }, 2000);
  }

  private calculateEndTime(startTime: string, durationMin: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + durationMin;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;

    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
