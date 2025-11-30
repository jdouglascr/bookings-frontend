import { Component, inject, signal, OnInit, viewChild, effect } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { CategoriesService } from '../../../core/services/categories.service';
import { ServicesService } from '../../../core/services/services.service';
import { ServiceDialogData } from '../../../models/frontend.models';
import { PriceInput } from '../../../shared/components/price-input/price-input';
import { ImageInput } from '../../../shared/components/image-input/image-input';

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
    PriceInput,
    ImageInput,
  ],
  templateUrl: './service-dialog.html',
  styleUrl: './service-dialog.scss',
})
export class ServiceDialog implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<ServiceDialog>);
  private readonly categoryService = inject(CategoriesService);
  private readonly serviceService = inject(ServicesService);
  data = inject<ServiceDialogData>(MAT_DIALOG_DATA);

  imageInput = viewChild<ImageInput>('imageInput');

  isEdit = signal(false);
  isSaving = signal(false);
  isLoadingService = signal(false);
  selectedImage = signal<File | null>(null);
  currentLogoUrl = signal<string | null>(null);

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

    effect(() => {
      const input = this.imageInput();
      const logoUrl = this.currentLogoUrl();

      if (input && logoUrl) {
        input.setPreview(logoUrl);
      }
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

        if (service.logoUrl) {
          this.currentLogoUrl.set(service.logoUrl);
        }

        this.isLoadingService.set(false);
      },
      error: () => {
        this.isLoadingService.set(false);
      },
    });
  }

  onImageChange(file: File): void {
    this.selectedImage.set(file);
  }

  onNumericInput(event: Event, fieldName: string, maxDigits: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '');

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

    if (!this.isEdit() && !this.selectedImage()) {
      return;
    }

    this.isSaving.set(true);

    const formData = new FormData();
    const serviceData = {
      categoryId: this.form.value.categoryId,
      name: this.form.value.name,
      description: this.form.value.description,
      durationMin: this.form.value.durationMin,
      bufferTimeMin: this.form.value.bufferTimeMin,
      price: this.form.value.price,
    };

    formData.append('data', JSON.stringify(serviceData));

    if (this.selectedImage()) {
      formData.append('logo', this.selectedImage()!);
    }

    const operation = this.isEdit()
      ? this.serviceService.updateService(this.data.serviceId!, formData)
      : this.serviceService.createService(formData);

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
