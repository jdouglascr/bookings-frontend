import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BookingService } from '../../../core/services/booking.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-booking-cancel',
  imports: [FormsModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule],
  templateUrl: './booking-cancel.html',
  styleUrl: './booking-cancel.scss',
})
export class BookingCancel implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly bookingService = inject(BookingService);

  readonly isLoading = signal(true);
  readonly isProcessing = signal(false);
  readonly needsConfirmation = signal(false);
  readonly success = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly cancellationReason = signal('');
  private token: string | null = null;

  ngOnInit() {
    this.token = this.route.snapshot.paramMap.get('token');

    if (!this.token) {
      this.errorMessage.set('Token de cancelación inválido');
      this.isLoading.set(false);
      return;
    }

    this.needsConfirmation.set(true);
    this.isLoading.set(false);
  }

  confirmCancellation() {
    if (!this.token || this.isProcessing()) return;

    this.isProcessing.set(true);
    const reason = this.cancellationReason().trim() || undefined;

    this.bookingService
      .cancelBooking(this.token, reason)
      .pipe(
        catchError((error) => {
          const message = error?.error?.message;
          this.errorMessage.set(message);
          this.needsConfirmation.set(false);
          this.isProcessing.set(false);
          return of(null);
        }),
      )
      .subscribe((response) => {
        if (response) {
          this.success.set(true);
          this.needsConfirmation.set(false);
          this.errorMessage.set(null);
        }
        this.isProcessing.set(false);
      });
  }

  retry() {
    this.errorMessage.set(null);
    this.needsConfirmation.set(true);
    this.cancellationReason.set('');
  }

  goToHome() {
    this.router.navigate(['/']);
  }
}
