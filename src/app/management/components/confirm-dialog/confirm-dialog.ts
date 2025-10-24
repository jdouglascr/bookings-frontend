import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  imports: [MatButtonModule, MatDialogModule, MatIconModule],
  template: `
    <div class="confirm-dialog">
      <div class="dialog-icon">
        <mat-icon>warning</mat-icon>
      </div>
      <h2 mat-dialog-title>{{ data.title }}</h2>
      <mat-dialog-content>
        <p>{{ data.message }}</p>
      </mat-dialog-content>
      <mat-dialog-actions>
        <button mat-button [mat-dialog-close]="false" class="cancel-btn">
          {{ data.cancelText || 'Cancelar' }}
        </button>
        <button mat-flat-button class="confirm-btn" [mat-dialog-close]="true">
          {{ data.confirmText || 'Confirmar' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: `
    .confirm-dialog {
      text-align: center;
      padding: 1rem;
    }

    .dialog-icon {
      margin-bottom: 1rem;

      .mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: var(--color-warning);
      }
    }

    h2 {
      margin: 0 0 1rem 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--gray-text-titles);
    }

    mat-dialog-content {
      padding: 0 1rem 1.5rem;

      p {
        margin: 0;
        font-size: 1rem;
        color: var(--gray-text-medium);
        line-height: 1.5;
      }
    }

    mat-dialog-actions {
      padding: 0;
      display: flex;
      justify-content: center;
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

      .confirm-btn {
        border-radius: 10px !important;
        font-weight: 600 !important;
        padding: 10px 24px !important;
        background-color: var(--color-error) !important;
        color: white !important;
        box-shadow: 0 2px 8px rgba(226, 91, 91, 0.25) !important;
        transition: all 0.2s ease !important;

        &:hover {
          background-color: #c94444 !important;
          box-shadow: 0 4px 12px rgba(226, 91, 91, 0.35) !important;
          transform: translateY(-1px);
        }
      }
    }
  `,
})
export class ConfirmDialog {
  data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
}
