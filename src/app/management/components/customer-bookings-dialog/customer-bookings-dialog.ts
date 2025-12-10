import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { BookingService } from '../../../core/services/booking.service';
import { BookingResponse } from '../../../models/private-api.models';
import { DataTable } from '../data-table/data-table';
import { TableColumn, BookingTableRow, CustomerBookingsDialogData } from '../../../models/frontend.models';

@Component({
  selector: 'app-customer-bookings-dialog',
  imports: [MatButtonModule, MatDialogModule, MatIconModule, DataTable],
  templateUrl: './customer-bookings-dialog.html',
  styles: [
    `
      :host {
        display: block;
      }

      .dialog-content-wrapper {
        padding: 0 24px 24px 24px !important;
        overflow: visible !important;
      }

      .dialog-actions {
        padding-top: 0 !important;
      }
    `,
  ],
})
export class CustomerBookingsDialog implements OnInit {
  private bookingService = inject(BookingService);
  data = inject<CustomerBookingsDialogData>(MAT_DIALOG_DATA);

  bookings = signal<BookingResponse[]>([]);
  isLoading = signal(false);

  tableData = computed<BookingTableRow[]>(() => {
    return this.bookings().map((booking) => ({
      id: booking.id,
      serviceName: booking.serviceName,
      resourceName: booking.resourceName,
      duration: this.calculateDuration(booking.startDatetime, booking.endDatetime),
      price: `$${booking.price.toLocaleString('es-CL')}`,
      status: booking.status,
    }));
  });

  columns: TableColumn<BookingTableRow>[] = [
    {
      key: 'serviceName',
      label: 'Servicio',
      getValue: (row) => row.serviceName,
    },
    {
      key: 'resourceName',
      label: 'Recurso',
      getValue: (row) => row.resourceName,
    },
    {
      key: 'duration',
      label: 'Duración',
      getValue: (row) => row.duration,
    },
    {
      key: 'price',
      label: 'Precio',
      getValue: (row) => row.price,
    },
    {
      key: 'status',
      label: 'Estado',
      getValue: (row) => row.status,
    },
  ];

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    this.isLoading.set(true);
    this.bookingService.getBookingsByCustomer(this.data.customerId).subscribe({
      next: (bookings) => {
        this.bookings.set(bookings);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  private calculateDuration(start: string, end: string): string {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 60) {
      return `${diffMinutes} min`;
    }

    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    if (minutes === 0) {
      return `${hours} h`;
    }

    return `${hours} h ${minutes} min`;
  }
}
