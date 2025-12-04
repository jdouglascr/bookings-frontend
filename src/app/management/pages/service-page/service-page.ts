import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CategoriesService } from '../../../core/services/categories.service';
import { ServicesService } from '../../../core/services/services.service';
import { CategoryWithServices } from '../../../models/private-api.models';
import { ServiceDialog } from '../../components/service-dialog/service-dialog';
import { ConfirmDialog } from '../../components/confirm-dialog/confirm-dialog';
import { CategoryDialog } from '../../components/category-dialog/category-dialog';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-service-page',
  imports: [MatButtonModule, MatIconModule, MatCardModule, MatMenuModule, MatTooltipModule],
  templateUrl: './service-page.html',
  styleUrl: './service-page.scss',
})
export class ServicePage {
  private readonly categoryService = inject(CategoriesService);
  private readonly serviceService = inject(ServicesService);
  private readonly dialog = inject(MatDialog);
  private readonly notification = inject(NotificationService);

  isLoading = computed(() => this.categoryService.isLoading() || this.serviceService.isLoading());

  categoriesWithServices = computed<CategoryWithServices[]>(() => {
    const categories = this.categoryService.categories();
    const services = this.serviceService.services();

    return categories.map((category) => ({
      category,
      services: services.filter((s) => s.categoryId === category.id),
      servicesCount: services.filter((s) => s.categoryId === category.id).length,
    }));
  });

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    this.categoryService.loadCategories().subscribe();
    this.serviceService.privateLoadServices().subscribe();
  }

  openCategoryDialog(category?: CategoryWithServices): void {
    const dialogRef = this.dialog.open(CategoryDialog, {
      width: '500px',
      maxWidth: '95vw',
      data: category?.category,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.notification.success('Categoría guardada exitosamente');
      }
    });
  }

  openServiceDialog(categoryId?: number, serviceId?: number): void {
    const dialogRef = this.dialog.open(ServiceDialog, {
      width: '600px',
      maxWidth: '95vw',
      data: { categoryId, serviceId },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.notification.success('Servicio guardado exitosamente');
      }
    });
  }

  deleteCategory(category: CategoryWithServices): void {
    if (category.servicesCount > 0) {
      this.notification.error('No se puede eliminar una categoría con servicios');
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      maxWidth: '95vw',
      data: {
        title: 'Eliminar categoría',
        message: `¿Estás seguro de eliminar la categoría "${category.category.name}"?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.categoryService.deleteCategory(category.category.id).subscribe({
          next: () => this.notification.success('Categoría eliminada exitosamente'),
          error: (err) => this.notification.error(err.message),
        });
      }
    });
  }

  deleteService(serviceId: number, serviceName: string): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      maxWidth: '95vw',
      data: {
        title: 'Eliminar servicio',
        message: `¿Estás seguro de eliminar el servicio "${serviceName}"?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.serviceService.deleteService(serviceId).subscribe({
          next: () => this.notification.success('Servicio eliminado exitosamente'),
          error: (err) =>
            this.notification.error(err.error?.message || 'Error al eliminar servicio'),
        });
      }
    });
  }
}
