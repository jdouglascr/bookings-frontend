import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProfileService } from '../../../core/services/profile.service';
import { AuthService } from '../../../core/services/auth.service';
import { UpdateProfileRequest } from '../../../models/private-api.models';

@Component({
  selector: 'app-profile-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCheckboxModule,
  ],
  templateUrl: './profile-dialog.html',
})
export class ProfileDialog implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ProfileDialog>);
  private profileService = inject(ProfileService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  isSaving = signal(false);
  showPassword = signal(false);
  updatePassword = signal(false);
  private isPhoneFocused = signal(false);
  private hasPhoneValue = signal(false);

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
      password: [''],
    });
  }

  ngOnInit() {
    const currentUser = this.authService.currentUser();

    if (currentUser) {
      const phoneDisplay = currentUser.phone?.startsWith('+56')
        ? currentUser.phone.substring(3)
        : currentUser.phone || '';

      this.form.patchValue({
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        phone: phoneDisplay,
      });

      this.hasPhoneValue.set(!!phoneDisplay);
    }
  }

  shouldShowPhonePrefix(): boolean {
    return this.isPhoneFocused() || this.hasPhoneValue();
  }

  onPhoneFocus(): void {
    this.isPhoneFocused.set(true);
  }

  onPhoneBlur(): void {
    this.isPhoneFocused.set(false);
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '');

    if (value.length > 9) {
      const truncated = value.slice(0, 9);
      input.value = truncated;
      this.form.patchValue({ phone: truncated });
    } else {
      this.form.patchValue({ phone: value });
    }

    this.hasPhoneValue.set(value.length > 0);
  }

  get showPasswordToggle(): boolean {
    const passwordControl = this.form.get('password');
    return !!passwordControl && passwordControl.value?.length > 0;
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }

  toggleUpdatePassword(): void {
    this.updatePassword.update((value) => !value);

    const passwordControl = this.form.get('password');
    if (this.updatePassword()) {
      passwordControl?.setValidators([Validators.required, Validators.minLength(6)]);
      passwordControl?.enable();
    } else {
      passwordControl?.clearValidators();
      passwordControl?.setValue('');
      passwordControl?.disable();
    }
    passwordControl?.updateValueAndValidity();
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.isSaving.set(true);
    const formValue = this.form.getRawValue();

    const phone = `+56${formValue.phone}`;

    const request: UpdateProfileRequest = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      phone: phone,
    };

    if (this.updatePassword() && formValue.password) {
      request.password = formValue.password;
    }

    this.profileService.updateProfile(request).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.showSuccess('Perfil actualizado exitosamente');
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.isSaving.set(false);
        this.showError(err.error?.message || 'Error al actualizar perfil');
      },
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
