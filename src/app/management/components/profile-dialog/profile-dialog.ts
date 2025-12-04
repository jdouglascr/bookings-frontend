import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ProfileService } from '../../../core/services/profile.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { UpdateProfileRequest } from '../../../models/private-api.models';
import { PhoneInputComponent } from '../../../shared/components/phone-input/phone-input';
import { PasswordInputComponent } from '../../../shared/components/password-input/password-input';

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
    PhoneInputComponent,
    PasswordInputComponent,
  ],
  templateUrl: './profile-dialog.html',
})
export class ProfileDialog implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ProfileDialog>);
  private profileService = inject(ProfileService);
  private authService = inject(AuthService);
  private notification = inject(NotificationService);

  isSaving = signal(false);
  updatePassword = signal(false);

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^(\+56)?[0-9]{9}$/)]],
      password: [''],
    });
  }

  ngOnInit() {
    const currentUser = this.authService.currentUser();

    if (currentUser) {
      this.form.patchValue({
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        phone: currentUser.phone,
      });
    }
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
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach((key) => {
        this.form.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSaving.set(true);
    const formValue = this.form.getRawValue();

    const request: UpdateProfileRequest = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      phone: formValue.phone,
    };

    if (this.updatePassword() && formValue.password) {
      request.password = formValue.password;
    }

    this.profileService.updateProfile(request).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.notification.success('Perfil actualizado exitosamente');
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.isSaving.set(false);
        this.notification.error(err.error?.message || 'Error al actualizar el perfil');
      },
    });
  }
}
