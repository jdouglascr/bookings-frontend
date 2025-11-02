import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { UserService } from '../../../core/services/user.service';
import { UserRequest } from '../../../models/private-api.models';

@Component({
  selector: 'app-user-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatCheckboxModule,
  ],
  templateUrl: './user-dialog.html',
})
export class UserDialog implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<UserDialog>);
  private userService = inject(UserService);
  userId = inject<number | undefined>(MAT_DIALOG_DATA);
  isEdit = signal(false);
  isSaving = signal(false);
  isLoadingUser = signal(false);
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
      role: ['ROLE_STAFF', [Validators.required]],
      isActive: [true],
      password: ['', []],
    });

    if (!this.userId) {
      this.form.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    }
  }

  ngOnInit() {
    if (this.userId) {
      this.isEdit.set(true);
      this.loadUser();
    }
  }

  loadUser() {
    this.isLoadingUser.set(true);
    this.userService.getUserById(this.userId!).subscribe({
      next: (user) => {
        const phoneDisplay = user.phone?.startsWith('+56')
          ? user.phone.substring(3)
          : user.phone || '';

        this.form.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: phoneDisplay,
          role: this.mapRoleToEnum(user.role),
          isActive: user.isActive,
        });

        this.hasPhoneValue.set(!!phoneDisplay);
        this.isLoadingUser.set(false);
      },
      error: () => {
        this.isLoadingUser.set(false);
      },
    });
  }

  mapRoleToEnum(roleDisplay: string): string {
    if (roleDisplay === 'Administrador') return 'ROLE_ADMIN';
    return 'ROLE_STAFF';
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

    const request: UserRequest = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      phone: phone,
      role: formValue.role,
      isActive: formValue.isActive,
    };

    if (!this.isEdit() || (this.isEdit() && this.updatePassword())) {
      request.password = formValue.password;
    }

    const operation = this.isEdit()
      ? this.userService.updateUser(this.userId!, request)
      : this.userService.createUser(request);

    operation.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.isSaving.set(false);
        console.error('Error al guardar usuario:', err);
      },
    });
  }
}
