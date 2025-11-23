import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { BookingResponse, BOOKING_STATUSES } from '../../../models/private-api.models';

export interface BookingStatusDialogData {
  booking: BookingResponse;
}

@Component({
  selector: 'app-booking-status-dialog',
  imports: [MatButtonModule, MatDialogModule, MatIconModule, MatFormFieldModule, MatSelectModule],
  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title class="dialog-title">Cambiar estado de reserva</h2>
      <button mat-icon-button mat-dialog-close class="close-btn">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content class="dialog-content-wrapper">
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Estado</mat-label>
        <mat-select [(value)]="selectedStatus">
          @for (status of bookingStatuses; track status) {
            <mat-option [value]="status">{{ status }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
    </mat-dialog-content>

    <mat-dialog-actions class="dialog-actions">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button
        matButton="filled"
        color="primary"
        (click)="saveStatus()"
        [disabled]="selectedStatus === data.booking.status"
      >
        Guardar
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .dialog-title {
      font-size: 1.25rem !important;
    }
  `,
})
export class BookingStatusDialog {
  private dialogRef = inject(MatDialogRef<BookingStatusDialog>);
  data = inject<BookingStatusDialogData>(MAT_DIALOG_DATA);
  readonly bookingStatuses = BOOKING_STATUSES;

  selectedStatus: string = this.data.booking.status;

  saveStatus(): void {
    this.dialogRef.close(this.selectedStatus);
  }
}
