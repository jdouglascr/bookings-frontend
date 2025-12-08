import { Component, signal, computed, inject, effect } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../../../core/services/auth.service';
import { BusinessService } from '../../../core/services/business.service';
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
  readonly businessService = inject(BusinessService);

  mobileMenuOpen = signal(false);

  currentUser = this.authService.currentUser;
  isAdmin = computed(() => this.currentUser()?.role === 'ROLE_ADMIN');

  userName = computed(() => this.currentUser()?.fullName);
  userRole = computed(() => (this.isAdmin() ? 'Administrador' : 'Personal'));

  businessName = computed(() => this.businessService.business()?.name || 'Cargando...');
  businessLogo = computed(() => this.businessService.business()?.logoUrl || 'logo.png');

  private allMenuItems = signal<LayoutMenuItem[]>([
    {
      id: 'resumen',
      label: 'Resumen',
      icon: 'dashboard',
      route: '/admin/dashboard',
      allowedRoles: ['ROLE_ADMIN'],
    },
    {
      id: 'calendario',
      label: 'Calendario',
      icon: 'event',
      route: '/admin/calendar',
      allowedRoles: ['ROLE_ADMIN', 'ROLE_STAFF'],
    },
    {
      id: 'servicios',
      label: 'Servicios',
      icon: 'construction',
      route: '/admin/services',
      allowedRoles: ['ROLE_ADMIN'],
    },
    {
      id: 'recursos',
      label: 'Recursos',
      icon: 'star',
      route: '/admin/resources',
      allowedRoles: ['ROLE_ADMIN'],
    },
    {
      id: 'clientes',
      label: 'Clientes',
      icon: 'people',
      route: '/admin/customers',
      allowedRoles: ['ROLE_ADMIN'],
    },
    {
      id: 'usuarios',
      label: 'Usuarios',
      icon: 'groups',
      route: '/admin/users',
      allowedRoles: ['ROLE_ADMIN'],
    },
  ]);

  private allAccountItems = signal<LayoutMenuItem[]>([
    {
      id: 'negocio',
      label: 'Mi negocio',
      icon: 'business',
      route: '/admin/business',
      allowedRoles: ['ROLE_ADMIN'],
    },
  ]);

  menuItems = computed(() => {
    const userRole = this.currentUser()?.role;
    if (!userRole) return [];
    return this.allMenuItems().filter((item) => item.allowedRoles.includes(userRole));
  });

  accountItems = computed(() => {
    const userRole = this.currentUser()?.role;
    if (!userRole) return [];
    return this.allAccountItems().filter((item) => item.allowedRoles.includes(userRole));
  });

  hasConfigSection = computed(() => this.accountItems().length > 0);

  constructor() {
    if (!this.businessService.business()) {
      this.businessService.loadBusinessInfo();
    }

    effect(() => {
      const userRole = this.currentUser()?.role;
      if (userRole === 'ROLE_STAFF') {
        const currentRoute = this.router.url;
        const allowedRoutes = this.menuItems().map((item) => item.route);
        if (!allowedRoutes.some((route) => currentRoute.startsWith(route))) {
          this.router.navigate(['/admin/calendar']);
        }
      }
    });
  }

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

  goToWebsite() {
    this.router.navigate(['/']);
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
