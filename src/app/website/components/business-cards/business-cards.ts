import { Component, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { BusinessInfo } from '../../../models/reservation.models';

@Component({
  selector: 'app-business-cards',
  imports: [MatCardModule, MatIconModule],
  templateUrl: './business-cards.html',
  styleUrl: './business-cards.scss',
})
export class BusinessCards {
  private readonly _iconRegistry = inject(MatIconRegistry);
  private readonly _sanitizer = inject(DomSanitizer);

  constructor() {
    this._iconRegistry.addSvgIcon(
      'instagram',
      this._sanitizer.bypassSecurityTrustResourceUrl('instagram.svg'),
    );
    this._iconRegistry.addSvgIcon(
      'tiktok',
      this._sanitizer.bypassSecurityTrustResourceUrl('tiktok.svg'),
    );
  }

  // Simulando respuesta de API optimizada para frontend
  readonly businessInfo = signal<BusinessInfo>({
    id: 1,
    name: 'Rulos Style',
    description:
      'En Rulos Style, trabajamos con pasión y dedicación para que cada corte y peinado quede tal como lo esperabas. Todos nuestros servicios incluyen un toque final con productos profesionales, asegurando que salgas con el estilo que deseas. ¡Reserva ya!',
    address: 'Av. Rauquén 1967, Curicó, Chile',
    phone: '+56941027880',
    email: 'contacto@rulosstyle.cl',
    instagramUrl: 'https://instagram.com/rulos.styl3',
    tiktokUrl: 'https://www.tiktok.com/@rulos_style',
    logoUrl: 'logo.png',
    bannerUrl: 'banner.png',
    businessHours: [
      { dayOfWeek: 'Lunes', hours: '09:00 - 19:00', isOpen: true },
      { dayOfWeek: 'Martes', hours: '09:00 - 19:00', isOpen: true },
      { dayOfWeek: 'Miércoles', hours: '09:00 - 19:00', isOpen: true },
      { dayOfWeek: 'Jueves', hours: '09:00 - 19:00', isOpen: true },
      { dayOfWeek: 'Viernes', hours: '09:00 - 19:00', isOpen: true },
      { dayOfWeek: 'Sábado', hours: 'Cerrado', isOpen: false },
      { dayOfWeek: 'Domingo', hours: 'Cerrado', isOpen: false },
    ],
    isActive: true,
  });

  // Getters para compatibilidad con el template existente
  businessName = () => this.businessInfo().name;
  businessDescription = () => this.businessInfo().description;
  businessAddress = () => this.businessInfo().address;
  businessPhone = () => this.businessInfo().phone;
  schedule = () =>
    this.businessInfo().businessHours.map((bh) => ({
      day: bh.dayOfWeek,
      hours: bh.hours,
    }));
}
