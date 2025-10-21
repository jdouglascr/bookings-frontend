import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { BusinessCards } from '../business-cards/business-cards';
import { ServicesCard } from '../services-card/services-card';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-layout',
  imports: [MatIconModule, BusinessCards, ServicesCard, MatButtonModule, RouterLink],
  templateUrl: './website-layout.html',
  styleUrl: './website-layout.scss',
})
export class WebsiteLayout {}
