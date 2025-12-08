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
import { PhoneInputComponent } from '../../../shared/components/phone-input/phone-input';
import { PasswordInputComponent } from '../../../shared/components/password-input/password-input';

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
    PhoneInputComponent,
    PasswordInputComponent,
  ],
  templateUrl: './user-dialog.html',
  styleUrl: './user-dialog.scss',
})
export class UserDialog implements OnInit {
  private fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<UserDialog>);
  private readonly userService = inject(UserService);
  userId = inject<number | undefined>(MAT_DIALOG_DATA);
  isEdit = signal(false);
  isSaving = signal(false);
  isLoadingUser = signal(false);
  updatePassword = signal(false);
  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+56[0-9]{9}$/)]],
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
        this.form.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: this.mapRoleToEnum(user.role),
          isActive: user.isActive,
        });
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

    const request: UserRequest = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      phone: formValue.phone,
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
