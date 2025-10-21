import { Component, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { ReservationStepper } from '../reservation-stepper/reservation-stepper';
import { ServicesService } from '../../../core/services/services.service';
import { PublicService } from '../../../models/services-api.models';

@Component({
  selector: 'app-services-card',
  standalone: true,
  imports: [MatTabsModule, MatCardModule, MatIconModule],
  templateUrl: './services-card.html',
  styleUrl: './services-card.scss',
})
export class ServicesCard implements OnInit {
  private dialog = inject(MatDialog);
  servicesService = inject(ServicesService);

  ngOnInit() {
    this.servicesService.loadServices();
  }

  onSelectService(service: PublicService) {
    console.log('Servicio seleccionado:', service);

    const dialogRef = this.dialog.open(ReservationStepper, {
      width: '800px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      panelClass: ['reservation-dialog'],
      disableClose: false,
      data: { selectedService: service },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.confirmed) {
        console.log('Reserva confirmada para:', service.name);
      }
    });
  }
}
