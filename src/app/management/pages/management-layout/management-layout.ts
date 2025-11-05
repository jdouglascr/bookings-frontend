import { Component, signal, computed, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
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
  route: string;
  isEnabled: boolean;
}

@Component({
  selector: 'app-management-layout',
  imports: [
    RouterOutlet,
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
  private router = inject(Router);

  mobileMenuOpen = signal(false);
  businessName = signal('Rulos Style');

  currentUser = this.authService.currentUser;

  userName = computed(() => this.currentUser()?.fullName);

  userRole = computed(() =>
    this.currentUser()?.role === 'ROLE_ADMIN' ? 'Administrador' : 'Personal',
  );

  menuItems = signal<MenuItem[]>([
    {
      id: 'resumen',
      label: 'Resumen',
      icon: 'dashboard',
      route: '/admin/dashboard',
      isEnabled: false,
    },
    {
      id: 'calendario',
      label: 'Calendario',
      icon: 'event',
      route: '/admin/calendar',
      isEnabled: false,
    },
    {
      id: 'servicios',
      label: 'Servicios',
      icon: 'construction',
      route: '/admin/services',
      isEnabled: true,
    },
    {
      id: 'agendas',
      label: 'Agendas',
      icon: 'schedule',
      route: '/admin/schedules',
      isEnabled: false,
    },
    {
      id: 'clientes',
      label: 'Clientes',
      icon: 'people',
      route: '/admin/customers',
      isEnabled: false,
    },
    {
      id: 'usuarios',
      label: 'Usuarios',
      icon: 'groups',
      route: '/admin/users',
      isEnabled: true,
    },
  ]);

  accountItems = signal<MenuItem[]>([
    {
      id: 'negocio',
      label: 'Mi negocio',
      icon: 'business',
      route: '/admin/business',
      isEnabled: true,
    },
    {
      id: 'cuenta',
      label: 'Mi cuenta',
      icon: 'account_box',
      route: '/admin/billing',
      isEnabled: false,
    },
  ]);

  toggleMobileMenu() {
    this.mobileMenuOpen.update((value) => !value);
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
    this.closeMobileMenu();
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  navigateToIfEnabled(item: MenuItem) {
    if (item.isEnabled) {
      this.navigateTo(item.route);
    }
  }

  logout() {
    this.authService.logout();
  }
}
