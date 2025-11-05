import { Component, inject, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { BusinessService } from '../../../core/services/business.service';
import { BusinessWithHoursUpdateRequest } from '../../../models/private-api.models';
import { AvailableTimesSelector } from '../../components/available-times-selector/available-times-selector';
import { DaySchedule } from '../../../models/frontend.models';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-business-page',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    AvailableTimesSelector,
  ],
  templateUrl: './business-page.html',
  styleUrl: './business-page.scss',
})
export class BusinessPage {
  private fb = inject(FormBuilder);
  private businessService = inject(BusinessService);
  private snackBar = inject(MatSnackBar);

  isLoading = computed(() => this.businessService.isPrivateLoading());
  isSaving = signal(false);

  logoFile = signal<File | null>(null);
  bannerFile = signal<File | null>(null);
  logoPreview = signal<string | null>(null);
  bannerPreview = signal<string | null>(null);

  private isPhoneFocused = signal(false);
  private hasPhoneValue = signal(false);

  schedules = signal<DaySchedule[]>([]);

  businessForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
    description: ['', Validators.required],
    address: ['', [Validators.required, Validators.maxLength(255)]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
    email: ['', [Validators.required, Validators.email]],
    facebookUrl: ['', Validators.maxLength(255)],
    instagramUrl: ['', Validators.maxLength(255)],
    tiktokUrl: ['', Validators.maxLength(255)],
  });

  private formStatus = toSignal(this.businessForm.statusChanges, {
    initialValue: this.businessForm.status,
  });

  canSave = computed(() => {
    this.formStatus();
    return !this.isSaving() && !this.isLoading() && this.businessForm.valid;
  });

  constructor() {
    this.loadData();
  }

  loadData() {
    this.businessService.loadBusinessWithHours().subscribe({
      next: (data) => {
        const phoneDisplay = data.phone?.startsWith('+56')
          ? data.phone.substring(3)
          : data.phone || '';

        this.businessForm.patchValue({
          name: data.name,
          description: data.description,
          address: data.address,
          phone: phoneDisplay,
          email: data.email,
          facebookUrl: data.facebookUrl || '',
          instagramUrl: data.instagramUrl || '',
          tiktokUrl: data.tiktokUrl || '',
        });

        this.hasPhoneValue.set(!!phoneDisplay);
        this.logoPreview.set(data.logoUrl);
        this.bannerPreview.set(data.bannerUrl);

        const mappedSchedules: DaySchedule[] = data.businessHours.map((hour) => ({
          id: hour.id,
          dayOfWeek: hour.dayOfWeek,
          startTime: hour.startTime || '',
          endTime: hour.endTime || '',
          isClosed: hour.isClosed,
        }));

        this.schedules.set(mappedSchedules);
      },
      error: (err) => this.showError(err.error?.message || 'Error al cargar la información'),
    });
  }

  onSchedulesChange(updatedSchedules: DaySchedule[]): void {
    this.schedules.set(updatedSchedules);
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
      this.businessForm.patchValue({ phone: truncated });
    } else {
      this.businessForm.patchValue({ phone: value });
    }

    this.hasPhoneValue.set(value.length > 0);
  }

  onLogoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      this.processImageFile(input.files[0], 'logo');
    }
  }

  onBannerSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      this.processImageFile(input.files[0], 'banner');
    }
  }

  onLogoDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer?.files?.[0]) {
      this.processImageFile(event.dataTransfer.files[0], 'logo');
    }
  }

  onBannerDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer?.files?.[0]) {
      this.processImageFile(event.dataTransfer.files[0], 'banner');
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  processImageFile(file: File, type: 'logo' | 'banner') {
    if (!file.type.startsWith('image/')) {
      this.showError('Por favor selecciona un archivo de imagen válido');
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      this.showError('El archivo no debe superar los 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (type === 'logo') {
        this.logoFile.set(file);
        this.logoPreview.set(e.target?.result as string);
      } else {
        this.bannerFile.set(file);
        this.bannerPreview.set(e.target?.result as string);
      }
    };
    reader.readAsDataURL(file);
  }

  saveBusiness() {
    this.isSaving.set(true);

    const formValue = this.businessForm.value;

    const request: BusinessWithHoursUpdateRequest = {
      name: formValue.name || '',
      description: formValue.description || '',
      address: formValue.address || '',
      phone: `+56${formValue.phone || ''}`,
      email: formValue.email || '',
      facebookUrl: formValue.facebookUrl || undefined,
      instagramUrl: formValue.instagramUrl || undefined,
      tiktokUrl: formValue.tiktokUrl || undefined,
      businessHours: this.schedules().map((s) => ({
        id: s.id!,
        dayOfWeek: s.dayOfWeek,
        startTime: s.isClosed ? null : s.startTime,
        endTime: s.isClosed ? null : s.endTime,
        isClosed: s.isClosed,
      })),
    };

    this.businessService
      .updateBusinessWithHours(
        request,
        this.logoFile() || undefined,
        this.bannerFile() || undefined,
      )
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.showSuccess('Información del negocio actualizada exitosamente');
          this.logoFile.set(null);
          this.bannerFile.set(null);
          this.loadData();
        },
        error: (err) => {
          this.isSaving.set(false);
          this.showError(err.error?.message || 'Error al guardar la información del negocio');
        },
      });
  }

  private showSuccess(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: 'success-snackbar',
    });
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 4000,
      panelClass: 'error-snackbar',
    });
  }
}
