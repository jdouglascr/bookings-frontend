import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { CategoriesService } from '../../../core/services/categories.service';
import { ServicesService } from '../../../core/services/services.service';

interface DialogData {
  categoryId?: number;
  serviceId?: number;
}

@Component({
  selector: 'app-service-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './service-dialog.html',
  styleUrl: './service-dialog.scss',
})
export class ServiceDialog implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ServiceDialog>);
  private categoryService = inject(CategoriesService);
  private serviceService = inject(ServicesService);
  data = inject<DialogData>(MAT_DIALOG_DATA);

  isEdit = signal(false);
  isSaving = signal(false);
  isLoadingService = signal(false);

  private readonly isPriceFocused = signal(false);
  private readonly hasPriceValue = signal(false);

  categories = this.categoryService.categories;

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      categoryId: [this.data?.categoryId || null, [Validators.required]],
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
      description: [''],
      durationMin: [null, [Validators.required, Validators.min(1), Validators.max(999999999)]],
      bufferTimeMin: [0, [Validators.min(0), Validators.max(999999999)]],
      price: [null, [Validators.required, Validators.min(1), Validators.max(999999999)]],
    });
  }

  ngOnInit() {
    if (this.data?.serviceId) {
      this.isEdit.set(true);
      this.loadService();
    }
  }

  loadService() {
    this.isLoadingService.set(true);
    this.serviceService.getServiceById(this.data.serviceId!).subscribe({
      next: (service) => {
        this.form.patchValue({
          categoryId: service.categoryId,
          name: service.name,
          description: service.description,
          durationMin: service.durationMin,
          bufferTimeMin: service.bufferTimeMin,
          price: service.price,
        });
        this.hasPriceValue.set(service.price !== null && service.price !== undefined);
        this.isLoadingService.set(false);
      },
      error: () => {
        this.isLoadingService.set(false);
      },
    });
  }

  shouldShowPricePrefix(): boolean {
    return this.isPriceFocused() || this.hasPriceValue();
  }

  onPriceFocus(): void {
    this.isPriceFocused.set(true);
  }

  onPriceBlur(): void {
    this.isPriceFocused.set(false);
  }

  onNumericInput(event: Event, fieldName: string, maxDigits: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '');

    if (fieldName === 'price') {
      this.hasPriceValue.set(value.length > 0);
    }

    if (value.length > maxDigits) {
      const truncated = value.slice(0, maxDigits);
      input.value = truncated;
      this.form.patchValue({ [fieldName]: Number(truncated) });
    } else if (value) {
      this.form.patchValue({ [fieldName]: Number(value) });
    } else {
      this.form.patchValue({ [fieldName]: null });
    }
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.isSaving.set(true);
    const request = {
      ...this.form.value,
      logoUrl: 'logo.png',
    };

    const operation = this.isEdit()
      ? this.serviceService.updateService(this.data.serviceId!, request)
      : this.serviceService.createService(request);

    operation.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.isSaving.set(false);
        console.error('Error al guardar servicio:', err);
      },
    });
  }
}
