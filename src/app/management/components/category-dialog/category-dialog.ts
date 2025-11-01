import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { CategoriesService } from '../../../core/services/categories.service';
import { CategoryResponse } from '../../../models/admin-api.models';

@Component({
  selector: 'app-category-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>{{ isEdit() ? 'Editar' : 'Crear' }} categoría</h2>
      <button mat-icon-button mat-dialog-close class="close-btn">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content class="dialog-content-wrapper">
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nombre de la categoría</mat-label>
          <input matInput formControlName="name" />
          @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
            <mat-error>El nombre es obligatorio</mat-error>
          }
          @if (form.get('name')?.hasError('minlength')) {
            <mat-error>El nombre debe tener al menos 2 caracteres</mat-error>
          }
          @if (form.get('name')?.hasError('maxlength')) {
            <mat-error>El nombre no puede exceder 255 caracteres</mat-error>
          }
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions class="dialog-actions">
      <button mat-button mat-dialog-close class="cancel-btn">Cancelar</button>
      <button
        mat-flat-button
        color="primary"
        class="submit-btn"
        (click)="onSubmit()"
        [disabled]="form.invalid || isSaving()"
      >
        @if (isSaving()) {
          <mat-icon class="material-spinner">hourglass_empty</mat-icon>
        }
        {{ isEdit() ? 'Actualizar' : 'Crear' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: ``,
})
export class CategoryDialog {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CategoryDialog>);
  private categoryService = inject(CategoriesService);
  data = inject<CategoryResponse | undefined>(MAT_DIALOG_DATA);

  isEdit = signal(!!this.data);
  isSaving = signal(false);

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      name: [
        this.data?.name || '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(255)],
      ],
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.isSaving.set(true);
    const request = this.form.value;

    const operation = this.isEdit()
      ? this.categoryService.updateCategory(this.data!.id, request)
      : this.categoryService.createCategory(request);

    operation.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.isSaving.set(false);
        console.error('Error al guardar categoría:', err);
      },
    });
  }
}
