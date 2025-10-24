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

    <mat-dialog-content>
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

    <mat-dialog-actions>
      <button mat-button mat-dialog-close class="cancel-btn">Cancelar</button>
      <button
        mat-flat-button
        color="primary"
        class="submit-btn"
        (click)="onSubmit()"
        [disabled]="form.invalid || isSaving()"
      >
        @if (isSaving()) {
          <mat-icon class="spinner">hourglass_empty</mat-icon>
        }
        {{ isEdit() ? 'Actualizar' : 'Crear' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.5rem 1.5rem 0;

      h2 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--gray-text-titles);
      }

      .close-btn {
        color: var(--gray-text-medium);
        border-radius: 8px !important;

        &:hover {
          background-color: var(--color-primary-soft);
        }
      }
    }

    mat-dialog-content {
      padding: 1.5rem;
      min-height: 120px;
    }

    .dialog-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .full-width {
      width: 100%;
    }

    ::ng-deep .dialog-form {
      .mat-mdc-form-field {
        .mdc-text-field {
          border-radius: 12px !important;
          background-color: var(--color-primary) !important;
        }

        .mdc-text-field--outlined .mdc-notched-outline {
          .mdc-notched-outline__leading,
          .mdc-notched-outline__notch,
          .mdc-notched-outline__trailing {
            border-color: var(--gray-border-dark) !important;
            border-width: 1.5px !important;
          }
        }

        .mdc-text-field--outlined:hover .mdc-notched-outline {
          .mdc-notched-outline__leading,
          .mdc-notched-outline__notch,
          .mdc-notched-outline__trailing {
            border-color: var(--gray-text-darker) !important;
          }
        }

        .mdc-text-field--outlined.mdc-text-field--focused .mdc-notched-outline {
          .mdc-notched-outline__leading,
          .mdc-notched-outline__notch,
          .mdc-notched-outline__trailing {
            border-color: var(--gray-text-darker) !important;
            border-width: 2px !important;
          }
        }

        .mat-mdc-form-field-infix {
          padding: 16px 16px !important;
          min-height: 56px !important;
        }

        .mat-mdc-input-element {
          padding: 0 !important;
          font-size: 15px !important;

          &::placeholder {
            color: var(--gray-text-light) !important;
            opacity: 1 !important;
          }
        }
      }
    }

    mat-dialog-actions {
      padding: 0 1.5rem 1.5rem;
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;

      .cancel-btn {
        border-radius: 10px !important;
        font-weight: 600 !important;
        padding: 10px 20px !important;
        color: var(--gray-text-darker) !important;
        transition: all 0.2s ease !important;

        &:hover {
          background-color: var(--color-primary-soft) !important;
        }
      }

      .submit-btn {
        border-radius: 10px !important;
        font-weight: 600 !important;
        padding: 10px 24px !important;
        background-color: var(--color-secondary) !important;
        color: white !important;
        box-shadow: 0 2px 8px rgba(41, 38, 41, 0.2) !important;
        transition: all 0.2s ease !important;

        &:hover:not(:disabled) {
          background-color: var(--color-secondary-hover) !important;
          box-shadow: 0 4px 12px rgba(41, 38, 41, 0.3) !important;
          transform: translateY(-1px);
        }

        &:disabled {
          background-color: var(--gray-border-dark) !important;
          color: var(--gray-text-light) !important;
          box-shadow: none !important;
          opacity: 0.6;
          cursor: not-allowed;
        }
      }
    }

    .spinner {
      animation: spin 1s linear infinite;
      font-size: 18px;
      width: 18px;
      height: 18px;
      margin-right: 0.5rem;
    }

    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  `,
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
