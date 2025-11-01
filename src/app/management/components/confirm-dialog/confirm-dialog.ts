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
    <div class="dialog-header">
      <h2 mat-dialog-title>{{ data.title }}</h2>
      <button mat-icon-button mat-dialog-close class="close-btn">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content class="dialog-content-wrapper">
      <div class="confirm-dialog-content">
        <div class="dialog-icon">
          <mat-icon>warning</mat-icon>
        </div>
        <p>{{ data.message }}</p>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions class="dialog-actions">
      <button mat-button [mat-dialog-close]="false" class="cancel-btn">
        {{ data.cancelText || 'Cancelar' }}
      </button>
      <button mat-flat-button color="primary" class="confirm-btn" [mat-dialog-close]="true">
        {{ data.confirmText || 'Confirmar' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .confirm-dialog-content {
      text-align: center;
      padding-top: 0;
      padding-bottom: 20px;
    }

    .dialog-icon {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 20px;

      mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: var(--color-warning);
      }
    }

    @media (max-width: 768px) {
      .confirm-dialog-content {
        padding-bottom: 16px;
      }

      .dialog-icon {
        margin-bottom: 16px;

        mat-icon {
          font-size: 56px;
          width: 56px;
          height: 56px;
        }
      }
    }

    @media (max-width: 480px) {
      .dialog-icon {
        mat-icon {
          font-size: 48px;
          width: 48px;
          height: 48px;
        }
      }
    }
  `,
})
export class ConfirmDialog {
  data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
}
