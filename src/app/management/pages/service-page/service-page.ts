import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { CategoriesService } from '../../../core/services/categories.service';
import { ServicesService } from '../../../core/services/services.service';
import { CategoryWithServices } from '../../../models/admin-api.models';
import { ServiceDialog } from '../../components/service-dialog/service-dialog';
import { ConfirmDialog } from '../../components/confirm-dialog/confirm-dialog';
import { CategoryDialog } from '../../components/category-dialog/category-dialog';

@Component({
  selector: 'app-service-page',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule,
    MatMenuModule,
  ],
  templateUrl: './service-page.html',
  styleUrl: './service-page.scss',
})
export class ServicePage {
  private categoryService = inject(CategoriesService);
  private serviceService = inject(ServicesService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

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

  loadData() {
    this.categoryService.loadCategories().subscribe();
    this.serviceService.privateLoadServices().subscribe();
  }

  openCategoryDialog(category?: CategoryWithServices) {
    const dialogRef = this.dialog.open(CategoryDialog, {
      width: '500px',
      maxWidth: '95vw',
      data: category?.category,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.showSuccess('Categoría guardada exitosamente');
      }
    });
  }

  openServiceDialog(categoryId?: number, serviceId?: number) {
    const dialogRef = this.dialog.open(ServiceDialog, {
      width: '600px',
      maxWidth: '95vw',
      data: { categoryId, serviceId },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.showSuccess('Servicio guardado exitosamente');
      }
    });
  }

  deleteCategory(category: CategoryWithServices) {
    if (category.servicesCount > 0) {
      this.snackBar.open('No se puede eliminar una categoría con servicios', 'Cerrar', {
        duration: 4000,
        panelClass: 'error-snackbar',
      });
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
          next: () => this.showSuccess('Categoría eliminada exitosamente'),
          error: (err) => this.showError(err.message),
        });
      }
    });
  }

  deleteService(serviceId: number, serviceName: string) {
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
          next: () => this.showSuccess('Servicio eliminado exitosamente'),
          error: (err) => this.showError(err.message),
        });
      }
    });
  }

  private showSuccess(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: 'success-snackbar',
    });
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 4000,
      panelClass: 'error-snackbar',
    });
  }
}
