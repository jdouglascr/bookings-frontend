import { Component, signal, computed, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileDialog } from '../../components/profile-dialog/profile-dialog';
import { LayoutMenuItem } from '../../../models/frontend.models';

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
    MatDialogModule,
  ],
  templateUrl: './management-layout.html',
  styleUrl: './management-layout.scss',
})
export class ManagementLayout {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  mobileMenuOpen = signal(false);
  businessName = signal('Rulos Style');

  currentUser = this.authService.currentUser;

  userName = computed(() => this.currentUser()?.fullName);

  userRole = computed(() =>
    this.currentUser()?.role === 'ROLE_ADMIN' ? 'Administrador' : 'Personal',
  );

  menuItems = signal<LayoutMenuItem[]>([
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

  accountItems = signal<LayoutMenuItem[]>([
    {
      id: 'negocio',
      label: 'Mi negocio',
      icon: 'business',
      route: '/admin/business',
      isEnabled: true,
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

  navigateToIfEnabled(item: LayoutMenuItem) {
    if (item.isEnabled) {
      this.navigateTo(item.route);
    }
  }

  openProfileDialog() {
    this.dialog.open(ProfileDialog, {
      width: '600px',
      maxWidth: '95vw',
    });
  }

  logout() {
    this.authService.logout();
  }
}
