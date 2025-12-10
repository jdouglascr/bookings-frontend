import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { ResourcesService } from '../../../core/services/resources.service';
import { UserService } from '../../../core/services/user.service';
import { ResourceResponse } from '../../../models/private-api.models';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialog } from '../../components/confirm-dialog/confirm-dialog';
import { ResourceDialog } from '../../components/resource-dialog/resource-dialog';

@Component({
  selector: 'app-resource-page',
  imports: [MatButtonModule, MatIconModule, MatCardModule, MatMenuModule, MatFormFieldModule, MatSelectModule, MatTooltipModule],
  templateUrl: './resource-page.html',
  styleUrl: './resource-page.scss',
})
export class ResourcePage implements OnInit {
  private readonly resourcesService = inject(ResourcesService);
  private readonly userService = inject(UserService);
  private readonly dialog = inject(MatDialog);
  private readonly notification = inject(NotificationService);

  resources = this.resourcesService.privateResources;
  users = this.userService.users;
  isLoading = this.resourcesService.isPrivateLoading;

  searchTerm = signal('');
  typeFilter = signal<string>('all');
  userFilter = signal<string>('all');

  filteredResources = computed<ResourceResponse[]>(() => {
    let filtered = this.resources();

    const type = this.typeFilter();
    if (type !== 'all') {
      filtered = filtered.filter((r) => r.resourceType === type);
    }

    const userId = this.userFilter();
    if (userId !== 'all') {
      filtered = filtered.filter((r) => r.userId === Number(userId));
    }

    return filtered;
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.resourcesService.getAllResources().subscribe();
    this.userService.loadUsers().subscribe();
  }

  onTypeFilterChange(value: string): void {
    this.typeFilter.set(value);
  }

  onUserFilterChange(value: string): void {
    this.userFilter.set(value);
  }

  clearFilters(): void {
    this.typeFilter.set('all');
    this.userFilter.set('all');
  }

  openResourceDialog(resourceId?: number): void {
    const dialogRef = this.dialog.open(ResourceDialog, {
      width: '600px',
      maxWidth: '95vw',
      data: resourceId,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.notification.success('Recurso guardado exitosamente');
        this.loadData();
      }
    });
  }

  editResource(id: number): void {
    this.openResourceDialog(id);
  }

  deleteResource(id: number, name: string): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      maxWidth: '95vw',
      data: {
        title: 'Eliminar recurso',
        message: `¿Estás seguro de eliminar el recurso "${name}"?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.resourcesService.deleteResource(id).subscribe({
          next: () => {
            this.notification.success('Recurso eliminado exitosamente');
            this.loadData();
          },
          error: (err) => this.notification.error(err.error?.message || 'Error al eliminar'),
        });
      }
    });
  }
}
