import { Component, inject, effect } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ErrorResponse } from '../../../models/shared-api.models';
import { PasswordInputComponent } from '../../../shared/components/password-input/password-input';

@Component({
  selector: 'app-login',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    RouterLink,
    PasswordInputComponent,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private fb = inject(FormBuilder);
  private readonly notification = inject(NotificationService);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  isLoading = this.authService.isLoading;

  constructor() {
    effect(() => {
      const loading = this.isLoading();
      if (loading) {
        this.loginForm.disable({ emitEvent: false });
      } else {
        this.loginForm.enable({ emitEvent: false });
      }
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach((key) => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.authService
      .login({
        email: this.loginForm.value.email,
        password: this.loginForm.value.password,
      })
      .subscribe({
        next: () => {
          const returnUrl = sessionStorage.getItem('returnUrl') || '/admin';
          sessionStorage.removeItem('returnUrl');
          this.router.navigate([returnUrl]);
        },
        error: (error: ErrorResponse) => {
          this.notification.error(error.message || 'Inicio de sesión fallido');
        },
      });
  }
}
