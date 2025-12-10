import { Component, inject, computed } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { CustomerService } from '../../../core/services/customer.service';
import { CustomerDialog } from '../../components/customer-dialog/customer-dialog';
import { ConfirmDialog } from '../../components/confirm-dialog/confirm-dialog';
import { DataTable } from '../../components/data-table/data-table';
import { TableColumn, TableAction, CustomerTableRow } from '../../../models/frontend.models';
import { NotificationService } from '../../../core/services/notification.service';
import { CustomerBookingsDialog } from '../../components/customer-bookings-dialog/customer-bookings-dialog';

@Component({
  selector: 'app-customer-page',
  imports: [MatButtonModule, MatIconModule, MatDialogModule, DataTable],
  templateUrl: './customer-page.html',
  styleUrl: './customer-page.scss',
})
export class CustomerPage {
  private readonly customerService = inject(CustomerService);
  private readonly dialog = inject(MatDialog);
  private readonly notification = inject(NotificationService);

  customers = this.customerService.customers;
  isLoading = this.customerService.isLoading;

  tableData = computed<CustomerTableRow[]>(() => {
    return this.customers().map((customer) => ({
      id: customer.id,
      fullName: `${customer.firstName} ${customer.lastName}`,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      createdAt: this.formatDate(customer.createdAt),
      initials: this.getInitials(customer.firstName, customer.lastName),
    }));
  });

  columns: TableColumn<CustomerTableRow>[] = [
    {
      key: 'fullName',
      label: 'Cliente',
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
      key: 'createdAt',
      label: 'Registrado',
      getValue: (row) => row.createdAt,
    },
  ];

  actions: TableAction<CustomerTableRow>[] = [
    {
      icon: 'event',
      tooltip: 'Ver reservas',
      handler: (row) => this.viewBookings(row.id, row.fullName),
    },
    {
      icon: 'edit',
      tooltip: 'Editar cliente',
      handler: (row) => this.openCustomerDialog(row.id),
    },
    {
      icon: 'delete',
      tooltip: 'Eliminar cliente',
      handler: (row) => this.deleteCustomer(row.id, row.fullName),
    },
  ];

  constructor() {
    this.loadData();
  }

  loadData(): void {
    this.customerService.loadCustomers().subscribe();
  }

  openCustomerDialog(customerId?: number): void {
    const dialogRef = this.dialog.open(CustomerDialog, {
      width: '600px',
      maxWidth: '95vw',
      data: customerId,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.notification.success('Cliente guardado exitosamente');
      }
    });
  }

  viewBookings(customerId: number, customerName: string): void {
    this.dialog.open(CustomerBookingsDialog, {
      width: '1000px',
      maxWidth: '95vw',
      data: { customerId, customerName },
    });
  }

  deleteCustomer(customerId: number, customerName: string): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      maxWidth: '95vw',
      data: {
        title: 'Eliminar cliente',
        message: `¿Estás seguro de eliminar al cliente "${customerName}"?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.customerService.deleteCustomer(customerId).subscribe({
          next: () => this.notification.success('Cliente eliminado exitosamente'),
          error: (err: { error?: { message?: string } }) => this.notification.error(err.error?.message || 'Error al eliminar cliente'),
        });
      }
    });
  }

  private getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}
