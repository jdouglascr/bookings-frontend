import { Component, inject, signal, OnInit, viewChild, computed, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { ResourcesService } from '../../../core/services/resources.service';
import { UserService } from '../../../core/services/user.service';
import { ServicesService } from '../../../core/services/services.service';
import { ResourceRequest, ServiceResponse } from '../../../models/private-api.models';
import { ImageInput } from '../../../shared/components/image-input/image-input';
import { PriceFormatterService } from '../../../core/services/prices-formatter.service';

interface GroupedServices {
  categoryName: string;
  services: ServiceResponse[];
}

@Component({
  selector: 'app-resource-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    ImageInput,
  ],
  templateUrl: './resource-dialog.html',
  styleUrl: './resource-dialog.scss',
})
export class ResourceDialog implements OnInit, AfterViewInit {
  private fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<ResourceDialog>);
  private readonly resourcesService = inject(ResourcesService);
  private readonly userService = inject(UserService);
  private readonly servicesService = inject(ServicesService);
  private readonly priceFormatter = inject(PriceFormatterService);

  resourceId = inject<number | undefined>(MAT_DIALOG_DATA);
  imageInput = viewChild<ImageInput>('imageInput');

  isEdit = signal(false);
  isSaving = signal(false);
  isLoadingResource = signal(false);
  selectedImage = signal<File | null>(null);

  users = this.userService.users;
  services = this.servicesService.services;
  isLoadingServices = computed(() => this.servicesService.isLoading());

  groupedServices = computed(() => {
    const servicesData = this.services();
    const grouped = new Map<string, ServiceResponse[]>();

    servicesData.forEach((service) => {
      const category = service.categoryName;
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(service);
    });

    return Array.from(grouped.entries()).map(([categoryName, services]) => ({
      categoryName,
      services,
    }));
  });

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      resourceType: ['Profesional', [Validators.required]],
      userId: ['', [Validators.required]],
      description: ['', [Validators.maxLength(500)]],
      serviceIds: [[], [Validators.required]],
    });

    if (this.resourceId) {
      this.isEdit.set(true);
    }
  }

  ngOnInit() {
    this.userService.loadUsers().subscribe();
    this.servicesService.privateLoadServices().subscribe();
  }

  ngAfterViewInit() {
    if (this.isEdit()) {
      setTimeout(() => this.loadResource(), 0);
    }
  }

  loadResource() {
    this.isLoadingResource.set(true);
    const resource = this.resourcesService.privateResources().find((r) => r.id === this.resourceId);

    if (resource) {
      this.form.patchValue({
        name: resource.name,
        resourceType: resource.resourceType,
        userId: resource.userId,
        description: resource.description || 'Sin descripción',
        serviceIds: resource.services.map((s) => s.id),
      });

      if (resource.imageUrl && this.imageInput()) {
        this.imageInput()!.setPreview(resource.imageUrl);
      }

      this.isLoadingResource.set(false);
    } else {
      this.resourcesService.getAllResources().subscribe({
        next: () => {
          const foundResource = this.resourcesService.privateResources().find((r) => r.id === this.resourceId);
          if (foundResource) {
            this.form.patchValue({
              name: foundResource.name,
              resourceType: foundResource.resourceType,
              userId: foundResource.userId,
              description: foundResource.description || '',
              serviceIds: foundResource.services.map((s) => s.id),
            });

            if (foundResource.imageUrl && this.imageInput()) {
              this.imageInput()!.setPreview(foundResource.imageUrl);
            }
          }
          this.isLoadingResource.set(false);
        },
        error: () => this.isLoadingResource.set(false),
      });
    }
  }

  onImageChange(file: File): void {
    this.selectedImage.set(file);
  }

  isServiceSelected(serviceId: number): boolean {
    const ids = this.form.get('serviceIds')?.value || [];
    return ids.includes(serviceId);
  }

  toggleService(serviceId: number): void {
    const currentIds = this.form.get('serviceIds')?.value || [];
    const newIds = currentIds.includes(serviceId) ? currentIds.filter((id: number) => id !== serviceId) : [...currentIds, serviceId];
    this.form.patchValue({ serviceIds: newIds });
  }

  isCategoryFullySelected(category: GroupedServices): boolean {
    const currentIds = this.form.get('serviceIds')?.value || [];
    return category.services.every((s) => currentIds.includes(s.id));
  }

  toggleCategoryServices(category: GroupedServices): void {
    const currentIds = this.form.get('serviceIds')?.value || [];
    const categoryServiceIds = category.services.map((s) => s.id);

    if (this.isCategoryFullySelected(category)) {
      const newIds = currentIds.filter((id: number) => !categoryServiceIds.includes(id));
      this.form.patchValue({ serviceIds: newIds });
    } else {
      const newIds = [...new Set([...currentIds, ...categoryServiceIds])];
      this.form.patchValue({ serviceIds: newIds });
    }
  }

  formatPrice(price: number): string {
    return this.priceFormatter.format(price);
  }

  onSubmit() {
    if (this.form.invalid) return;

    if (!this.isEdit() && !this.selectedImage()) {
      return;
    }

    this.isSaving.set(true);
    const formValue = this.form.getRawValue();

    const request: ResourceRequest = {
      userId: formValue.userId,
      name: formValue.name,
      resourceType: formValue.resourceType,
      description: formValue.description || undefined,
      serviceIds: formValue.serviceIds,
    };

    const operation = this.isEdit()
      ? this.resourcesService.updateResource(this.resourceId!, request, this.selectedImage() || undefined)
      : this.resourcesService.createResource(request, this.selectedImage()!);

    operation.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.isSaving.set(false);
        console.error('Error al guardar recurso:', err);
      },
    });
  }
}
