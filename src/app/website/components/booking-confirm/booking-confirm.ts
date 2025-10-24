import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { BookingService } from '../../../core/services/booking.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-booking-confirm',
  imports: [MatButtonModule, MatCardModule, MatIconModule, MatDividerModule],
  templateUrl: './booking-confirm.html',
  styleUrl: './booking-confirm.scss',
})
export class BookingConfirm implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly bookingService = inject(BookingService);

  readonly isLoading = signal(true);
  readonly success = signal(false);
  readonly errorMessage = signal<string | null>(null);
  private token: string | null = null;

  ngOnInit() {
    this.token = this.route.snapshot.paramMap.get('token');

    if (!this.token) {
      this.errorMessage.set('Token de confirmación inválido');
      this.isLoading.set(false);
      return;
    }

    this.confirmBooking();
  }

  private confirmBooking() {
    if (!this.token) return;

    this.bookingService
      .confirmBooking(this.token)
      .pipe(
        catchError((error) => {
          const message = error?.error?.message;
          this.errorMessage.set(message);
          this.isLoading.set(false);
          return of(null);
        }),
      )
      .subscribe((response) => {
        if (response) {
          this.success.set(true);
          this.errorMessage.set(null);
        }
        this.isLoading.set(false);
      });
  }

  retry() {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.confirmBooking();
  }

  goToHome() {
    this.router.navigate(['/']);
  }
}
