import { Component, input, signal, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export type ImageInputType = 'logo' | 'banner' | 'profile' | 'general';

@Component({
  selector: 'app-image-input',
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="image-upload-section">
      @if (label()) {
        <label class="image-label" [attr.for]="inputId()">{{ label() }}</label>
      }

      <div
        class="image-dropzone"
        [class.logo]="imageType() === 'logo'"
        [class.banner]="imageType() === 'banner'"
        [class.profile]="imageType() === 'profile'"
        role="button"
        tabindex="0"
        (click)="fileInput.click()"
        (keydown.enter)="fileInput.click()"
        (keydown.space)="$event.preventDefault(); fileInput.click()"
        [attr.aria-label]="'Cambiar ' + label()"
      >
        @if (preview()) {
          <div class="image-preview">
            <img [src]="preview()" [alt]="label() || 'Imagen'" />
            <div class="image-overlay">
              <button
                type="button"
                mat-icon-button
                class="change-image-btn"
                (click)="$event.stopPropagation(); fileInput.click()"
                [attr.aria-label]="'Cambiar ' + label()"
              >
                <mat-icon>edit</mat-icon>
              </button>
            </div>
          </div>
        }
      </div>

      <input
        #fileInput
        [id]="inputId()"
        type="file"
        [accept]="accept()"
        hidden
        (change)="onFileSelected($event)"
        [attr.aria-label]="'Seleccionar ' + label()"
      />
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .image-upload-section {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .image-label {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--gray-text-darker, #333);
      }

      .image-dropzone {
        position: relative;
        width: 100%;
        border: 2px dashed var(--gray-border-dark, #ccc);
        border-radius: 12px;
        background-color: var(--color-primary-soft, #f9f9f9);
        cursor: pointer;
        overflow: hidden;
        transition: all 0.2s ease;

        &:hover,
        &:focus-visible {
          border-color: var(--gray-text-darker, #666);
          background-color: var(--gray-border, #e0e0e0);
        }

        &:focus-visible {
          outline: 2px solid var(--color-secondary, #007bff);
          outline-offset: 2px;
        }

        &.logo {
          width: 300px;
          height: 300px;
        }

        &.banner {
          aspect-ratio: 16 / 9;
          height: 300px;
        }

        &.profile {
          width: 200px;
          height: 200px;
          border-radius: 50%;
        }

        &.general {
          aspect-ratio: 4 / 3;
          max-height: 400px;
        }
      }

      .image-preview {
        position: relative;
        width: 100%;
        height: 100%;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .image-overlay {
          position: absolute;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
      }

      .image-dropzone:hover .image-overlay {
        opacity: 1;
      }

      .change-image-btn {
        background-color: var(--color-primary, white) !important;
        color: var(--gray-text-darker, #333) !important;

        &:hover {
          background-color: var(--color-primary-soft, #f0f0f0) !important;
        }

        .mat-icon {
          font-size: 24px;
          width: 24px;
          height: 24px;
        }
      }

      @media (max-width: 768px) {
        .image-dropzone {
          &.logo {
            width: 100%;
            height: auto;
            aspect-ratio: 1;
          }

          &.banner {
            width: 100%;
            height: auto;
          }

          &.profile {
            width: 150px;
            height: 150px;
          }
        }
      }
    `,
  ],
})
export class ImageInput {
  label = input<string>('');
  imageType = input<ImageInputType>('general');
  accept = input<string>('image/*');

  fileChange = output<File>();
  preview = signal<string>('');
  inputId = signal(`image-input-${Math.random().toString(36).substring(2, 11)}`);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.preview.set(e.target?.result as string);
      this.fileChange.emit(file);
    };
    reader.readAsDataURL(file);

    input.value = '';
  }

  setPreview(url: string): void {
    this.preview.set(url);
  }
}
