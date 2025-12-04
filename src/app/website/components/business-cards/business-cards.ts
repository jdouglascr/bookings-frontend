import { Component, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { BusinessService } from '../../../core/services/business.service';

@Component({
  selector: 'app-business-cards',
  imports: [MatCardModule, MatIconModule],
  templateUrl: './business-cards.html',
  styleUrl: './business-cards.scss',
})
export class BusinessCards implements OnInit {
  private iconRegistry = inject(MatIconRegistry);
  private sanitizer = inject(DomSanitizer);
  businessService = inject(BusinessService);

  constructor() {
    this.iconRegistry.addSvgIcon(
      'instagram',
      this.sanitizer.bypassSecurityTrustResourceUrl('instagram.svg'),
    );
    this.iconRegistry.addSvgIcon(
      'tiktok',
      this.sanitizer.bypassSecurityTrustResourceUrl('tiktok.svg'),
    );
    this.iconRegistry.addSvgIcon(
      'facebook',
      this.sanitizer.bypassSecurityTrustResourceUrl('facebook.svg'),
    );
  }

  ngOnInit() {
    this.businessService.loadBusinessInfo();
  }
}
