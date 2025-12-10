import { Component, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { ReservationStepper } from '../reservation-stepper/reservation-stepper';
import { ServicesService } from '../../../core/services/services.service';
import { PublicService } from '../../../models/public-api.models';
import { PriceFormatterService } from '../../../core/services/prices-formatter.service';

@Component({
  selector: 'app-services-card',
  imports: [MatTabsModule, MatCardModule, MatIconModule],
  templateUrl: './services-card.html',
  styleUrl: './services-card.scss',
})
export class ServicesCard implements OnInit {
  private readonly dialog = inject(MatDialog);
  readonly servicesService = inject(ServicesService);
  readonly priceFormatter = inject(PriceFormatterService);

  ngOnInit() {
    this.servicesService.loadServices();
  }

  onSelectService(service: PublicService) {
    this.dialog.open(ReservationStepper, {
      width: '800px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      panelClass: ['reservation-dialog'],
      disableClose: false,
      data: { selectedService: service },
    });
  }
}
