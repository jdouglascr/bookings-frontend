import { Component, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { ReservationStepper } from '../reservation-stepper/reservation-stepper';
import { Category, Service } from '../../../models/reservation.models';

@Component({
  selector: 'app-services-card',
  imports: [MatTabsModule, MatCardModule, MatIconModule],
  templateUrl: './services-card.html',
  styleUrl: './services-card.scss',
})
export class ServicesCard {
  private readonly dialog = inject(MatDialog);

  // Simulando respuesta de API optimizada para frontend
  readonly categories = signal<Category[]>([
    {
      id: 1,
      name: 'Cortes de cabello',
      isActive: true,
      services: [
        {
          id: 1,
          categoryId: 1,
          name: 'Corte clásico',
          description: 'Uso de tijeras y máquina. No incluye lavado.',
          logoUrl: 'favicon.ico',
          durationMin: 30,
          bufferTimeMin: 0,
          price: 8000,
          priceFormatted: '$8.000',
          durationFormatted: '30 min',
          isActive: true,
        },
        {
          id: 2,
          categoryId: 1,
          name: 'Corte personalizado',
          description: 'Diferentes estilos, incluye catálogo.',
          logoUrl: 'favicon.ico',
          durationMin: 45,
          bufferTimeMin: 5,
          price: 15000,
          priceFormatted: '$15.000',
          durationFormatted: '45 min',
          isActive: true,
        },
      ],
    },
    {
      id: 2,
      name: 'Barbería',
      isActive: true,
      services: [
        {
          id: 3,
          categoryId: 2,
          name: 'Afeitado clásico',
          description: 'Con navaja y toalla caliente.',
          logoUrl: 'favicon.ico',
          durationMin: 20,
          bufferTimeMin: 5,
          price: 10000,
          priceFormatted: '$10.000',
          durationFormatted: '20 min',
          isActive: true,
        },
        {
          id: 4,
          categoryId: 2,
          name: 'Arreglo de barba',
          description: 'Diseño y perfilado.',
          logoUrl: 'favicon.ico',
          durationMin: 25,
          bufferTimeMin: 5,
          price: 12000,
          priceFormatted: '$12.000',
          durationFormatted: '25 min',
          isActive: true,
        },
      ],
    },
  ]);

  onSelectService(service: Service) {
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
