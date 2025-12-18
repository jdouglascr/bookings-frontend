import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { CustomerService } from '../../../core/services/customer.service';
import { CustomerRequest } from '../../../models/private-api.models';
import { PhoneInputComponent } from '../../../shared/components/phone-input/phone-input';

@Component({
  selector: 'app-customer-dialog',
  imports: [ReactiveFormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatIconModule, PhoneInputComponent],
  templateUrl: './customer-dialog.html',
  styleUrl: './customer-dialog.scss',
})
export class CustomerDialog implements OnInit {
  private fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<CustomerDialog>);
  private readonly customerService = inject(CustomerService);
  customerId = inject<number | undefined>(MAT_DIALOG_DATA);
  isEdit = signal(false);
  isSaving = signal(false);
  isLoadingCustomer = signal(false);
  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+56[0-9]{9}$/)]],
    });
  }

  ngOnInit() {
    if (this.customerId) {
      this.isEdit.set(true);
      this.loadCustomer();
    }
  }

  loadCustomer() {
    this.isLoadingCustomer.set(true);
    this.customerService.getCustomerById(this.customerId!).subscribe({
      next: (customer) => {
        this.form.patchValue({
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone,
        });
        this.isLoadingCustomer.set(false);
      },
      error: () => {
        this.isLoadingCustomer.set(false);
      },
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.isSaving.set(true);
    const formValue = this.form.getRawValue();

    const request: CustomerRequest = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      phone: formValue.phone,
    };

    const operation = this.isEdit()
      ? this.customerService.updateCustomer(this.customerId!, request)
      : this.customerService.createCustomer(request);

    operation.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.isSaving.set(false);
        console.error('Error al guardar cliente:', err);
      },
    });
  }
}
