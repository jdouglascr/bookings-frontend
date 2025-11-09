import { Component, input, signal, inject, DestroyRef, OnInit, computed } from '@angular/core';
import { ControlValueAccessor, NgControl, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-password-input',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
  ],
  template: `
    <mat-form-field appearance="outline" class="full-width">
      <mat-label>{{ label() }}</mat-label>
      <input
        matInput
        [type]="showPassword() ? 'text' : 'password'"
        [formControl]="internalControl"
        [autocomplete]="autocomplete()"
      />
      @if (showToggle()) {
        <button mat-icon-button matIconSuffix type="button" (click)="toggleVisibility()">
          <mat-icon>{{ showPassword() ? 'visibility' : 'visibility_off' }}</mat-icon>
        </button>
      }
      @if (internalControl.hasError('required')) {
        <mat-error>La contraseña es obligatoria</mat-error>
      } @else if (internalControl.hasError('minlength')) {
        <mat-error>La contraseña debe tener al menos 6 caracteres</mat-error>
      }
    </mat-form-field>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .full-width {
        width: 100%;
      }
    `,
  ],
})
export class PasswordInputComponent implements ControlValueAccessor, OnInit {
  label = input<string>('Contraseña');
  autocomplete = input<string>('current-password');

  showPassword = signal(false);
  internalControl = new FormControl('');
  hasValue = signal(false);

  showToggle = computed(() => this.hasValue());

  private destroyRef = inject(DestroyRef);
  ngControl = inject(NgControl, { optional: true, self: true });

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onChange: (value: string) => void = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onTouched: () => void = () => {};

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }

    this.internalControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.hasValue.set((value?.length ?? 0) > 0);
        this.onChange(value || '');
      });

    this.internalControl.statusChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (this.internalControl.touched) {
        this.onTouched();
      }
    });
  }

  ngOnInit(): void {
    if (this.ngControl?.control) {
      this.internalControl.setValidators(this.ngControl.control.validator);
      this.ngControl.control.statusChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.syncErrors());
    }
  }

  syncErrors(): void {
    if (this.ngControl?.control) {
      this.internalControl.setErrors(this.ngControl.control.errors);
      if (this.ngControl.control.touched) {
        this.internalControl.markAsTouched();
      }
    }
  }

  toggleVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  writeValue(value: string): void {
    this.internalControl.setValue(value || '', { emitEvent: false });
    this.hasValue.set((value?.length ?? 0) > 0);
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.internalControl.disable({ emitEvent: false });
    } else {
      this.internalControl.enable({ emitEvent: false });
    }
  }
}
