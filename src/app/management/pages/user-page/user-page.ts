import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserService } from '../../../core/services/user.service';
import { UserDialog } from '../../components/user-dialog/user-dialog';
import { ConfirmDialog } from '../../components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-user-page',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
  ],
  templateUrl: './user-page.html',
  styleUrl: './user-page.scss',
})
export class UserPage {
  private userService = inject(UserService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  users = this.userService.users;
  isLoading = this.userService.isLoading;

  constructor() {
    this.loadData();
  }

  loadData() {
    this.userService.loadUsers().subscribe();
  }

  openUserDialog(userId?: number) {
    const dialogRef = this.dialog.open(UserDialog, {
      width: '600px',
      maxWidth: '95vw',
      data: userId,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.showSuccess('Usuario guardado exitosamente');
      }
    });
  }

  deleteUser(userId: number, userName: string) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      maxWidth: '95vw',
      data: {
        title: 'Eliminar usuario',
        message: `¿Estás seguro de eliminar al usuario "${userName}"?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.userService.deleteUser(userId).subscribe({
          next: () => this.showSuccess('Usuario eliminado exitosamente'),
          error: (err) => this.showError(err.error?.message || 'Error al eliminar usuario'),
        });
      }
    });
  }

  getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  formatLastLogin(lastLogin?: string): string {
    if (!lastLogin) return 'Nunca';

    const date = new Date(lastLogin);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;

    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
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
