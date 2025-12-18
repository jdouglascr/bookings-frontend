import { Component, input, output, inject, signal, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ServicesService } from '../../../../../core/services/services.service';
import { ResourcesService } from '../../../../../core/services/resources.service';
import { ServiceResponse } from '../../../../../models/private-api.models';
import { Service } from '../../../../../models/frontend.models';
import { PriceFormatterService } from '../../../../../core/services/prices-formatter.service';

@Component({
  selector: 'app-service-selection',
  imports: [MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './service-selection.html',
  styleUrl: './service-selection.scss',
})
export class ServiceSelection implements OnInit {
  private readonly servicesService = inject(ServicesService);
  private readonly resourcesService = inject(ResourcesService);
  readonly priceFormatter = inject(PriceFormatterService);

  selectedService = input<Service | null>(null);
  selectedResourceId = input<number>(0);
  serviceSelected = output<Service>();

  isLoading = signal(true);
  availableServices = signal<ServiceResponse[]>([]);

  ngOnInit() {
    const resourceId = this.selectedResourceId();
    if (resourceId > 0) {
      this.loadServicesForResource(resourceId);
    }
  }

  private loadServicesForResource(resourceId: number) {
    this.isLoading.set(true);

    this.resourcesService.getAllResources().subscribe({
      next: (resources) => {
        const resource = resources.find((r) => r.id === resourceId);
        if (resource) {
          this.servicesService.privateLoadServices().subscribe({
            next: (allServices) => {
              const resourceServiceIds = resource.services.map((s) => s.id);
              const filtered = allServices.filter((s) => resourceServiceIds.includes(s.id));
              this.availableServices.set(filtered);
              this.isLoading.set(false);
            },
            error: () => this.isLoading.set(false),
          });
        }
      },
      error: () => this.isLoading.set(false),
    });
  }

  selectService(serviceResponse: ServiceResponse) {
    const service: Service = {
      id: serviceResponse.id,
      name: serviceResponse.name,
      description: serviceResponse.description,
      logoUrl: serviceResponse.logoUrl,
      durationMin: serviceResponse.durationMin,
      price: serviceResponse.price,
      priceFormatted: this.priceFormatter.format(serviceResponse.price),
      durationFormatted: this.formatDuration(serviceResponse.durationMin),
    };
    this.serviceSelected.emit(service);
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) return `${hours}h ${mins}min`;
    if (hours > 0) return `${hours}h`;
    return `${mins}min`;
  }
}
