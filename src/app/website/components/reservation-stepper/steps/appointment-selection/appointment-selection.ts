import { Component, input, output, signal } from '@angular/core';
import { Appointment } from '../../../../../models/reservation.models';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-appointment-selection',
  imports: [MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './appointment-selection.html',
  styleUrl: './appointment-selection.scss',
})
export class AppointmentSelection {
  selectedAppointment = input<Appointment | null>(null);
  appointmentSelected = output<Appointment>();

  // Simulando respuesta de API optimizada para frontend
  appointments = signal<Appointment[]>([
    {
      id: 1,
      businessId: 1,
      userId: 1,
      name: 'Carlos Mendoza',
      description: 'Especialista en cortes modernos y clásicos. 10 años de experiencia.',
      imageUrl: '/favicon.ico',
      isActive: true,
      availableServices: [1, 2, 3, 4], // Puede prestar todos los servicios
    },
    {
      id: 2,
      businessId: 1,
      userId: 2,
      name: 'Ana Rodriguez',
      description: 'Experta en coloración y peinados. Formación internacional.',
      imageUrl: '/favicon.ico',
      isActive: true,
      availableServices: [1, 2], // Solo servicios de cortes de cabello
    },
    {
      id: 3,
      businessId: 1,
      userId: 3,
      name: 'Luis Garcia',
      description: 'Barbero tradicional con técnicas de última generación.',
      imageUrl: '/favicon.ico',
      isActive: true,
      availableServices: [3, 4], // Solo servicios de barbería
    },
  ]);

  selectAppointment(appointment: Appointment) {
    this.appointmentSelected.emit(appointment);
  }
}
