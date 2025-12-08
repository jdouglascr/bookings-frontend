import { Component, inject, signal, computed, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { BusinessService } from '../../../core/services/business.service';
import { BusinessWithHoursUpdateRequest } from '../../../models/private-api.models';
import { AvailableTimesSelector } from '../../components/available-times-selector/available-times-selector';
import { DaySchedule } from '../../../models/frontend.models';
import { toSignal } from '@angular/core/rxjs-interop';
import { PhoneInputComponent } from '../../../shared/components/phone-input/phone-input';
import { ImageInput } from '../../../shared/components/image-input/image-input';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-business-page',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    AvailableTimesSelector,
    PhoneInputComponent,
    ImageInput,
  ],
  templateUrl: './business-page.html',
  styleUrl: './business-page.scss',
})
export class BusinessPage {
  private fb = inject(FormBuilder);
  private businessService = inject(BusinessService);
  private notification = inject(NotificationService);

  logoInput = viewChild<ImageInput>('logoInput');
  bannerInput = viewChild<ImageInput>('bannerInput');

  isLoading = computed(() => this.businessService.isPrivateLoading());
  isSaving = signal(false);

  logoFile = signal<File | null>(null);
  bannerFile = signal<File | null>(null);
  private currentLogoUrl = signal<string | null>(null);
  private currentBannerUrl = signal<string | null>(null);

  schedules = signal<DaySchedule[]>([]);

  businessForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
    description: ['', Validators.required],
    address: ['', [Validators.required, Validators.maxLength(255)]],
    phone: ['', [Validators.required, Validators.pattern(/^\+56[0-9]{9}$/)]],
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
        this.businessForm.patchValue({
          name: data.name,
          description: data.description,
          address: data.address,
          phone: data.phone,
          email: data.email,
          facebookUrl: data.facebookUrl || '',
          instagramUrl: data.instagramUrl || '',
          tiktokUrl: data.tiktokUrl || '',
        });

        setTimeout(() => {
          if (data.logoUrl) {
            this.logoInput()?.setPreview(data.logoUrl);
            this.currentLogoUrl.set(data.logoUrl);
          }
          if (data.bannerUrl) {
            this.bannerInput()?.setPreview(data.bannerUrl);
            this.currentBannerUrl.set(data.bannerUrl);
          }
        });

        const mappedSchedules: DaySchedule[] = data.businessHours.map((hour) => ({
          id: hour.id,
          dayOfWeek: hour.dayOfWeek,
          startTime: hour.startTime || '',
          endTime: hour.endTime || '',
          isClosed: hour.isClosed,
        }));

        this.schedules.set(mappedSchedules);
      },
      error: (err) =>
        this.notification.error(err.error?.message || 'Error al cargar la información'),
    });
  }

  onSchedulesChange(updatedSchedules: DaySchedule[]): void {
    this.schedules.set(updatedSchedules);
  }

  onLogoChange(file: File): void {
    this.logoFile.set(file);
  }

  onBannerChange(file: File): void {
    this.bannerFile.set(file);
  }

  saveBusiness() {
    if (!this.businessForm.valid) return;

    this.isSaving.set(true);

    const formValue = this.businessForm.value;

    const request: BusinessWithHoursUpdateRequest = {
      name: formValue.name || '',
      description: formValue.description || '',
      address: formValue.address || '',
      phone: formValue.phone || '',
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
          this.notification.success('Información del negocio actualizada exitosamente');
          this.logoFile.set(null);
          this.bannerFile.set(null);
          this.loadData();
        },
        error: (err) => {
          this.isSaving.set(false);
          this.notification.error(
            err.error?.message || 'Error al guardar la información del negocio',
          );

          this.restoreImages();
          this.logoFile.set(null);
          this.bannerFile.set(null);
        },
      });
  }

  private restoreImages(): void {
    setTimeout(() => {
      if (this.currentLogoUrl()) {
        this.logoInput()?.setPreview(this.currentLogoUrl()!);
      }
      if (this.currentBannerUrl()) {
        this.bannerInput()?.setPreview(this.currentBannerUrl()!);
      }
    }, 100);
  }
}
