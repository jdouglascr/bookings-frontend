import { Component, inject, computed } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserService } from '../../../core/services/user.service';
import { UserDialog } from '../../components/user-dialog/user-dialog';
import { ConfirmDialog } from '../../components/confirm-dialog/confirm-dialog';
import { DataTable } from '../../components/data-table/data-table';
import { TableColumn, TableAction, UserTableRow } from '../../../models/frontend.models';

@Component({
  selector: 'app-user-page',
  imports: [MatButtonModule, MatIconModule, MatDialogModule, MatSnackBarModule, DataTable],
  templateUrl: './user-page.html',
  styleUrl: './user-page.scss',
})
export class UserPage {
  private userService = inject(UserService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  users = this.userService.users;
  isLoading = this.userService.isLoading;

  tableData = computed<UserTableRow[]>(() => {
    return this.users().map((user) => ({
      id: user.id,
      fullName: `${user.firstName} ${user.lastName}`,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      statusText: user.isActive ? 'Activo' : 'Inactivo',
      lastLogin: this.formatLastLogin(user.lastLogin),
      initials: this.getInitials(user.firstName, user.lastName),
    }));
  });

  columns: TableColumn<UserTableRow>[] = [
    {
      key: 'fullName',
      label: 'Usuario',
      type: 'avatar',
      width: '250px',
      getValue: (row) => row.fullName,
      getAvatarText: (row) => row.initials,
    },
    {
      key: 'email',
      label: 'Email',
      getValue: (row) => row.email,
    },
    {
      key: 'phone',
      label: 'Teléfono',
      getValue: (row) => row.phone,
    },
    {
      key: 'role',
      label: 'Rol',
      getValue: (row) => row.role,
    },
    {
      key: 'statusText',
      label: 'Estado',
      getValue: (row) => row.statusText,
    },
    {
      key: 'lastLogin',
      label: 'Último acceso',
      getValue: (row) => row.lastLogin,
    },
  ];

  actions: TableAction<UserTableRow>[] = [
    {
      icon: 'edit',
      tooltip: 'Editar usuario',
      handler: (row) => this.openUserDialog(row.id),
    },
    {
      icon: 'delete',
      tooltip: 'Eliminar usuario',
      handler: (row) => this.deleteUser(row.id, row.fullName),
    },
  ];

  constructor() {
    this.loadData();
  }

  loadData(): void {
    this.userService.loadUsers().subscribe();
  }

  openUserDialog(userId?: number): void {
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

  deleteUser(userId: number, userName: string): void {
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
          error: (err: { error?: { message?: string } }) =>
            this.showError(err.error?.message || 'Error al eliminar usuario'),
        });
      }
    });
  }

  private getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  private formatLastLogin(lastLogin?: string): string {
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

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: 'success-snackbar',
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 4000,
      panelClass: 'error-snackbar',
    });
  }
}
