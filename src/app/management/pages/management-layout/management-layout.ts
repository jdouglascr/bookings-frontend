import { Component, signal, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../core/services/auth.service';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-management-layout',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  templateUrl: './management-layout.html',
  styleUrl: './management-layout.scss',
})
export class ManagementLayout {
  private authService = inject(AuthService);

  mobileMenuOpen = signal(false);
  activeSection = signal('calendario');

  businessName = signal('Rulos Style');

  currentUser = this.authService.currentUser;
  userEmail = computed(() => this.currentUser()?.sub || 'Usuario');
  userRole = computed(() => {
    const role = this.currentUser()?.role;
    if (role === 'ROLE_ADMIN') return 'Administrador';
    if (role === 'ROLE_USER') return 'Usuario';
    return 'Invitado';
  });

  menuItems = signal<MenuItem[]>([
    { id: 'resumen', label: 'Resumen', icon: 'dashboard' },
    { id: 'calendario', label: 'Calendario', icon: 'event' },
    { id: 'servicios', label: 'Servicios', icon: 'shopping_bag' },
    { id: 'agendas', label: 'Agendas', icon: 'schedule' },
    { id: 'clientes', label: 'Clientes', icon: 'people' },
    { id: 'análisis', label: 'Análisis', icon: 'analytics' },
    { id: 'configuracion', label: 'Configuración', icon: 'settings' },
  ]);

  accountItems = signal<MenuItem[]>([
    { id: 'negocio', label: 'Mi negocio', icon: 'business' },
    { id: 'facturacion', label: 'Facturación', icon: 'receipt_long' },
    { id: 'ayuda', label: 'Ayuda', icon: 'help' },
  ]);

  getCurrentSectionLabel = computed(() => {
    const section = this.menuItems().find((item) => item.id === this.activeSection());
    return section ? section.label : 'Inicio';
  });

  toggleMobileMenu() {
    this.mobileMenuOpen.update((value) => !value);
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
  }

  setActiveSection(sectionId: string) {
    this.activeSection.set(sectionId);
    this.closeMobileMenu();
  }

  logout() {
    this.authService.logout();
  }
}
