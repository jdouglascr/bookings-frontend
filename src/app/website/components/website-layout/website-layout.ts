import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { BusinessCards } from '../business-cards/business-cards';
import { ServicesCard } from '../services-card/services-card';
import { BusinessService } from '../../../core/services/business.service';

@Component({
  selector: 'app-website-layout',
  imports: [MatIconModule, BusinessCards, ServicesCard, MatButtonModule, RouterLink],
  templateUrl: './website-layout.html',
  styleUrl: './website-layout.scss',
})
export class WebsiteLayout {
  businessService = inject(BusinessService);
}
