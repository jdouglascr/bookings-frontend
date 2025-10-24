import { Component, input, output, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ResourcesService } from '../../../../../core/services/resources.service';
import { PublicResource } from '../../../../../models/booking-api.models';
import { Appointment } from '../../../../../models/reservation.models';

@Component({
  selector: 'app-appointment-selection',
  imports: [MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './appointment-selection.html',
  styleUrl: './appointment-selection.scss',
})
export class AppointmentSelection implements OnInit {
  private resourcesService = inject(ResourcesService);

  selectedAppointment = input<Appointment | null>(null);
  selectedServiceId = input<number>(0);
  appointmentSelected = output<Appointment>();

  ngOnInit() {
    const serviceId = this.selectedServiceId();
    if (serviceId > 0) {
      this.resourcesService.loadResourcesByService(serviceId);
    }
  }

  appointments = this.resourcesService.resources;
  isLoading = this.resourcesService.isLoading;

  selectAppointment(resource: PublicResource) {
    const appointment: Appointment = {
      resourceServiceId: resource.resourceServiceId,
      name: resource.name,
      description: resource.description,
      imageUrl: resource.imageUrl,
    };
    this.appointmentSelected.emit(appointment);
  }
}
